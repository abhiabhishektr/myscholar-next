import { db } from './index';
import { subject } from './schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export async function createSubject(data: { name: string; description?: string }) {
  const result = await db
    .insert(subject)
    .values({ id: randomUUID(), ...data })
    .returning();
  return result[0];
}

export async function getAllSubjects() {
  return await db.select().from(subject);
}

export async function getSubjectById(id: string) {
  const result = await db.select().from(subject).where(eq(subject.id, id));
  return result[0];
}

export async function updateSubject(id: string, data: { name?: string; description?: string }) {
  const result = await db
    .update(subject)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(subject.id, id))
    .returning();
  return result[0];
}

export async function deleteSubject(id: string) {
  return await db.delete(subject).where(eq(subject.id, id));
}
