import { z } from 'zod';
import { generateGeminiInsights, isGeminiAvailable } from './geminiProvider.js';
import { buildInsightPrompt } from './promptTemplates.js';
import recommendationRepository from '../repositories/recommendationRepository.js';
import logger from '../utils/logger.js';

// Zod schema to validate structured AI output
const insightResponseSchema = z.object({
  summary: z.string().min(5),
  keyFindings: z.array(z.string()).min(1),
  recommendations: z.array(
    z.object({
      type: z.enum(['routine', 'boundary', 'focus', 'app_limit', 'bedtime_habit']),
      title: z.string().min(3),
      description: z.string().min(10),
      triggeringPattern: z.string().default('General Balance'),
    })
  ).min(1),
});

/**
 * Deterministic rule-based fallback when Gemini is unavailable or errors out.
 * Derived 100% from validated analytics calculations.
 */
export function generateRuleBasedInsights({
  score,
  classification,
  dailyAverageMinutes,
  goalMinutes,
  lateNightMinutes,
  patterns = [],
  topCategories = [],
  topApps = [],
}) {
  const findings = [];
  const recs = [];

  // Finding 1: Daily usage vs goal
  const dailyDiff = dailyAverageMinutes - goalMinutes;
  if (dailyDiff > 0) {
    findings.push(
      `Your daily average of ${dailyAverageMinutes}m exceeds your ${goalMinutes}m target by ${dailyDiff} minutes.`
    );
    recs.push({
      type: 'app_limit',
      title: `Institute a ${Math.round(goalMinutes / 60)}h Daily Ceiling`,
      description: `Implement an automatic reminder after ${goalMinutes} minutes of total screen time to prompt a transition away from screens.`,
      triggeringPattern: 'Daily Screen Time Exceeded',
    });
  } else {
    findings.push(
      `Your daily average of ${dailyAverageMinutes}m is within your healthy target of ${goalMinutes}m.`
    );
  }

  // Finding 2: Late-night usage
  if (lateNightMinutes > 30) {
    findings.push(
      `Logged ${lateNightMinutes} minutes of screen exposure during bedtime hours, reducing deep sleep quality.`
    );
    recs.push({
      type: 'bedtime_habit',
      title: 'Digital Curfew 45 Minutes Before Sleep',
      description: 'Switch all devices to grayscale or place phone outside the bedroom 45 minutes prior to bedtime.',
      triggeringPattern: 'Late-Night Activity Detected',
    });
  }

  // Finding 3: Top category concentration
  if (topCategories.length > 0) {
    const top = topCategories[0];
    findings.push(`${top.category} represents your largest digital commitment (${top.percentage}% of screen time).`);
    if (top.percentage > 45 && top.category !== 'Productivity') {
      recs.push({
        type: 'boundary',
        title: `Schedule Dedicated ${top.category} Windows`,
        description: `Rather than checking ${top.category} continuously throughout the day, designate two intentional 25-minute slots.`,
        triggeringPattern: `High ${top.category} Concentration`,
      });
    }
  }

  // Default focus recommendation if needed
  if (recs.length < 2) {
    recs.push({
      type: 'focus',
      title: 'Practice 25-Minute Monotasking Blocks',
      description: 'Use the built-in Focus Timer to work in uninterrupted 25-minute sprints with 5-minute offline breaks.',
      triggeringPattern: 'General Balance',
    });
  }

  const summary = `Your current Digital Wellbeing Score is ${score}/100 (${classification.status}). ${
    patterns.length > 0
      ? `We identified ${patterns.length} usage pattern(s) that offer clear opportunities for improvement.`
      : 'Your daily screen habits show solid intentionality and balanced pacing.'
  }`;

  return {
    source: 'rule_fallback',
    summary,
    keyFindings: findings,
    recommendations: recs.slice(0, 3),
  };
}

/**
 * Insight Service orchestrating Gemini calls and fallback.
 */
export async function generateUserInsights(userId, analyticsOverview) {
  const {
    score,
    classification,
    dailyAverageMinutes,
    settings,
    lateNightMinutes,
    topCategories,
    topApps,
    patterns,
    baselineComparison,
  } = analyticsOverview;

  const goalMinutes = settings?.dailyScreenTimeGoalMinutes || 360;

  let result = null;
  let source = 'rule_fallback';

  if (isGeminiAvailable()) {
    try {
      const prompt = buildInsightPrompt({
        score,
        classification,
        dailyAverageMinutes,
        goalMinutes,
        lateNightMinutes,
        topCategories,
        topApps,
        patterns,
        baselineChange: baselineComparison,
      });

      const rawAiResponse = await generateGeminiInsights(prompt);
      const validated = insightResponseSchema.safeParse(rawAiResponse);

      if (validated.success) {
        result = validated.data;
        source = 'gemini';
        logger.info(`Successfully generated AI insights using Gemini for user ${userId}`);
      } else {
        logger.warn('Gemini response failed schema validation. Falling back to rule engine.', validated.error);
      }
    } catch (err) {
      logger.warn(`Gemini generation failed: ${err.message}. Using rule-based fallback.`);
    }
  }

  // If Gemini failed or was unavailable, use deterministic fallback
  if (!result) {
    result = generateRuleBasedInsights({
      score,
      classification,
      dailyAverageMinutes,
      goalMinutes,
      lateNightMinutes,
      patterns,
      topCategories,
      topApps,
    });
    source = 'rule_fallback';
  }

  // Persist recommendations to database for user tracking
  try {
    const toInsert = result.recommendations.map((rec) => ({
      userId,
      type: rec.type,
      title: rec.title,
      description: rec.description,
      triggeringPattern: rec.triggeringPattern || 'General Balance',
      status: 'active',
    }));

    await recommendationRepository.insertMany(toInsert);
  } catch (err) {
    logger.warn('Failed to persist generated recommendations:', err.message);
  }

  return {
    source,
    ...result,
  };
}

export default { generateUserInsights, generateRuleBasedInsights };
