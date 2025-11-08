import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { markClassAttendance, getClassAttendance, checkIfClassMarked } from '@/db/classAttendance';
import { headers } from 'next/headers';

// POST - Mark class attendance
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only teachers can mark attendance
    if (session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Only teachers can mark attendance' }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, subjectId, timetableId, classDate, startTime, duration, notes } = body;

    // Validate required fields
    if (!studentId || !subjectId || !classDate || !startTime || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate duration
    const validDurations = ['30min', '1hr', '1.5hr', '2hr'];
    if (!validDurations.includes(duration)) {
      return NextResponse.json(
        { error: 'Invalid duration. Must be one of: 30min, 1hr, 1.5hr, 2hr' },
        { status: 400 },
      );
    }

    // Check if attendance already marked for this class today
    const existingAttendance = await checkIfClassMarked(
      session.user.id,
      studentId,
      subjectId,
      new Date(classDate),
    );

    if (existingAttendance) {
      return NextResponse.json(
        { error: 'Attendance already marked for this class today' },
        { status: 400 },
      );
    }

    // Mark attendance
    const attendance = await markClassAttendance({
      teacherId: session.user.id,
      studentId,
      subjectId,
      timetableId: timetableId || undefined,
      classDate: new Date(classDate),
      startTime,
      duration,
      notes: notes || undefined,
    });

    return NextResponse.json(
      { message: 'Attendance marked successfully', attendance },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error marking attendance:', error);
    return NextResponse.json({ error: 'Failed to mark attendance' }, { status: 500 });
  }
}

// GET - Get class attendance records
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const studentId = searchParams.get('studentId');
    const subjectId = searchParams.get('subjectId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Teachers can only see their own records unless they're admin
    if (session.user.role === 'teacher' && teacherId && teacherId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only view your own attendance records' },
        { status: 403 },
      );
    }

    const filters: any = {};
    if (teacherId) filters.teacherId = teacherId;
    if (studentId) filters.studentId = studentId;
    if (subjectId) filters.subjectId = subjectId;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    // If teacher and no teacherId specified, show their records
    if (session.user.role === 'teacher' && !teacherId) {
      filters.teacherId = session.user.id;
    }

    const attendance = await getClassAttendance(filters);

    return NextResponse.json({ attendance }, { status: 200 });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance records' }, { status: 500 });
  }
}
