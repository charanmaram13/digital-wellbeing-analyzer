/**
 * Pure JavaScript Aggregation Engine
 * Independent of Express, Mongoose, and MongoDB.
 */

/**
 * Groups screen time records by calendar date (YYYY-MM-DD).
 * Computes total minutes, session count, category breakdown, and app breakdown for each day.
 */
export function aggregateByDay(records) {
  if (!Array.isArray(records) || records.length === 0) {
    return [];
  }

  const daysMap = new Map();

  for (const record of records) {
    const { date, durationMinutes = 0, sessionCount = 1, category = 'Other', applicationName = 'Unknown' } = record;
    if (!date) continue;

    if (!daysMap.has(date)) {
      daysMap.set(date, {
        date,
        totalMinutes: 0,
        sessionCount: 0,
        categories: {},
        applications: {},
        lateNightMinutes: 0,
      });
    }

    const dayData = daysMap.get(date);
    dayData.totalMinutes += durationMinutes;
    dayData.sessionCount += sessionCount;

    dayData.categories[category] = (dayData.categories[category] || 0) + durationMinutes;
    dayData.applications[applicationName] = (dayData.applications[applicationName] || 0) + durationMinutes;

    if (isRecordLateNight(record)) {
      dayData.lateNightMinutes += durationMinutes;
    }
  }

  // Sort chronologically ascending
  return Array.from(daysMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Aggregates records by application name.
 */
export function aggregateByApplication(records) {
  if (!Array.isArray(records) || records.length === 0) {
    return [];
  }

  const appMap = new Map();
  let totalTime = 0;

  for (const record of records) {
    const { applicationName = 'Unknown', durationMinutes = 0, category = 'Other' } = record;
    totalTime += durationMinutes;

    if (!appMap.has(applicationName)) {
      appMap.set(applicationName, {
        applicationName,
        category,
        totalMinutes: 0,
        sessionCount: 0,
      });
    }

    const item = appMap.get(applicationName);
    item.totalMinutes += durationMinutes;
    item.sessionCount += record.sessionCount || 1;
  }

  const result = Array.from(appMap.values()).map((app) => ({
    ...app,
    percentage: totalTime > 0 ? Number(((app.totalMinutes / totalTime) * 100).toFixed(1)) : 0,
  }));

  // Sort descending by duration
  return result.sort((a, b) => b.totalMinutes - a.totalMinutes);
}

/**
 * Aggregates records by category.
 */
export function aggregateByCategory(records) {
  if (!Array.isArray(records) || records.length === 0) {
    return [];
  }

  const catMap = new Map();
  let totalTime = 0;

  for (const record of records) {
    const { category = 'Other', durationMinutes = 0 } = record;
    totalTime += durationMinutes;

    if (!catMap.has(category)) {
      catMap.set(category, {
        category,
        totalMinutes: 0,
      });
    }

    catMap.get(category).totalMinutes += durationMinutes;
  }

  const result = Array.from(catMap.values()).map((cat) => ({
    ...cat,
    percentage: totalTime > 0 ? Number(((cat.totalMinutes / totalTime) * 100).toFixed(1)) : 0,
  }));

  return result.sort((a, b) => b.totalMinutes - a.totalMinutes);
}

/**
 * Helper to determine if a record's timestamp falls within late-night hours.
 * Default late-night definition: startTime >= 22:30 or startTime < 05:00.
 */
export function isRecordLateNight(record, bedtime = '23:00') {
  if (!record.startTime) return false;

  const [hours, minutes] = record.startTime.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return false;

  const recordTimeMinutes = hours * 60 + minutes;
  const [bedHours, bedMins] = bedtime.split(':').map(Number);
  const bedtimeMinutes = (isNaN(bedHours) ? 23 : bedHours) * 60 + (isNaN(bedMins) ? 0 : bedMins);

  // Consider late night if after bedtime or before 5 AM (300 mins)
  if (recordTimeMinutes >= bedtimeMinutes || recordTimeMinutes < 300) {
    return true;
  }

  return false;
}

/**
 * Calculates late-night usage sum across records.
 */
export function calculateLateNightUsage(records, bedtime = '23:00') {
  if (!Array.isArray(records) || records.length === 0) return 0;
  return records
    .filter((r) => isRecordLateNight(r, bedtime))
    .reduce((sum, r) => sum + (r.durationMinutes || 0), 0);
}

/**
 * Computes average daily minutes over active days or full days window.
 */
export function calculateDailyAverage(records, totalDaysInWindow = null) {
  if (!Array.isArray(records) || records.length === 0) return 0;

  const daily = aggregateByDay(records);
  if (daily.length === 0) return 0;

  const totalMinutes = daily.reduce((sum, d) => sum + d.totalMinutes, 0);
  const divisor = totalDaysInWindow && totalDaysInWindow > 0 ? totalDaysInWindow : daily.length;

  return Math.round(totalMinutes / divisor);
}
