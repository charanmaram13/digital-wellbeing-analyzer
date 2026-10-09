import { z } from 'zod';

const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export const updateSettingsSchema = z.object({
  body: z.object({
    dailyScreenTimeGoalMinutes: z.number().int().min(30).max(1440).optional(),
    bedtime: z.string().regex(timeRegex, 'Bedtime must be HH:mm').optional(),
    wakeTime: z.string().regex(timeRegex, 'Wake time must be HH:mm').optional(),
    longSessionThresholdMinutes: z.number().int().min(15).max(720).optional(),
    lateNightThresholdMinutes: z.number().int().min(10).max(360).optional(),
    theme: z.enum(['dark', 'light', 'system']).optional(),
  }),
});
