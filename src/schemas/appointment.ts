import { z } from 'zod';

export const createAppointmentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  teacherId: z.string().min(1, 'Teacher ID is required'),
  startTime: z.string().datetime('Invalid start time'),
  endTime: z.string().datetime('Invalid end time'),
  status: z.string().optional().default('scheduled'),
  notes: z.string().optional(),
});

export type CreateAppointmentSchema = z.infer<typeof createAppointmentSchema>;

export const updateAppointmentSchema = z.object({
  status: z.string().optional(),
  notes: z.string().optional(),
  punchInTime: z.string().datetime().optional(),
});

export type UpdateAppointmentSchema = z.infer<typeof updateAppointmentSchema>;

export const queryAppointmentSchema = z.object({
  studentId: z.string().optional(),
  teacherId: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type QueryAppointmentSchema = z.infer<typeof queryAppointmentSchema>;
