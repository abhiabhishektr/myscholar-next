import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getTeacherDetailedStats,
  getStudentDetailedStats,
  getOverallStats,
  getTopTeachers,
  getMissedClasses,
} from '@/db/classAttendance';
import { headers } from 'next/headers';

// GET - Get detailed analytics
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can access analytics
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can access analytics' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'teacher', 'student', 'overall', 'top-teachers', 'missed'
    const teacherId = searchParams.get('teacherId');
    const studentId = searchParams.get('studentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    switch (type) {
      case 'teacher':
        if (!teacherId) {
          return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 });
        }
        const teacherStats = await getTeacherDetailedStats(teacherId, start, end);
        return NextResponse.json({ stats: teacherStats }, { status: 200 });

      case 'student':
        if (!studentId) {
          return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
        }
        const studentStats = await getStudentDetailedStats(studentId, start, end);
        return NextResponse.json({ stats: studentStats }, { status: 200 });

      case 'overall':
        const overallStats = await getOverallStats(start, end);
        return NextResponse.json({ stats: overallStats }, { status: 200 });

      case 'top-teachers':
        const limitNum = limit ? parseInt(limit) : 5;
        const topTeachers = await getTopTeachers(limitNum, start, end);
        return NextResponse.json({ teachers: topTeachers }, { status: 200 });

      case 'missed':
        if (!teacherId || !start || !end) {
          return NextResponse.json(
            { error: 'Teacher ID, start date and end date are required for missed classes' },
            { status: 400 },
          );
        }
        const missed = await getMissedClasses(teacherId, start, end);
        return NextResponse.json({ missedClasses: missed }, { status: 200 });

      default:
        return NextResponse.json({ error: 'Invalid analytics type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
