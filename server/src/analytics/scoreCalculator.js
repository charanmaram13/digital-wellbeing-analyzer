import { aggregateByDay, isRecordLateNight } from './aggregationEngine.js';
import { classifyWellbeing } from './classificationEngine.js';

/**
 * Pure JavaScript Wellbeing Score Calculator
 *
 * Total Score = GoalAdherence (0-35) + LateNightPenalty (0-25) + SessionHealth (0-20) + FocusConsistency (0-20)
 * Scaled 0 to 100.
 */
export function calculateWellbeingScore({
  records = [],
  settings = {},
  completedFocusCount = 0,
}) {
  const {
    dailyScreenTimeGoalMinutes = 360,
    bedtime = '23:00',
    longSessionThresholdMinutes = 90,
  } = settings;

  if (!records || records.length === 0) {
    // Default fresh user score: neutral healthy baseline
    return {
      score: 100,
      classification: classifyWellbeing({ score: 100, patterns: [], goalAdherencePercent: 100 }),
      components: {
        goalAdherence: { points: 35, max: 35, description: 'No usage logged yet; target baseline.' },
        lateNight: { points: 25, max: 25, description: 'No late night screen time recorded.' },
        sessionHealth: { points: 20, max: 20, description: 'No long unbroken sessions recorded.' },
        focusConsistency: { points: 20, max: 20, description: 'Starting intentional baseline.' },
      },
      formulaSummary: 'Transparent 100-point composite: Goal Adherence (35) + Sleep Protection (25) + Session Health (20) + Focus Consistency (20)',
    };
  }

  const dailyAggs = aggregateByDay(records);
  const totalDays = dailyAggs.length;

  // 1. Goal Adherence (0 - 35 points)
  let daysWithinGoal = 0;
  let totalDailyRatio = 0;

  for (const day of dailyAggs) {
    if (day.totalMinutes <= dailyScreenTimeGoalMinutes) {
      daysWithinGoal++;
      totalDailyRatio += 1;
    } else {
      // ratio drops as overage increases
      const ratio = Math.max(0, 1 - (day.totalMinutes - dailyScreenTimeGoalMinutes) / dailyScreenTimeGoalMinutes);
      totalDailyRatio += ratio;
    }
  }

  const adherenceFraction = totalDays > 0 ? totalDailyRatio / totalDays : 1;
  const goalPoints = Math.round(adherenceFraction * 35);
  const goalAdherencePercent = totalDays > 0 ? Math.round((daysWithinGoal / totalDays) * 100) : 100;

  // 2. Late-Night Sleep Protection (0 - 25 points)
  const lateNightRecords = records.filter((r) => isRecordLateNight(r, bedtime));
  const totalLateNightMins = lateNightRecords.reduce((sum, r) => sum + r.durationMinutes, 0);

  let lateNightPoints = 25;
  if (totalLateNightMins > 0) {
    // Deduct 1 point per 10 minutes past bedtime in the window, clamped to 0
    const deduction = Math.min(25, Math.round(totalLateNightMins / 10));
    lateNightPoints = Math.max(0, 25 - deduction);
  }

  // 3. Session Health (0 - 20 points)
  const longSessions = records.filter((r) => r.durationMinutes >= longSessionThresholdMinutes);
  let sessionHealthPoints = 20;
  if (longSessions.length > 0) {
    // Deduct 4 points per marathon session
    sessionHealthPoints = Math.max(0, 20 - longSessions.length * 4);
  }

  // 4. Focus Consistency (0 - 20 points)
  // Base 10 points + 2 points per completed focus block (up to 20)
  const focusPoints = Math.min(20, 10 + completedFocusCount * 2);

  // Total
  const totalScore = Math.min(100, Math.max(0, goalPoints + lateNightPoints + sessionHealthPoints + focusPoints));

  return {
    score: totalScore,
    goalAdherencePercent,
    components: {
      goalAdherence: {
        points: goalPoints,
        max: 35,
        percentageMet: goalAdherencePercent,
        description: `Met daily goal on ${daysWithinGoal}/${totalDays} days (${goalAdherencePercent}% adherence).`,
      },
      lateNight: {
        points: lateNightPoints,
        max: 25,
        totalLateNightMinutes: totalLateNightMins,
        description:
          totalLateNightMins === 0
            ? 'Zero late-night minutes recorded.'
            : `${totalLateNightMins}m logged after bedtime (${bedtime}).`,
      },
      sessionHealth: {
        points: sessionHealthPoints,
        max: 20,
        longSessionCount: longSessions.length,
        description:
          longSessions.length === 0
            ? 'No continuous marathon sessions.'
            : `${longSessions.length} session(s) exceeded ${longSessionThresholdMinutes}m threshold.`,
      },
      focusConsistency: {
        points: focusPoints,
        max: 20,
        completedFocusCount,
        description: `${completedFocusCount} verified focus block(s) completed.`,
      },
    },
    formulaSummary:
      'Scoring Model: Goal Adherence (max 35) + Sleep Protection (max 25) + Session Health (max 20) + Focus Consistency (max 20).',
  };
}
