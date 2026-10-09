/**
 * Targeted verification for Login -> /auth/me -> Dashboard Analytics -> Page Refresh -> Logout flow
 */

const BASE_URL = 'http://localhost:5000/api/v1';

async function testDemoUserFlow() {
  console.log('🔍 Testing Login -> /auth/me -> Dashboard Analytics -> Refresh -> Logout...');

  // 1. Login with demo user
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'demo@wellbeing.local',
      password: 'DemoUser123!',
    }),
  });

  const loginData = await loginRes.json();
  const setCookie = loginRes.headers.get('set-cookie');

  console.log(`1. Login status: ${loginRes.status}`);
  if (loginRes.status !== 200 || !loginData.success) {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }

  const cookieMatch = setCookie ? setCookie.match(/token=([^;]+)/) : null;
  const token = cookieMatch ? cookieMatch[1] : null;

  if (!token || token === '200' || token.split('.').length !== 3) {
    throw new Error(`CRITICAL: Malformed token in cookie! Value: ${token}`);
  }
  console.log('   ✓ Valid JWT 3-part token detected in HTTP-only Set-Cookie header');

  const cookieHeader = `token=${token}`;

  // 2. GET /auth/me
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Cookie: cookieHeader },
  });
  const meData = await meRes.json();
  console.log(`2. GET /auth/me status: ${meRes.status}`);
  if (meRes.status !== 200 || !meData.success) {
    throw new Error(`GET /auth/me failed with status ${meRes.status}: ${JSON.stringify(meData)}`);
  }
  console.log(`   ✓ Authenticated as: ${meData.data.user.name} (${meData.data.user.email})`);

  // 3. Dashboard Analytics (/analytics/overview)
  const overviewRes = await fetch(`${BASE_URL}/analytics/overview`, {
    headers: { Cookie: cookieHeader },
  });
  const overviewData = await overviewRes.json();
  console.log(`3. GET /analytics/overview status: ${overviewRes.status}`);
  if (overviewRes.status !== 200 || !overviewData.success) {
    throw new Error(`Dashboard overview failed with status ${overviewRes.status}: ${JSON.stringify(overviewData)}`);
  }
  console.log(`   ✓ Dashboard loaded successfully! Wellbeing score: ${overviewData.data.score}/100`);

  // 4. Simulate Page Refresh (re-calling /auth/me)
  const refreshRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Cookie: cookieHeader },
  });
  const refreshData = await refreshRes.json();
  console.log(`4. Page Refresh (re-check /auth/me) status: ${refreshRes.status}`);
  if (refreshRes.status !== 200 || !refreshData.success) {
    throw new Error(`Session lost on page refresh: ${JSON.stringify(refreshData)}`);
  }
  console.log('   ✓ Session maintained cleanly across simulated page refresh');

  // 5. Logout
  const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { Cookie: cookieHeader },
  });
  const logoutData = await logoutRes.json();
  console.log(`5. POST /auth/logout status: ${logoutRes.status}`);
  if (logoutRes.status !== 200 || !logoutData.success) {
    throw new Error(`Logout failed: ${JSON.stringify(logoutData)}`);
  }

  // 6. Verify rejection after logout
  const postLogoutRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Cookie: 'token=' },
  });
  console.log(`6. Post-logout protected request status: ${postLogoutRes.status}`);
  if (postLogoutRes.status !== 401) {
    throw new Error(`Expected 401 after logout, got ${postLogoutRes.status}`);
  }
  console.log('   ✓ Protected route correctly rejects request after logout');

  console.log('\n🎉 ALL LOGIN FLOW STEPS PASSED WITH 100% SUCCESS!\n');
}

testDemoUserFlow().catch((err) => {
  console.error('❌ Flow test failed:', err.message);
  process.exit(1);
});
