import { aggregateByDay, aggregateByCategory, isRecordLateNight } from './aggregationEngine.js';

/**
 * Pure JavaScript Pattern Detection Engine
 * Detects problematic digital usage trends from raw and aggregated screen-time data.
 */
export function detectPatterns({
  records = [],
  settings = {},
  baselineComparison = null,
}) {
  const patterns = [];

  if (!records || records.length === 0) {
    return patterns;
  }

  const {
    dailyScreenTimeGoalMinutes = 360,
    bedtime = '23:00',
    longSessionThresholdMinutes = 90,
    lateNightThresholdMinutes = 45,
  } = settings;

  const dailyAggs = aggregateByDay(records);

  // 1. Goal Overrun Pattern
  const goalExceededDays = dailyAggs.filter((d) => d.totalMinutes > dailyScreenTimeGoalMinutes);
  if (goalExceededDays.length > 0) {
    const worstDay = [...goalExceededDays].sort((a, b) => b.totalMinutes - a.totalMinutes)[0];
    const avgOverage = Math.round(
      goalExceededDays.reduce((sum, d) => sum + (d.totalMinutes - dailyScreenTimeGoalMinutes), 0) /
        goalExceededDays.length
    );

    patterns.push({
      type: 'goal_overrun',
      severity: goalExceededDays.length >= 4 ? 'high' : 'medium',
      title: 'Daily Screen Time Exceeded',
      description: `Exceeded your daily target of ${Math.round(dailyScreenTimeGoalMinutes / 60)}h on ${
        goalExceededDays.length
      } of the last ${dailyAggs.length} days (avg overage: ${avgOverage} min). Peak on ${worstDay.date}: ${Math.round(
        worstDay.totalMinutes / 60
      )}h ${worstDay.totalMinutes % 60}m.`,
      metrics: {
        exceededDaysCount: goalExceededDays.length,
        totalDays: dailyAggs.length,
        avgOverageMinutes: avgOverage,
      },
    });
  }

  // 2. Late-Night Usage Pattern
  const lateNightRecords = records.filter((r) => isRecordLateNight(r, bedtime));
  const lateNightTotal = lateNightRecords.reduce((sum, r) => sum + r.durationMinutes, 0);

  if (lateNightTotal >= lateNightThresholdMinutes) {
    patterns.push({
      type: 'late_night_binge',
      severity: lateNightTotal > 120 ? 'high' : 'medium',
      title: 'Late-Night Activity Detected',
      description: `Accumulated ${lateNightTotal} minutes of usage past your bedtime (${bedtime}) across ${
        lateNightRecords.length
      } sessions, which can disrupt sleep cycles.`,
      metrics: {
        lateNightMinutes: lateNightTotal,
        sessionCount: lateNightRecords.length,
        threshold: lateNightThresholdMinutes,
      },
    });
  }

  // 3. Extended Long Session Pattern
  const longSessions = records.filter(
    (r) => r.durationMinutes >= longSessionThresholdMinutes
  );
  if (longSessions.length > 0) {
    const maxSession = [...longSessions].sort((a, b) => b.durationMinutes - a.durationMinutes)[0];
    patterns.push({
      type: 'extended_sessions',
      severity: longSessions.length >= 3 || maxSession.durationMinutes >= 180 ? 'high' : 'medium',
      title: 'Extended Unbroken Sessions',
      description: `Detected ${longSessions.length} continuous session(s) over ${longSessionThresholdMinutes} minutes without breaks, peak was ${maxSession.durationMinutes} min on ${maxSession.applicationName}.`,
      metrics: {
        longSessionsCount: longSessions.length,
        longestSessionMinutes: maxSession.durationMinutes,
        appName: maxSession.applicationName,
      },
    });
  }

  // 4. Category Over-Concentration
  const categoryAggs = aggregateByCategory(records);
  if (categoryAggs.length > 0 && categoryAggs[0].percentage >= 50) {
    const topCat = categoryAggs[0];
    patterns.push({
      type: 'category_monopoly',
      severity: topCat.percentage >= 65 ? 'high' : 'medium',
      title: `High ${topCat.category} Concentration`,
      description: `${topCat.category} consumes ${topCat.percentage}% of your total screen time (${Math.round(
        topCat.totalMinutes / 60
      )}h ${topCat.totalMinutes % 60}m). Consider diversifying device usage.`,
      metrics: {
        category: topCat.category,
        percentage: topCat.percentage,
        totalMinutes: topCat.totalMinutes,
      },
    });
  }

  // 5. Significant Baseline Increase
  if (
    baselineComparison &&
    baselineComparison.hasSufficientBaseline &&
    baselineComparison.percentageChange !== null &&
    baselineComparison.percentageChange >= 20
  ) {
    patterns.push({
      type: 'baseline_surge',
      severity: baselineComparison.percentageChange >= 40 ? 'high' : 'medium',
      title: 'Upward Screen Time Trajectory',
      description: `Screen time surged by ${baselineComparison.percentageChange}% compared to your prior period baseline (+${Math.round(
        baselineComparison.absoluteChange / 60
      )} hours).`,
      metrics: {
        percentageChange: baselineComparison.percentageChange,
        absoluteChangeMinutes: baselineComparison.absoluteChange,
      },
    });
  }

  // 6. Frequent App Switching (only evaluated if discrete timestamped session records exist)
  const timestampedRecords = records.filter((r) => r.startTime && r.endTime);
  if (timestampedRecords.length >= 8) {
    // Check if multiple short sessions (<10 min) exist within a tight window
    const shortBouts = timestampedRecords.filter((r) => r.durationMinutes <= 10);
    if (shortBouts.length >= 5) {
      patterns.push({
        type: 'rapid_context_switching',
        severity: 'low',
        title: 'Frequent Rapid App Switching',
        description: `Logged ${shortBouts.length} rapid app interactions under 10 minutes, indicating fragmented focus and potential digital restlessness.`,
        metrics: {
          shortBoutCount: shortBouts.length,
        },
      });
    }
  }

  return patterns;
}
