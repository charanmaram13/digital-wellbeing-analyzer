import { describe, it, expect } from 'vitest';
import {
  aggregateByDay,
  aggregateByApplication,
  aggregateByCategory,
  isRecordLateNight,
  calculateLateNightUsage,
  calculateDailyAverage,
} from '../src/analytics/aggregationEngine.js';
import {
  computeBaselineComparison,
  splitIntoWindows,
} from '../src/analytics/baselineCalculator.js';
import { detectPatterns } from '../src/analytics/patternDetector.js';
import { classifyWellbeing } from '../src/analytics/classificationEngine.js';
import { calculateWellbeingScore } from '../src/analytics/scoreCalculator.js';

describe('Analytics Aggregation Engine', () => {
  const sampleRecords = [
    {
      date: '2026-10-08',
      applicationName: 'VS Code',
      category: 'Productivity',
      durationMinutes: 120,
      startTime: '09:00',
      endTime: '11:00',
      sessionCount: 1,
    },
    {
      date: '2026-10-08',
      applicationName: 'YouTube',
      category: 'Entertainment',
      durationMinutes: 60,
      startTime: '23:15',
      endTime: '00:15',
      sessionCount: 1,
    },
    {
      date: '2026-10-09',
      applicationName: 'VS Code',
      category: 'Productivity',
      durationMinutes: 180,
      startTime: '10:00',
      endTime: '13:00',
      sessionCount: 1,
    },
    {
      date: '2026-10-09',
      applicationName: 'Instagram',
      category: 'Social',
      durationMinutes: 45,
      startTime: '14:00',
      endTime: '14:45',
      sessionCount: 1,
    },
  ];

  it('aggregates total minutes and counts by day accurately', () => {
    const daily = aggregateByDay(sampleRecords);
    expect(daily).toHaveLength(2);
    expect(daily[0].date).toBe('2026-10-08');
    expect(daily[0].totalMinutes).toBe(180);
    expect(daily[1].date).toBe('2026-10-09');
    expect(daily[1].totalMinutes).toBe(225);
  });

  it('aggregates usage by application with correct percentages', () => {
    const apps = aggregateByApplication(sampleRecords);
    expect(apps[0].applicationName).toBe('VS Code');
    expect(apps[0].totalMinutes).toBe(300);
    // 300 / 405 = 74.1%
    expect(apps[0].percentage).toBe(74.1);
  });

  it('aggregates by category properly', () => {
    const categories = aggregateByCategory(sampleRecords);
    expect(categories.find((c) => c.category === 'Productivity').totalMinutes).toBe(300);
    expect(categories.find((c) => c.category === 'Entertainment').totalMinutes).toBe(60);
    expect(categories.find((c) => c.category === 'Social').totalMinutes).toBe(45);
  });

  it('detects late night activity based on bedtime', () => {
    expect(isRecordLateNight({ startTime: '23:15' }, '23:00')).toBe(true);
    expect(isRecordLateNight({ startTime: '02:00' }, '23:00')).toBe(true);
    expect(isRecordLateNight({ startTime: '15:30' }, '23:00')).toBe(false);

    const lateTotal = calculateLateNightUsage(sampleRecords, '23:00');
    expect(lateTotal).toBe(60);
  });

  it('calculates daily average correctly', () => {
    const avg = calculateDailyAverage(sampleRecords);
    // (180 + 225) / 2 = 202.5 -> 203
    expect(avg).toBe(203);
  });
});

