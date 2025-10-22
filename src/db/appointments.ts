import { db } from './index';
import { appointment } from './schema';
import { eq } from 'drizzle-orm';
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

export async function getAppointments() {
  return await db.select().from(appointment);
}

export async function getAppointmentById(id: string) {
  const result = await db.select().from(appointment).where(eq(appointment.id, id));
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
