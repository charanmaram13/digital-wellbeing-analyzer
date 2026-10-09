import screenTimeRepository from '../repositories/screenTimeRepository.js';
import settingsRepository from '../repositories/settingsRepository.js';
import focusSessionRepository from '../repositories/focusSessionRepository.js';
import {
  aggregateByDay,
  aggregateByApplication,
  aggregateByCategory,
  calculateLateNightUsage,
  calculateDailyAverage,
} from '../analytics/aggregationEngine.js';
import { splitIntoWindows, computeBaselineComparison } from '../analytics/baselineCalculator.js';
import { detectPatterns } from '../analytics/patternDetector.js';
import { calculateWellbeingScore } from '../analytics/scoreCalculator.js';
import { classifyWellbeing } from '../analytics/classificationEngine.js';

export const dashboardService = {
  async getOverview(userId) {
    const rawSettings = await settingsRepository.findByUserId(userId);
    const settings = {
      dailyScreenTimeGoalMinutes: 360,
      bedtime: '23:00',
      wakeTime: '07:00',
      longSessionThresholdMinutes: 90,
      lateNightThresholdMinutes: 45,
      ...(rawSettings && typeof rawSettings.toObject === 'function' ? rawSettings.toObject() : rawSettings),
    };

    const allRecords = await screenTimeRepository.findByUserAndDateRange(userId);

    const { currentWindow = [], previousWindow = [], currentWindowRange, previousWindowRange } =
      splitIntoWindows(allRecords, 7);

    const currentTotal = currentWindow.reduce((sum, r) => sum + (r.durationMinutes || 0), 0);
    const previousTotal = previousWindow.reduce((sum, r) => sum + (r.durationMinutes || 0), 0);

    const baselineComparison = computeBaselineComparison({
      currentTotal,
      previousTotal,
      currentDaysCount: 7,
      previousDaysCount: 7,
    });

    const dailyAggregates = aggregateByDay(currentWindow);
    const topApps = aggregateByApplication(currentWindow);
    const topCategories = aggregateByCategory(currentWindow);
    const lateNightMinutes = calculateLateNightUsage(currentWindow, settings.bedtime);
    const dailyAverageMinutes = calculateDailyAverage(currentWindow, 7);

    // Today's stats
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecords = currentWindow.filter((r) => r.date === todayStr);
    const todayMinutes = todayRecords.reduce((sum, r) => sum + (r.durationMinutes || 0), 0);

    // Focus sessions count
    const completedFocusCount = currentWindowRange?.start && currentWindowRange?.end
      ? await focusSessionRepository.countCompletedInRange(
          userId,
          currentWindowRange.start,
          currentWindowRange.end
        )
      : 0;

    // Patterns & Score
    const patterns = detectPatterns({
      records: currentWindow,
      settings,
      baselineComparison,
    });

    const scoreResult = calculateWellbeingScore({
      records: currentWindow,
      settings,
      completedFocusCount,
    });

    const classification = classifyWellbeing({
      score: scoreResult.score,
      patterns,
      goalAdherencePercent: scoreResult.goalAdherencePercent,
    });

    return {
      today: {
        date: todayStr,
        totalMinutes: todayMinutes,
        goalMinutes: settings.dailyScreenTimeGoalMinutes,
        isOverGoal: todayMinutes > settings.dailyScreenTimeGoalMinutes,
        progressPercent: Math.min(
          100,
          Math.round((todayMinutes / settings.dailyScreenTimeGoalMinutes) * 100)
        ),
      },
      dailyAverageMinutes,
      weekTotalMinutes: currentTotal,
      baselineComparison,
      currentWindowRange,
      previousWindowRange,
      topApps: topApps.slice(0, 5),
      topCategories,
      lateNightMinutes,
      patterns,
      score: scoreResult.score,
      scoreBreakdown: scoreResult.components,
      classification,
      settings: {
        dailyScreenTimeGoalMinutes: settings.dailyScreenTimeGoalMinutes,
        bedtime: settings.bedtime,
        wakeTime: settings.wakeTime,
        longSessionThresholdMinutes: settings.longSessionThresholdMinutes,
      },
      hasData: allRecords.length > 0,
      totalRecordsCount: allRecords.length,
    };
  },

  async getDailyAnalytics(userId, startDate, endDate) {
    const rawSettings = await settingsRepository.findByUserId(userId);
    const settings = {
      dailyScreenTimeGoalMinutes: 360,
      bedtime: '23:00',
      wakeTime: '07:00',
      longSessionThresholdMinutes: 90,
      lateNightThresholdMinutes: 45,
      ...(rawSettings && typeof rawSettings.toObject === 'function' ? rawSettings.toObject() : rawSettings),
    };
    const records = await screenTimeRepository.findByUserAndDateRange(userId, startDate, endDate);
    const dailyAggregates = aggregateByDay(records);

    return {
      dailyAggregates,
      goalMinutes: settings.dailyScreenTimeGoalMinutes,
    };
  },

  async getWeeklyAnalytics(userId) {
    const allRecords = await screenTimeRepository.findByUserAndDateRange(userId);
    const { currentWindow = [], previousWindow = [] } = splitIntoWindows(allRecords, 7);

    const currentDaily = aggregateByDay(currentWindow);
    const previousDaily = aggregateByDay(previousWindow);

    return {
      currentWeek: {
        totalMinutes: currentWindow.reduce((s, r) => s + (r.durationMinutes || 0), 0),
        daily: currentDaily,
      },
      previousWeek: {
        totalMinutes: previousWindow.reduce((s, r) => s + (r.durationMinutes || 0), 0),
        daily: previousDaily,
      },
    };
  },

  async getCategoryAnalytics(userId, startDate, endDate) {
    const records = await screenTimeRepository.findByUserAndDateRange(userId, startDate, endDate);
    return aggregateByCategory(records);
  },

  async getPatternAnalytics(userId) {
    const rawSettings = await settingsRepository.findByUserId(userId);
    const settings = {
      dailyScreenTimeGoalMinutes: 360,
      bedtime: '23:00',
      wakeTime: '07:00',
      longSessionThresholdMinutes: 90,
      lateNightThresholdMinutes: 45,
      ...(rawSettings && typeof rawSettings.toObject === 'function' ? rawSettings.toObject() : rawSettings),
    };
    const records = await screenTimeRepository.findByUserAndDateRange(userId);
    const { currentWindow = [], previousWindow = [] } = splitIntoWindows(records, 7);

    const baselineComparison = computeBaselineComparison({
      currentTotal: currentWindow.reduce((s, r) => s + (r.durationMinutes || 0), 0),
      previousTotal: previousWindow.reduce((s, r) => s + (r.durationMinutes || 0), 0),
    });

    return detectPatterns({
      records: currentWindow,
      settings,
      baselineComparison,
    });
  },
};

export default dashboardService;
