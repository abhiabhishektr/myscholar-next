import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getTimetableByTeacher, getTimetableByStudent, getStudentsByTeacher } from '@/db/timetable';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'upcoming') {
      // Get upcoming classes for today and tomorrow
      const now = new Date();
      const today = now.toLocaleDateString('en-US', { weekday: 'long' });
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        weekday: 'long',
      });

      const allClasses = await getTimetableByTeacher(session.user.id);

      // Get student names for all classes
      const students = await getStudentsByTeacher(session.user.id);
      const studentMap = new Map(students.map((s) => [s.id, s.name]));

      // Filter for today and tomorrow, and only future classes
      const upcomingClasses = allClasses
        .filter((entry) => entry.timetable) // Ensure timetable data exists
        .map((entry) => ({
          ...entry.timetable,
          subjectName: entry.subject?.name || 'Unknown Subject',
          studentName: studentMap.get(entry.timetable.studentId) || 'Unknown Student',
        }))
        .filter((entry) => {
          if (entry.day !== today && entry.day !== tomorrow) return false;

          if (entry.day === today) {
            const [hours, minutes] = entry.startTime.split(':').map(Number);
            const classTime = new Date(now);
            classTime.setHours(hours, minutes, 0, 0);
            return classTime > now;
          }

          return true; // Tomorrow's classes are all upcoming
        });

      return NextResponse.json({ success: true, data: upcomingClasses });
    }

    if (action === 'students') {
      // Get all students that have classes with this teacher
      const students = await getStudentsByTeacher(session.user.id);
      return NextResponse.json({ success: true, data: students });
    }

    if (action === 'search-students') {
      // Search students that have classes with this teacher
      const query = searchParams.get('query') || '';
      const allStudents = await getStudentsByTeacher(session.user.id);

      let filteredStudents = allStudents;

      if (query.trim()) {
        const searchTerm = query.toLowerCase().trim();
        filteredStudents = allStudents.filter(
          (student) =>
            student.name.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm),
        );
      }

      // Limit results to prevent overwhelming the UI
      const limitedStudents = filteredStudents.slice(0, 50);

      return NextResponse.json({ success: true, data: limitedStudents });
    }

    if (action === 'student-timetable') {
      const studentId = searchParams.get('studentId');
      if (!studentId) {
        return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
      }

      // Verify this teacher has classes with this student
      const teacherClasses = await getTimetableByTeacher(session.user.id);
      const hasAccess = teacherClasses.some(
        (c) => c.timetable && c.timetable.studentId === studentId,
      );

      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      const studentTimetable = await getTimetableByStudent(studentId);
      return NextResponse.json({ success: true, data: studentTimetable });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in teacher API:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
