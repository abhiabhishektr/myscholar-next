import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getTimetableByStudent } from '@/db/timetable';

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const timetable = await getTimetableByStudent(session.user.id);

    return NextResponse.json({ success: true, data: timetable }, { status: 200 });
  } catch (error) {
    console.error('Error fetching student timetable:', error);
    return NextResponse.json({ error: 'Failed to fetch timetable' }, { status: 500 });
  }
}
