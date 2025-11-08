import { db } from './index';
import { classAttendance, timetable, user, subject } from './schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export async function markClassAttendance(data: {
  teacherId: string;
  studentId: string;
  subjectId: string;
  timetableId?: string;
  classDate: Date;
  startTime: string; // "HH:MM"
  duration: '30min' | '1hr' | '1.5hr' | '2hr';
  notes?: string;
}) {
  const result = await db
    .insert(classAttendance)
    .values({ id: randomUUID(), ...data })
    .returning();
  return result[0];
}

export async function getClassAttendance(filters?: {
  teacherId?: string;
  studentId?: string;
  subjectId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const whereConditions = [];

  if (filters?.teacherId) {
    whereConditions.push(eq(classAttendance.teacherId, filters.teacherId));
  }
  if (filters?.studentId) {
    whereConditions.push(eq(classAttendance.studentId, filters.studentId));
  }
  if (filters?.subjectId) {
    whereConditions.push(eq(classAttendance.subjectId, filters.subjectId));
  }
  if (filters?.startDate) {
    whereConditions.push(gte(classAttendance.classDate, filters.startDate));
  }
  if (filters?.endDate) {
    whereConditions.push(lte(classAttendance.classDate, filters.endDate));
  }

  return await db
    .select({
      id: classAttendance.id,
      teacherId: classAttendance.teacherId,
      teacherName: user.name,
      studentId: classAttendance.studentId,
      studentName: sql<string>`student.name`,
      subjectId: classAttendance.subjectId,
      subjectName: subject.name,
      timetableId: classAttendance.timetableId,
      classDate: classAttendance.classDate,
      startTime: classAttendance.startTime,
      duration: classAttendance.duration,
      notes: classAttendance.notes,
      markedAt: classAttendance.markedAt,
      createdAt: classAttendance.createdAt,
    })
    .from(classAttendance)
    .leftJoin(user, eq(classAttendance.teacherId, user.id))
    .leftJoin(sql`${user} as student`, sql`${classAttendance.studentId} = student.id`)
    .leftJoin(subject, eq(classAttendance.subjectId, subject.id))
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .orderBy(desc(classAttendance.classDate));
}

export async function getClassAttendanceById(id: string) {
  const result = await db
    .select({
      id: classAttendance.id,
      teacherId: classAttendance.teacherId,
      teacherName: user.name,
      studentId: classAttendance.studentId,
      subjectId: classAttendance.subjectId,
      subjectName: subject.name,
      timetableId: classAttendance.timetableId,
      classDate: classAttendance.classDate,
      startTime: classAttendance.startTime,
      duration: classAttendance.duration,
      notes: classAttendance.notes,
      markedAt: classAttendance.markedAt,
    })
    .from(classAttendance)
    .leftJoin(user, eq(classAttendance.teacherId, user.id))
    .leftJoin(subject, eq(classAttendance.subjectId, subject.id))
    .where(eq(classAttendance.id, id));
  return result[0];
}

export async function getTeacherAttendanceStats(
  teacherId: string,
  startDate?: Date,
  endDate?: Date,
) {
  const whereConditions = [eq(classAttendance.teacherId, teacherId)];

  if (startDate) {
    whereConditions.push(gte(classAttendance.classDate, startDate));
  }
  if (endDate) {
    whereConditions.push(lte(classAttendance.classDate, endDate));
  }

  const result = await db
    .select({
      totalClasses: sql<number>`count(*)::int`,
      duration30min: sql<number>`count(case when ${classAttendance.duration} = '30min' then 1 end)::int`,
      duration1hr: sql<number>`count(case when ${classAttendance.duration} = '1hr' then 1 end)::int`,
      duration1_5hr: sql<number>`count(case when ${classAttendance.duration} = '1.5hr' then 1 end)::int`,
      duration2hr: sql<number>`count(case when ${classAttendance.duration} = '2hr' then 1 end)::int`,
    })
    .from(classAttendance)
    .where(and(...whereConditions));

  return result[0];
}

export async function getTodayScheduledClasses(teacherId: string) {
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }) as
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
    | 'Sunday';

  return await db
    .select({
      id: timetable.id,
      studentId: timetable.studentId,
      studentName: user.name,
      subjectId: timetable.subjectId,
      subjectName: subject.name,
      startTime: timetable.startTime,
      endTime: timetable.endTime,
      notes: timetable.notes,
    })
    .from(timetable)
    .leftJoin(user, eq(timetable.studentId, user.id))
    .leftJoin(subject, eq(timetable.subjectId, subject.id))
    .where(
      and(
        eq(timetable.teacherId, teacherId),
        eq(timetable.day, dayName),
        eq(timetable.isActive, true),
      ),
    );
}

export async function checkIfClassMarked(
  teacherId: string,
  studentId: string,
  subjectId: string,
  classDate: Date,
) {
  const startOfDay = new Date(classDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(classDate);
  endOfDay.setHours(23, 59, 59, 999);

  const result = await db
    .select()
    .from(classAttendance)
    .where(
      and(
        eq(classAttendance.teacherId, teacherId),
        eq(classAttendance.studentId, studentId),
        eq(classAttendance.subjectId, subjectId),
        gte(classAttendance.classDate, startOfDay),
        lte(classAttendance.classDate, endOfDay),
      ),
    );

  return result.length > 0 ? result[0] : null;
}
