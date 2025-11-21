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

// Get missed classes by comparing scheduled timetable with attendance
export async function getMissedClasses(teacherId: string, startDate: Date, endDate: Date) {
  // Get all scheduled classes in the date range
  const scheduledClasses = await db
    .select({
      timetableId: timetable.id,
      teacherId: timetable.teacherId,
      teacherName: user.name,
      studentId: timetable.studentId,
      studentName: sql<string>`student.name`,
      subjectId: timetable.subjectId,
      subjectName: subject.name,
      day: timetable.day,
      startTime: timetable.startTime,
      endTime: timetable.endTime,
    })
    .from(timetable)
    .leftJoin(user, eq(timetable.teacherId, user.id))
    .leftJoin(sql`${user} as student`, sql`${timetable.studentId} = student.id`)
    .leftJoin(subject, eq(timetable.subjectId, subject.id))
    .where(and(eq(timetable.teacherId, teacherId), eq(timetable.isActive, true)));

  // Get all attendance records in the date range
  const attendanceRecords = await getClassAttendance({ teacherId, startDate, endDate });

  // Calculate which days fall in the date range
  const missedClasses = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }) as
      | 'Monday'
      | 'Tuesday'
      | 'Wednesday'
      | 'Thursday'
      | 'Friday'
      | 'Saturday'
      | 'Sunday';

    // Find classes scheduled for this day
    const daySchedule = scheduledClasses.filter((sc) => sc.day === dayName);

    for (const scheduledClass of daySchedule) {
      // Check if attendance was marked for this class on this date
      const attended = attendanceRecords.find(
        (att) =>
          att.studentId === scheduledClass.studentId &&
          att.subjectId === scheduledClass.subjectId &&
          new Date(att.classDate).toDateString() === currentDate.toDateString(),
      );

      if (!attended && currentDate < new Date()) {
        // Only mark as missed if the date has passed
        missedClasses.push({
          date: new Date(currentDate),
          dayName,
          teacherName: scheduledClass.teacherName,
          studentName: scheduledClass.studentName,
          subjectName: scheduledClass.subjectName,
          scheduledStartTime: scheduledClass.startTime,
          scheduledEndTime: scheduledClass.endTime,
          timetableId: scheduledClass.timetableId,
          studentId: scheduledClass.studentId,
          subjectId: scheduledClass.subjectId,
        });
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return missedClasses;
}

// Get comprehensive teacher statistics
export async function getTeacherDetailedStats(teacherId: string, startDate?: Date, endDate?: Date) {
  const whereConditions = [eq(classAttendance.teacherId, teacherId)];

  if (startDate) {
    whereConditions.push(gte(classAttendance.classDate, startDate));
  }
  if (endDate) {
    whereConditions.push(lte(classAttendance.classDate, endDate));
  }

  // Get attendance records
  const attendance = await getClassAttendance({ teacherId, startDate, endDate });

  // Calculate total hours
  const durationToHours: Record<string, number> = {
    '30min': 0.5,
    '1hr': 1,
    '1.5hr': 1.5,
    '2hr': 2,
  };

  const totalHours = attendance.reduce(
    (sum, record) => sum + (durationToHours[record.duration] || 0),
    0,
  );

  // Get unique students and subjects
  const uniqueStudents = new Set(attendance.map((a) => a.studentId)).size;
  const uniqueSubjects = new Set(attendance.map((a) => a.subjectId)).size;

  // Get duration breakdown
  const durationBreakdown = attendance.reduce(
    (acc, record) => {
      acc[record.duration] = (acc[record.duration] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Get student-wise breakdown
  const studentBreakdown = attendance.reduce(
    (acc, record) => {
      if (!acc[record.studentId]) {
        acc[record.studentId] = {
          studentId: record.studentId,
          studentName: record.studentName,
          totalClasses: 0,
          totalHours: 0,
          subjects: new Set(),
        };
      }
      acc[record.studentId].totalClasses++;
      acc[record.studentId].totalHours += durationToHours[record.duration] || 0;
      if (record.subjectName) {
        acc[record.studentId].subjects.add(record.subjectName);
      }
      return acc;
    },
    {} as Record<
      string,
      {
        studentId: string;
        studentName: string;
        totalClasses: number;
        totalHours: number;
        subjects: Set<string>;
      }
    >,
  );

  const studentStats = Object.values(studentBreakdown).map((s) => ({
    ...s,
    subjects: Array.from(s.subjects),
  }));

  // Get subject-wise breakdown
  const subjectBreakdown = attendance.reduce(
    (acc, record) => {
      const subjectName = record.subjectName || 'Unknown';
      if (!acc[record.subjectId]) {
        acc[record.subjectId] = {
          subjectId: record.subjectId,
          subjectName: subjectName,
          totalClasses: 0,
          totalHours: 0,
        };
      }
      acc[record.subjectId].totalClasses++;
      acc[record.subjectId].totalHours += durationToHours[record.duration] || 0;
      return acc;
    },
    {} as Record<
      string,
      { subjectId: string; subjectName: string; totalClasses: number; totalHours: number }
    >,
  );

  const subjectStats = Object.values(subjectBreakdown);

  // Get missed classes
  const missed = startDate && endDate ? await getMissedClasses(teacherId, startDate, endDate) : [];

  // Calculate scheduled vs attended
  const scheduledClasses = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(timetable)
    .where(and(eq(timetable.teacherId, teacherId), eq(timetable.isActive, true)));

  const weeklyScheduledCount = scheduledClasses[0]?.count || 0;

  return {
    totalClasses: attendance.length,
    totalHours,
    uniqueStudents,
    uniqueSubjects,
    durationBreakdown,
    studentStats,
    subjectStats,
    missedClasses: missed,
    missedCount: missed.length,
    weeklyScheduledCount,
    attendanceRate:
      weeklyScheduledCount > 0
        ? ((attendance.length / weeklyScheduledCount) * 100).toFixed(1)
        : '0',
  };
}

// Get overall system statistics
export async function getOverallStats(startDate?: Date, endDate?: Date) {
  const whereConditions = [];

  if (startDate) {
    whereConditions.push(gte(classAttendance.classDate, startDate));
  }
  if (endDate) {
    whereConditions.push(lte(classAttendance.classDate, endDate));
  }

  const stats = await db
    .select({
      totalClasses: sql<number>`count(*)::int`,
      uniqueTeachers: sql<number>`count(distinct ${classAttendance.teacherId})::int`,
      uniqueStudents: sql<number>`count(distinct ${classAttendance.studentId})::int`,
      uniqueSubjects: sql<number>`count(distinct ${classAttendance.subjectId})::int`,
    })
    .from(classAttendance)
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

  return stats[0];
}

// Get top performing teachers
export async function getTopTeachers(limit: number = 5, startDate?: Date, endDate?: Date) {
  const whereConditions = [];

  if (startDate) {
    whereConditions.push(gte(classAttendance.classDate, startDate));
  }
  if (endDate) {
    whereConditions.push(lte(classAttendance.classDate, endDate));
  }

  const topTeachers = await db
    .select({
      teacherId: classAttendance.teacherId,
      teacherName: user.name,
      totalClasses: sql<number>`count(*)::int`,
      uniqueStudents: sql<number>`count(distinct ${classAttendance.studentId})::int`,
    })
    .from(classAttendance)
    .leftJoin(user, eq(classAttendance.teacherId, user.id))
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .groupBy(classAttendance.teacherId, user.name)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

  return topTeachers;
}

// Get comprehensive student statistics
export async function getStudentDetailedStats(studentId: string, startDate?: Date, endDate?: Date) {
  const whereConditions = [eq(classAttendance.studentId, studentId)];

  if (startDate) {
    whereConditions.push(gte(classAttendance.classDate, startDate));
  }
  if (endDate) {
    whereConditions.push(lte(classAttendance.classDate, endDate));
  }

  // Get attendance records
  const attendance = await getClassAttendance({ studentId, startDate, endDate });

  // Calculate total hours
  const durationToHours: Record<string, number> = {
    '30min': 0.5,
    '1hr': 1,
    '1.5hr': 1.5,
    '2hr': 2,
  };

  const totalHours = attendance.reduce(
    (sum, record) => sum + (durationToHours[record.duration] || 0),
    0,
  );

  // Get unique teachers and subjects
  const uniqueTeachers = new Set(attendance.map((a) => a.teacherId)).size;
  const uniqueSubjects = new Set(attendance.map((a) => a.subjectId)).size;

  // Get duration breakdown
  const durationBreakdown = attendance.reduce(
    (acc, record) => {
      acc[record.duration] = (acc[record.duration] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Get teacher-wise breakdown
  const teacherBreakdown = attendance.reduce(
    (acc, record) => {
      if (!acc[record.teacherId]) {
        acc[record.teacherId] = {
          teacherId: record.teacherId,
          teacherName: record.teacherName || 'Unknown',
          totalClasses: 0,
          totalHours: 0,
          subjects: new Set(),
        };
      }
      acc[record.teacherId].totalClasses++;
      acc[record.teacherId].totalHours += durationToHours[record.duration] || 0;
      if (record.subjectName) {
        acc[record.teacherId].subjects.add(record.subjectName);
      }
      return acc;
    },
    {} as Record<
      string,
      {
        teacherId: string;
        teacherName: string;
        totalClasses: number;
        totalHours: number;
        subjects: Set<string>;
      }
    >,
  );

  const teacherStats = Object.values(teacherBreakdown).map((t) => ({
    ...t,
    subjects: Array.from(t.subjects),
  }));

  // Get subject-wise breakdown
  const subjectBreakdown = attendance.reduce(
    (acc, record) => {
      const subjectName = record.subjectName || 'Unknown';
      if (!acc[record.subjectId]) {
        acc[record.subjectId] = {
          subjectId: record.subjectId,
          subjectName: subjectName,
          totalClasses: 0,
          totalHours: 0,
          teachers: new Set(),
        };
      }
      acc[record.subjectId].totalClasses++;
      acc[record.subjectId].totalHours += durationToHours[record.duration] || 0;
      if (record.teacherName) {
        acc[record.subjectId].teachers.add(record.teacherName);
      }
      return acc;
    },
    {} as Record<
      string,
      {
        subjectId: string;
        subjectName: string;
        totalClasses: number;
        totalHours: number;
        teachers: Set<string>;
      }
    >,
  );

  const subjectStats = Object.values(subjectBreakdown).map((s) => ({
    ...s,
    teachers: Array.from(s.teachers),
  }));

  // Get monthly breakdown for trend analysis
  const monthlyBreakdown = attendance.reduce(
    (acc, record) => {
      const date = new Date(record.classDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, totalClasses: 0, totalHours: 0 };
      }
      acc[monthKey].totalClasses++;
      acc[monthKey].totalHours += durationToHours[record.duration] || 0;
      return acc;
    },
    {} as Record<string, { month: string; totalClasses: number; totalHours: number }>,
  );

  const monthlyStats = Object.values(monthlyBreakdown).sort((a, b) =>
    a.month.localeCompare(b.month),
  );

  return {
    totalClasses: attendance.length,
    totalHours,
    uniqueTeachers,
    uniqueSubjects,
    durationBreakdown,
    teacherStats,
    subjectStats,
    monthlyStats,
    recentClasses: attendance.slice(0, 10), // Last 10 classes
  };
}
