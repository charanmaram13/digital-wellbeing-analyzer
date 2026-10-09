/**
 * Pure JavaScript Classification Engine
 * Classifies digital wellbeing status with transparent explanations.
 * NOTE: This classification is strictly behavioral guidance and is NOT a medical diagnosis.
 */

export const CLASSIFICATIONS = {
  BALANCED: {
    status: 'Balanced',
    badgeColor: 'emerald',
    description: 'Usage habits are within healthy bounds with solid goal adherence and minimal sleep interference.',
  },
  NEEDS_ATTENTION: {
    status: 'Needs Attention',
    badgeColor: 'amber',
    description: 'Emerging patterns such as occasional bedtime usage or category imbalance may impact focus or rest.',
  },
  HIGH_RISK_PATTERN: {
    status: 'High-Risk Pattern',
    badgeColor: 'rose',
    description: 'Consistent excessive screen time, late-night binging, or marathon sessions detected. Action recommended.',
  },
};

/**
 * Classifies wellbeing state based on score, detected patterns, and adherence.
 *
 * @param {Object} params
 * @param {number} params.score - Wellbeing score (0 - 100)
 * @param {Array} params.patterns - Array of detected patterns from patternDetector
 * @param {number} params.goalAdherencePercent - Percentage of days staying within goal (0 - 100)
 * @returns {Object} Transparent classification result with rationale
 */
export function classifyWellbeing({ score = 100, patterns = [], goalAdherencePercent = 100 }) {
  const highSeverityCount = patterns.filter((p) => p.severity === 'high').length;
  const mediumSeverityCount = patterns.filter((p) => p.severity === 'medium').length;

  let classification;
  const rationale = [];

  if (score < 50 || highSeverityCount >= 2 || (highSeverityCount >= 1 && mediumSeverityCount >= 2)) {
    classification = CLASSIFICATIONS.HIGH_RISK_PATTERN;
    if (score < 50) rationale.push(`Wellbeing score of ${score}/100 indicates significant digital strain.`);
    if (highSeverityCount > 0) rationale.push(`${highSeverityCount} high-severity behavioral pattern(s) identified.`);
    if (goalAdherencePercent < 40) rationale.push(`Goal adherence is at ${goalAdherencePercent}%.`);
  } else if (score < 75 || highSeverityCount === 1 || mediumSeverityCount >= 2 || goalAdherencePercent < 70) {
    classification = CLASSIFICATIONS.NEEDS_ATTENTION;
    if (score < 75) rationale.push(`Score of ${score}/100 suggests moderate room for improvement.`);
    if (mediumSeverityCount > 0) rationale.push(`${mediumSeverityCount} medium-severity alert(s) active.`);
    if (goalAdherencePercent < 70) rationale.push(`Goal met on only ${goalAdherencePercent}% of logged days.`);
  } else {
    classification = CLASSIFICATIONS.BALANCED;
    rationale.push(`Strong wellbeing score of ${score}/100 with consistent moderation.`);
    if (patterns.length === 0) rationale.push('No problematic usage patterns identified.');
    else rationale.push('Mild patterns detected are well within manageable boundaries.');
  }

  return {
    status: classification.status,
    badgeColor: classification.badgeColor,
    summary: classification.description,
    rationale,
    disclaimer: 'Informational behavioral index only. Does not constitute medical or psychological diagnosis.',
  };
}
