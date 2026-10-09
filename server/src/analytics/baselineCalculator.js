/**
 * Pure JavaScript Baseline Calculator
 * Compares comparable time windows (e.g. current 7 days vs previous 7 days).
 * Safely handles missing days, zero baselines, and insufficient historical data.
 */

/**
 * Compares current period metrics to historical baseline.
 * Never fabricates percentage increases when baseline is 0.
 */
export function computeBaselineComparison({ currentTotal, previousTotal, currentDaysCount = 7, previousDaysCount = 7 }) {
  const currentAvg = currentDaysCount > 0 ? Math.round(currentTotal / currentDaysCount) : 0;
  const previousAvg = previousDaysCount > 0 ? Math.round(previousTotal / previousDaysCount) : 0;
  const absoluteChange = currentTotal - previousTotal;

  let percentageChange = null;
  let status = 'neutral';

  if (previousTotal > 0) {
    percentageChange = Number((((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1));
    if (percentageChange > 5) status = 'increased';
    else if (percentageChange < -5) status = 'decreased';
  } else if (currentTotal > 0 && previousTotal === 0) {
    // Cannot compute percentage from 0
    percentageChange = null;
    status = 'new_usage';
  }

  const hasSufficientBaseline = previousDaysCount >= 3 && previousTotal > 0;

  return {
    currentTotal,
    previousTotal,
    currentAvg,
    previousAvg,
    absoluteChange,
    percentageChange, // null if baseline was 0
    status,
    hasSufficientBaseline,
  };
}

/**
 * Splits records into current window (last N days) and previous window (prior N days).
 */
export function splitIntoWindows(records, windowDays = 7, referenceDateStr = null) {
  if (!Array.isArray(records) || records.length === 0) {
    return { currentWindow: [], previousWindow: [] };
  }

  const refDate = referenceDateStr ? new Date(referenceDateStr) : new Date();
  
  // Format reference as YYYY-MM-DD
  const refIso = refDate.toISOString().split('T')[0];

  // Calculate cutoffs
  const currentStart = new Date(refDate);
  currentStart.setDate(currentStart.getDate() - (windowDays - 1));
  const currentStartStr = currentStart.toISOString().split('T')[0];

  const prevStart = new Date(currentStart);
  prevStart.setDate(prevStart.getDate() - windowDays);
  const prevStartStr = prevStart.toISOString().split('T')[0];

  const prevEnd = new Date(currentStart);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevEndStr = prevEnd.toISOString().split('T')[0];

  const currentWindow = records.filter((r) => r.date >= currentStartStr && r.date <= refIso);
  const previousWindow = records.filter((r) => r.date >= prevStartStr && r.date <= prevEndStr);

  return {
    currentWindow,
    previousWindow,
    currentWindowRange: { start: currentStartStr, end: refIso },
    previousWindowRange: { start: prevStartStr, end: prevEndStr },
  };
}
