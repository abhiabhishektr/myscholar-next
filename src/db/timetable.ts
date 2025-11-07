import { db } from './index';
import { timetable, subject, user } from './schema';
import { eq, and, isNull } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export async function createTimetableEntry(data: {
  studentId: string;
  teacherId: string;
  subjectId: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
  notes?: string;
}) {
  // Check for overlapping timetable entries for the same student on the same day
  const overlapping = await db
    .select()
    .from(timetable)
    .where(
      and(
        isNull(timetable.deletedAt),
        eq(timetable.studentId, data.studentId),
        eq(timetable.day, data.day),
        eq(timetable.isActive, true),
      ),
    );

  // Check for time conflicts
  const hasConflict = overlapping.some((entry) => {
    const existingStart = entry.startTime;
    const existingEnd = entry.endTime;
    const newStart = data.startTime;
    const newEnd = data.endTime;

    return (
      (newStart >= existingStart && newStart < existingEnd) ||
      (newEnd > existingStart && newEnd <= existingEnd) ||
      (newStart <= existingStart && newEnd >= existingEnd)
    );
  });

  if (hasConflict) {
    throw new Error('Timetable entry overlaps with an existing entry for this student on this day');
  }

  const result = await db
    .insert(timetable)
    .values({ id: randomUUID(), ...data })
    .returning();
  return result[0];
}

export async function getTimetableById(id: string) {
  const result = await db
    .select({
      id: timetable.id,
      studentId: timetable.studentId,
      teacherId: timetable.teacherId,
      subjectId: timetable.subjectId,
      subjectName: subject.name,
      day: timetable.day,
      startTime: timetable.startTime,
      endTime: timetable.endTime,
      isActive: timetable.isActive,
      notes: timetable.notes,
      createdAt: timetable.createdAt,
      updatedAt: timetable.updatedAt,
    })
    .from(timetable)
    .leftJoin(subject, eq(timetable.subjectId, subject.id))
    .where(and(eq(timetable.id, id), isNull(timetable.deletedAt)))
    .limit(1);
  return result[0];
}

export async function getTimetableByStudent(studentId: string) {
  return await db
    .select({
      id: timetable.id,
      studentId: timetable.studentId,
      teacherId: timetable.teacherId,
      subjectId: timetable.subjectId,
      subjectName: subject.name,
      teacherName: user.name,
      day: timetable.day,
      startTime: timetable.startTime,
      endTime: timetable.endTime,
      isActive: timetable.isActive,
      notes: timetable.notes,
      createdAt: timetable.createdAt,
    })
    .from(timetable)
    .leftJoin(subject, eq(timetable.subjectId, subject.id))
    .leftJoin(user, eq(timetable.teacherId, user.id))
    .where(
      and(
        eq(timetable.studentId, studentId),
        isNull(timetable.deletedAt),
        eq(timetable.isActive, true),
      ),
    )
    .orderBy(timetable.day, timetable.startTime);
}

export async function getTimetableByTeacher(teacherId: string) {
  return await db
    .select()
    .from(timetable)
    .leftJoin(subject, eq(timetable.subjectId, subject.id))
    .where(
      and(
        eq(timetable.teacherId, teacherId),
        isNull(timetable.deletedAt),
        eq(timetable.isActive, true),
      ),
    )
    .orderBy(timetable.day, timetable.startTime);
}

export async function updateTimetableEntry(
  id: string,
  data: {
    teacherId?: string;
    subjectId?: string;
    day?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    startTime?: string;
    endTime?: string;
    notes?: string;
    isActive?: boolean;
  },
) {
  const result = await db
    .update(timetable)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(timetable.id, id), isNull(timetable.deletedAt)))
    .returning();
  return result[0];
}

export async function softDeleteTimetableEntry(id: string) {
  const result = await db
    .update(timetable)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(timetable.id, id))
    .returning();
  return result[0];
}

export async function bulkCreateTimetable(
  studentId: string,
  entries: Array<{
    teacherId: string;
    subjectId: string;
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    startTime: string;
    endTime: string;
    notes?: string;
  }>,
) {
  // Check for overlaps within the submitted entries
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const entry1 = entries[i];
      const entry2 = entries[j];

      if (entry1.day === entry2.day) {
        const hasConflict =
          (entry1.startTime >= entry2.startTime && entry1.startTime < entry2.endTime) ||
          (entry1.endTime > entry2.startTime && entry1.endTime <= entry2.endTime) ||
          (entry1.startTime <= entry2.startTime && entry1.endTime >= entry2.endTime);

        if (hasConflict) {
          throw new Error(
            `Time conflict detected on ${entry1.day}: ${entry1.startTime}-${entry1.endTime} overlaps with ${entry2.startTime}-${entry2.endTime}`,
          );
        }
      }
    }
  }

  // Check for overlaps with existing entries
  for (const entry of entries) {
    const overlapping = await db
      .select()
      .from(timetable)
      .where(
        and(
          isNull(timetable.deletedAt),
          eq(timetable.studentId, studentId),
          eq(timetable.day, entry.day),
          eq(timetable.isActive, true),
        ),
      );

    const hasConflict = overlapping.some((existing) => {
      return (
        (entry.startTime >= existing.startTime && entry.startTime < existing.endTime) ||
        (entry.endTime > existing.startTime && entry.endTime <= existing.endTime) ||
        (entry.startTime <= existing.startTime && entry.endTime >= existing.endTime)
      );
    });

    if (hasConflict) {
      throw new Error(
        `Timetable entry on ${entry.day} at ${entry.startTime}-${entry.endTime} overlaps with an existing entry`,
      );
    }
  }

  const timetableEntries = entries.map((entry) => ({ id: randomUUID(), studentId, ...entry }));

  return await db.insert(timetable).values(timetableEntries).returning();
}
