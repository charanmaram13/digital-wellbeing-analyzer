import { z } from 'zod';

export const startFocusSchema = z.object({
  body: z.object({
    plannedDurationMinutes: z.number().int().min(1).max(240).default(25),
    notes: z.string().trim().max(200).optional(),
  }),
});

export const updateFocusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
  }),
  body: z.object({
    actualDurationMinutes: z.number().int().min(0).max(240).optional(),
    status: z.enum(['in_progress', 'completed', 'cancelled']).optional(),
    notes: z.string().trim().max(200).optional(),
  }),
});
