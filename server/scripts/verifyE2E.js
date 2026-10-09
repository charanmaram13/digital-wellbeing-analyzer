/**
 * Comprehensive End-to-End Verification Script
 * Exercises the live server running on http://localhost:5000.
 */

const BASE_URL = 'http://localhost:5000/api/v1';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  // Extract set-cookie
  const setCookie = response.headers.get('set-cookie');

  return {
    status: response.status,
    headers: response.headers,
    setCookie,
    data,
  };
}

async function run() {
  console.log('🧪 Starting Full End-to-End Verification Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health Probe
    console.log('--- 1. Testing System Health Probe ---');
    const health = await request('/health');
    assert(health.status === 200, 'Health endpoint returns 200');
    assert(health.data.success === true, 'Health returns success: true');
    assert(health.data.data.status === 'healthy', 'System status is healthy');
    assert(health.data.data.services.database === 'connected', 'Database is connected');
    console.log(`     Database status: ${health.data.data.services.database}`);
    console.log(`     AI Provider: ${health.data.data.services.aiProvider}`);

    // 2. Registration & Authentication
    console.log('\n--- 2. Testing Registration & Session Persistence ---');
    const userAEmail = `e2e_user_a_${Date.now()}@example.com`;
    const regRes = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'User Alpha',
        email: userAEmail,
        password: 'Password123!',
      }),
    });
    assert(regRes.status === 201, 'User registered with status 201');
    assert(regRes.data.data.user.email === userAEmail, 'User profile returned with matching email');
    assert(regRes.setCookie && regRes.setCookie.includes('token='), 'Set-Cookie header sets auth token');

    const cookieMatch = regRes.setCookie.match(/token=([^;]+)/);
    const tokenA = cookieMatch ? cookieMatch[1] : '';
    const cookieHeaderA = `token=${tokenA}`;

    // Verify Session Persistence (/auth/me)
    const meRes = await request('/auth/me', {
      headers: { Cookie: cookieHeaderA },
    });
    assert(meRes.status === 200, 'Session persistence verified via /auth/me');
    assert(meRes.data.data.user.name === 'User Alpha', 'Authenticated user identity confirmed');

    // 3. User B Creation for Isolation Checks
    console.log('\n--- 3. Testing User Data Isolation & Security ---');
    const userBEmail = `e2e_user_b_${Date.now()}@example.com`;
    const regBRes = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'User Beta',
        email: userBEmail,
        password: 'Password123!',
      }),
    });
    const cookieMatchB = regBRes.setCookie.match(/token=([^;]+)/);
    const tokenB = cookieMatchB ? cookieMatchB[1] : '';
    const cookieHeaderB = `token=${tokenB}`;

    // 4. Screen-Time CRUD Operations (User A)
    console.log('\n--- 4. Testing Screen-Time CRUD Operations ---');
    const createRes = await request('/screen-time', {
      method: 'POST',
      headers: { Cookie: cookieHeaderA },
      body: JSON.stringify({
        applicationName: 'VS Code',
        category: 'Productivity',
        date: '2026-10-09',
        startTime: '10:00',
        endTime: '12:00',
        durationMinutes: 120,
        sessionCount: 1,
        source: 'manual',
        deviceIdentifier: 'Developer Laptop',
      }),
    });
    assert(createRes.status === 201, 'Record created with 201 Created');
    const recordId = createRes.data.data._id;
    assert(recordId != null, 'Record ID returned');

    // Read by ID
    const getRes = await request(`/screen-time/${recordId}`, {
      headers: { Cookie: cookieHeaderA },
    });
    assert(getRes.status === 200, 'Record retrieved successfully by ID');
    assert(getRes.data.data.durationMinutes === 120, 'Duration matches input');

    // User B Isolation Test (User B attempts to get User A's record)
    const getIsolationRes = await request(`/screen-time/${recordId}`, {
      headers: { Cookie: cookieHeaderB },
    });
    assert(getIsolationRes.status === 404, 'User B CANNOT access User A record (404 isolation enforced)');

    // Edit Record
    const updateRes = await request(`/screen-time/${recordId}`, {
      method: 'PATCH',
      headers: { Cookie: cookieHeaderA },
      body: JSON.stringify({
        durationMinutes: 150,
      }),
    });
    assert(updateRes.status === 200, 'Record updated successfully with 200');
    assert(updateRes.data.data.durationMinutes === 150, 'Duration updated to 150');

    // User B isolation on update
    const updateIsolationRes = await request(`/screen-time/${recordId}`, {
      method: 'PATCH',
      headers: { Cookie: cookieHeaderB },
      body: JSON.stringify({ durationMinutes: 999 }),
    });
    assert(updateIsolationRes.status === 404, 'User B CANNOT modify User A record (404 isolation enforced)');

    // 5. CSV Import & Duplicate Prevention
    console.log('\n--- 5. Testing CSV Import with Duplicate Detection ---');
    const testCSV = `applicationName,category,date,durationMinutes,startTime,endTime
Slack,Communication,2026-10-09,45,13:00,13:45
Figma,Productivity,2026-10-09,90,14:00,15:30
YouTube,Entertainment,2026-10-09,60,23:30,00:30
Slack,Communication,2026-10-09,45,13:00,13:45`; // duplicate inside file

    const importRes = await request('/screen-time/import', {
      method: 'POST',
      headers: { Cookie: cookieHeaderA },
      body: JSON.stringify({ csv: testCSV }),
    });
    assert(importRes.status === 200, 'CSV import request succeeded');
    assert(importRes.data.data.importedCount === 3, 'Imported exactly 3 non-duplicate rows');
    assert(importRes.data.data.rejectedCount === 1, 'Duplicate row flagged and reported');

    // Test second import to verify DB-level duplicate prevention
    const repeatImportRes = await request('/screen-time/import', {
      method: 'POST',
      headers: { Cookie: cookieHeaderA },
      body: JSON.stringify({ csv: `applicationName,category,date,durationMinutes,startTime\nSlack,Communication,2026-10-09,45,13:00` }),
    });
    assert(repeatImportRes.data.data.duplicateCount === 1, 'Pre-existing record in DB detected as duplicate');
    assert(repeatImportRes.data.data.importedCount === 0, 'No double-counting on re-import');

    // 6. CSV Export
    console.log('\n--- 6. Testing CSV Export ---');
    const exportRes = await request('/screen-time/export', {
      headers: { Cookie: cookieHeaderA },
    });
    assert(exportRes.status === 200, 'CSV export endpoint returned 200');
    assert(typeof exportRes.data === 'string', 'Export data is string CSV');
    assert(exportRes.data.includes('applicationName') && exportRes.data.includes('Figma'), 'Export CSV contains headers and data');

    // 7. Dashboard Metrics & Analytics Verification
    console.log('\n--- 7. Verifying Analytics & Dashboard Calculations ---');
    const overviewRes = await request('/analytics/overview', {
      headers: { Cookie: cookieHeaderA },
    });
    assert(overviewRes.status === 200, 'Analytics overview returned 200');
    const ov = overviewRes.data.data;
    assert(ov.hasData === true, 'Analytics confirms data present');
    assert(ov.score >= 0 && ov.score <= 100, `Wellbeing score within 0-100 (${ov.score})`);
    assert(ov.scoreBreakdown != null, 'Score breakdown present with components');
    assert(ov.classification != null, 'Classification present');
    assert(ov.topApps.length > 0, 'Top apps populated');
    assert(ov.topCategories.length > 0, 'Categories populated');
    console.log(`     Wellbeing Score: ${ov.score}/100 (${ov.classification.status})`);
    console.log(`     Top App: ${ov.topApps[0].applicationName} (${ov.topApps[0].totalMinutes}m)`);
    console.log(`     Late Night Minutes: ${ov.lateNightMinutes}m`);

    // 8. AI Insights & Deterministic Fallback
    console.log('\n--- 8. Testing AI Insights Pipeline & Fallback ---');
    const insightRes = await request('/insights/generate', {
      method: 'POST',
      headers: { Cookie: cookieHeaderA },
    });
    assert(insightRes.status === 200, 'Insight generation returned 200');
    assert(insightRes.data.data.summary != null, 'Generated summary present');
    assert(insightRes.data.data.recommendations.length > 0, 'Recommendations present');
    assert(['gemini', 'rule_fallback'].includes(insightRes.data.data.source), `Valid insight source: ${insightRes.data.data.source}`);
    console.log(`     Insight Source: ${insightRes.data.data.source}`);
    console.log(`     Generated ${insightRes.data.data.recommendations.length} recommendations`);

    // Recommendation status update
    const recsListRes = await request('/recommendations', {
      headers: { Cookie: cookieHeaderA },
    });
    assert(recsListRes.status === 200, 'Recommendations list returned 200');
    if (recsListRes.data.data.length > 0) {
      const recId = recsListRes.data.data[0]._id;
      const recUpdateRes = await request(`/recommendations/${recId}`, {
        method: 'PATCH',
        headers: { Cookie: cookieHeaderA },
        body: JSON.stringify({ status: 'completed' }),
      });
      assert(recUpdateRes.status === 200, 'Recommendation status updated to completed');
      assert(recUpdateRes.data.data.status === 'completed', 'Verified status updated');
    }

    // 9. Goals & Focus Sessions
    console.log('\n--- 9. Testing Goals & Focus Sessions ---');
    const goalCreateRes = await request('/goals', {
      method: 'POST',
      headers: { Cookie: cookieHeaderA },
      body: JSON.stringify({
        goalType: 'daily_limit',
        targetValue: 300,
        startDate: '2026-10-09',
      }),
    });
    assert(goalCreateRes.status === 201, 'Goal created with 201');
    const goalId = goalCreateRes.data.data._id;

    const goalUpdateRes = await request(`/goals/${goalId}`, {
      method: 'PATCH',
      headers: { Cookie: cookieHeaderA },
      body: JSON.stringify({ targetValue: 280 }),
    });
    assert(goalUpdateRes.status === 200, 'Goal target updated to 280');

    // Focus Session
    const focusStartRes = await request('/focus-sessions', {
      method: 'POST',
      headers: { Cookie: cookieHeaderA },
      body: JSON.stringify({
        plannedDurationMinutes: 25,
        notes: 'Monotasking Sprint',
      }),
    });
    assert(focusStartRes.status === 201, 'Focus session started with 201');
    const focusId = focusStartRes.data.data._id;

    const focusCompleteRes = await request(`/focus-sessions/${focusId}`, {
      method: 'PATCH',
      headers: { Cookie: cookieHeaderA },
      body: JSON.stringify({
        actualDurationMinutes: 25,
        status: 'completed',
      }),
    });
    assert(focusCompleteRes.status === 200, 'Focus session completed with 200');
    assert(focusCompleteRes.data.data.status === 'completed', 'Verified completed status');

    // 10. Settings Configuration
    console.log('\n--- 10. Testing Settings Configuration ---');
    const settingsGetRes = await request('/settings', {
      headers: { Cookie: cookieHeaderA },
    });
    assert(settingsGetRes.status === 200, 'Settings retrieved with 200');

    const settingsPatchRes = await request('/settings', {
      method: 'PATCH',
      headers: { Cookie: cookieHeaderA },
      body: JSON.stringify({
        dailyScreenTimeGoalMinutes: 300,
        bedtime: '22:30',
      }),
    });
    assert(settingsPatchRes.status === 200, 'Settings updated with 200');
    assert(settingsPatchRes.data.data.dailyScreenTimeGoalMinutes === 300, 'Daily goal set to 300m');
    assert(settingsPatchRes.data.data.bedtime === '22:30', 'Bedtime updated to 22:30');

    // 11. Delete Record & Logout
    console.log('\n--- 11. Testing Delete & Logout ---');
    const deleteRes = await request(`/screen-time/${recordId}`, {
      method: 'DELETE',
      headers: { Cookie: cookieHeaderA },
    });
    assert(deleteRes.status === 200, 'Record deleted successfully');

    const logoutRes = await request('/auth/logout', {
      method: 'POST',
      headers: { Cookie: cookieHeaderA },
    });
    assert(logoutRes.status === 200, 'Logged out with 200');

    // Confirm that protected route rejects without cookie
    const unauthorizedRes = await request('/auth/me');
    assert(unauthorizedRes.status === 401, 'Protected route rejects unauthenticated request (401)');

    console.log(`\n==========================================`);
    console.log(`🏁 Complete Verification Finished!`);
    console.log(`   Passed: ${passed}`);
    console.log(`   Failed: ${failed}`);
    console.log(`==========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

run();
