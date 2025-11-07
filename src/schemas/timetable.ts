import { z } from 'zod';

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const createTimetableEntrySchema = z
  .object({
    studentId: z.string().min(1, 'Student ID is required'),
    teacherId: z.string().min(1, 'Teacher ID is required'),
    subjectId: z.string().min(1, 'Subject ID is required'),
    day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
    startTime: z.string().regex(timeRegex, 'Invalid time format. Use HH:MM'),
    endTime: z.string().regex(timeRegex, 'Invalid time format. Use HH:MM'),
    notes: z.string().optional(),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

export type CreateTimetableEntrySchema = z.infer<typeof createTimetableEntrySchema>;

export const updateTimetableEntrySchema = z.object({
  teacherId: z.string().optional(),
  subjectId: z.string().optional(),
  day: z
    .enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .optional(),
  startTime: z.string().regex(timeRegex, 'Invalid time format. Use HH:MM').optional(),
  endTime: z.string().regex(timeRegex, 'Invalid time format. Use HH:MM').optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateTimetableEntrySchema = z.infer<typeof updateTimetableEntrySchema>;

export const bulkCreateTimetableSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  entries: z
    .array(
      z.object({
        teacherId: z.string().min(1, 'Teacher ID is required'),
        subjectId: z.string().min(1, 'Subject ID is required'),
        day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
        startTime: z.string().regex(timeRegex, 'Invalid time format. Use HH:MM'),
        endTime: z.string().regex(timeRegex, 'Invalid time format. Use HH:MM'),
        notes: z.string().optional(),
      }),
    )
    .min(1, 'At least one entry is required'),
});

export type BulkCreateTimetableSchema = z.infer<typeof bulkCreateTimetableSchema>;

export const createSubjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Subject name is required')
    .max(100, 'Subject name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable(),
});

export type CreateSubjectSchema = z.infer<typeof createSubjectSchema>;
