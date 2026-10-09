import { z } from 'zod';

const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createScreenTimeSchema = z.object({
  body: z.object({
    applicationName: z.string().trim().min(1, 'Application name is required'),
    category: z.enum([
      'Social',
      'Entertainment',
      'Productivity',
      'Gaming',
      'Communication',
      'Utilities',
      'Other',
    ]),
    date: z.string().regex(dateRegex, 'Date must be formatted as YYYY-MM-DD'),
    startTime: z.string().regex(timeRegex, 'Start time must be HH:mm').optional().nullable(),
    endTime: z.string().regex(timeRegex, 'End time must be HH:mm').optional().nullable(),
    durationMinutes: z.number().int().min(1).max(1440),
    sessionCount: z.number().int().min(1).default(1).optional(),
    source: z.enum(['manual', 'CSV', 'demo']).default('manual').optional(),
    deviceIdentifier: z.string().trim().optional(),
  }),
});

export const updateScreenTimeSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
  }),
  body: z.object({
    applicationName: z.string().trim().min(1).optional(),
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
      .optional(),
    date: z.string().regex(dateRegex).optional(),
    startTime: z.string().regex(timeRegex).optional().nullable(),
    endTime: z.string().regex(timeRegex).optional().nullable(),
    durationMinutes: z.number().int().min(1).max(1440).optional(),
    sessionCount: z.number().int().min(1).optional(),
    deviceIdentifier: z.string().trim().optional(),
  }),
});

export const queryScreenTimeSchema = z.object({
  query: z.object({
    startDate: z.string().regex(dateRegex).optional(),
    endDate: z.string().regex(dateRegex).optional(),
    category: z.string().optional(),
    source: z.string().optional(),
    page: z.string().transform((val) => parseInt(val, 10)).optional(),
    limit: z.string().transform((val) => parseInt(val, 10)).optional(),
  }),
});
