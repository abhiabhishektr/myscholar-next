import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getTodayScheduledClasses } from '@/db/classAttendance';
import { headers } from 'next/headers';

// GET - Get today's scheduled classes for a teacher
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only teachers can access this
    if (session.user.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Only teachers can access scheduled classes' },
        { status: 403 },
      );
    }

    const classes = await getTodayScheduledClasses(session.user.id);

    return NextResponse.json({ classes }, { status: 200 });
  } catch (error) {
    console.error('Error fetching scheduled classes:', error);
    return NextResponse.json({ error: 'Failed to fetch scheduled classes' }, { status: 500 });
  }
}
