import { db } from './index';
import { appointment } from './schema';
import { eq, and, gte, lte, isNull } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export async function createAppointment(data: {
  studentId: string;
  teacherId: string;
  startTime: Date;
  endTime: Date;
  status?: string;
  notes?: string;
}) {
  const result = await db
    .insert(appointment)
    .values({ id: randomUUID(), ...data })
    .returning();
  return result[0];
}

export async function getAppointments(filters?: {
  studentId?: string;
  teacherId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const whereConditions = [isNull(appointment.deletedAt)];

  if (filters?.studentId) {
    whereConditions.push(eq(appointment.studentId, filters.studentId));
  }
  if (filters?.teacherId) {
    whereConditions.push(eq(appointment.teacherId, filters.teacherId));
  }
  if (filters?.status) {
    whereConditions.push(eq(appointment.status, filters.status));
  }
  if (filters?.startDate) {
    whereConditions.push(gte(appointment.startTime, filters.startDate));
  }
  if (filters?.endDate) {
    whereConditions.push(lte(appointment.startTime, filters.endDate));
  }

  return await db
    .select()
    .from(appointment)
    .where(and(...whereConditions));
}

export async function getAppointmentById(id: string) {
  const result = await db
    .select()
    .from(appointment)
    .where(and(eq(appointment.id, id), isNull(appointment.deletedAt)));
  return result[0];
}

export async function updateAppointment(
  id: string,
  data: { status?: string; notes?: string; punchInTime?: Date },
) {
  const result = await db.update(appointment).set(data).where(eq(appointment.id, id)).returning();
  return result[0];
}

export async function softDeleteAppointment(id: string) {
  const result = await db
    .update(appointment)
    .set({ deletedAt: new Date() })
    .where(eq(appointment.id, id))
    .returning();
  return result[0];
}
