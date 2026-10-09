import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createGoalSchema = z.object({
  body: z.object({
    goalType: z.enum(['daily_limit', 'category_limit', 'focus_minutes']),
    category: z
      .enum([
        'Social',
        'Entertainment',
        'Productivity',
        'Gaming',
        'Communication',
        'Utilities',
        'Other',
      ])
      .optional()
      .nullable(),
    targetValue: z.number().int().min(1, 'Target value must be at least 1 minute'),
    startDate: z.string().regex(dateRegex, 'Start date must be YYYY-MM-DD'),
    endDate: z.string().regex(dateRegex, 'End date must be YYYY-MM-DD').optional().nullable(),
  }),
});

export const updateGoalSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
  }),
  body: z.object({
    targetValue: z.number().int().min(1).optional(),
    status: z.enum(['active', 'paused', 'completed']).optional(),
    endDate: z.string().regex(dateRegex).optional().nullable(),
  }),
});
