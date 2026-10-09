import screenTimeRepository from '../repositories/screenTimeRepository.js';
import settingsRepository from '../repositories/settingsRepository.js';
import focusSessionRepository from '../repositories/focusSessionRepository.js';
import { calculateWellbeingScore } from '../analytics/scoreCalculator.js';
import { classifyWellbeing } from '../analytics/classificationEngine.js';
import { detectPatterns } from '../analytics/patternDetector.js';

export const wellbeingScoreService = {
  async getScore(userId, startDate = null, endDate = null) {
    const [settings, records] = await Promise.all([
      settingsRepository.findByUserId(userId),
      screenTimeRepository.findByUserAndDateRange(userId, startDate, endDate),
    ]);

    const completedFocusCount = await focusSessionRepository.countCompletedInRange(
      userId,
      startDate,
      endDate
    );

    const scoreResult = calculateWellbeingScore({
      records,
      settings,
      completedFocusCount,
    });

    const patterns = detectPatterns({ records, settings });
    const classification = classifyWellbeing({
      score: scoreResult.score,
      patterns,
      goalAdherencePercent: scoreResult.goalAdherencePercent,
    });

    return {
      ...scoreResult,
      classification,
      patterns,
    };
  },
};

export default wellbeingScoreService;