describe('Baseline Calculator', () => {
  it('computes valid percentage change when baseline > 0', () => {
    const res = computeBaselineComparison({
      currentTotal: 1200,
      previousTotal: 1000,
      currentDaysCount: 7,
      previousDaysCount: 7,
    });
    expect(res.percentageChange).toBe(20.0);
    expect(res.status).toBe('increased');
    expect(res.hasSufficientBaseline).toBe(true);
  });

  it('never fabricates percentage change when baseline is 0', () => {
    const res = computeBaselineComparison({
      currentTotal: 600,
      previousTotal: 0,
      currentDaysCount: 7,
      previousDaysCount: 0,
    });
    expect(res.percentageChange).toBeNull();
    expect(res.status).toBe('new_usage');
    expect(res.hasSufficientBaseline).toBe(false);
  });

  it('splitIntoWindows returns valid ranges and empty arrays for brand new user with 0 records', () => {
    const res = splitIntoWindows([], 7, '2026-10-10');
    expect(res.currentWindow).toEqual([]);
    expect(res.previousWindow).toEqual([]);
    expect(res.currentWindowRange).toBeDefined();
    expect(res.currentWindowRange.start).toBe('2026-10-04');
    expect(res.currentWindowRange.end).toBe('2026-10-10');
    expect(res.previousWindowRange).toBeDefined();
    expect(res.previousWindowRange.start).toBe('2026-09-27');
    expect(res.previousWindowRange.end).toBe('2026-10-03');
  });

  it('splitIntoWindows safely handles null or undefined records input without crashing', () => {
    const resNull = splitIntoWindows(null, 7, '2026-10-10');
    expect(resNull.currentWindow).toEqual([]);
    expect(resNull.previousWindow).toEqual([]);
    expect(resNull.currentWindowRange.start).toBe('2026-10-04');
    expect(resNull.currentWindowRange.end).toBe('2026-10-10');

    const resUndefined = splitIntoWindows(undefined, 7, '2026-10-10');
    expect(resUndefined.currentWindow).toEqual([]);
    expect(resUndefined.currentWindowRange.start).toBe('2026-10-04');
  });

  it('splitIntoWindows correctly partitions populated records into current and previous windows', () => {
    const records = [
      { date: '2026-10-10', durationMinutes: 60 },
      { date: '2026-10-05', durationMinutes: 45 },
      { date: '2026-10-02', durationMinutes: 90 },
      { date: '2026-09-20', durationMinutes: 30 }, // older than previous window
    ];
    const res = splitIntoWindows(records, 7, '2026-10-10');
    expect(res.currentWindow).toHaveLength(2);
    expect(res.previousWindow).toHaveLength(1);
    expect(res.currentWindow.map((r) => r.date)).toEqual(['2026-10-10', '2026-10-05']);
    expect(res.previousWindow[0].date).toBe('2026-10-02');
  });
});

describe('Pattern Detector', () => {
  it('detects goal overrun, late night, and long sessions', () => {
    const records = [
      {
        date: '2026-10-09',
        applicationName: 'Netflix',
        category: 'Entertainment',
        durationMinutes: 150, // exceeds long session threshold (90)
        startTime: '23:30', // late night past 23:00
      },
      {
        date: '2026-10-09',
        applicationName: 'Gaming',
        category: 'Gaming',
        durationMinutes: 250, // total day = 400 min > 300 min goal
        startTime: '18:00',
      },
    ];

    const patterns = detectPatterns({
      records,
      settings: {
        dailyScreenTimeGoalMinutes: 300,
        bedtime: '23:00',
        longSessionThresholdMinutes: 90,
        lateNightThresholdMinutes: 30,
      },
    });

    const types = patterns.map((p) => p.type);
    expect(types).toContain('goal_overrun');
    expect(types).toContain('late_night_binge');
    expect(types).toContain('extended_sessions');
  });
});

describe('Classification Engine', () => {
  it('returns High-Risk Pattern for low scores and critical patterns', () => {
    const result = classifyWellbeing({
      score: 42,
      patterns: [{ severity: 'high' }, { severity: 'high' }],
      goalAdherencePercent: 30,
    });
    expect(result.status).toBe('High-Risk Pattern');
    expect(result.rationale.length).toBeGreaterThan(0);
    expect(result.disclaimer).toBeDefined();
  });

  it('returns Balanced for high score and zero severe patterns', () => {
    const result = classifyWellbeing({
      score: 92,
      patterns: [],
      goalAdherencePercent: 100,
    });
    expect(result.status).toBe('Balanced');
  });
});

describe('Wellbeing Score Calculator', () => {
  it('calculates reproducible score with transparent breakdown', () => {
    const records = [
      {
        date: '2026-10-09',
        applicationName: 'Figma',
        category: 'Productivity',
        durationMinutes: 120,
        startTime: '10:00',
      },
    ];

    const result = calculateWellbeingScore({
      records,
      settings: {
        dailyScreenTimeGoalMinutes: 300,
        bedtime: '23:00',
        longSessionThresholdMinutes: 90,
      },
      completedFocusCount: 2,
    });

    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.components.goalAdherence.points).toBe(35);
    expect(result.components.lateNight.points).toBe(25);
    expect(result.components.focusConsistency.points).toBe(14); // 10 base + 2*2
    expect(result.formulaSummary).toBeDefined();
  });
});
