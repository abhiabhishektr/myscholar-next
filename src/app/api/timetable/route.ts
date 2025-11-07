import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createTimetableEntrySchema, bulkCreateTimetableSchema } from '@/schemas/timetable';
import { createTimetableEntry, getTimetableByStudent, bulkCreateTimetable } from '@/db/timetable';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();

    // Check if it's a bulk create or single entry
    if (body.entries && Array.isArray(body.entries)) {
      // Bulk create timetable
      const validatedData = bulkCreateTimetableSchema.parse(body);

      // Validate each entry's time logic
      for (const entry of validatedData.entries) {
        if (entry.startTime >= entry.endTime) {
          return NextResponse.json(
            { error: `Invalid time range for ${entry.day}: end time must be after start time` },
            { status: 400 },
          );
        }
      }

      try {
        const timetableEntries = await bulkCreateTimetable(
          validatedData.studentId,
          validatedData.entries,
        );
        return NextResponse.json({
          success: true,
          data: timetableEntries,
          message: `Successfully created ${timetableEntries.length} timetable entries`,
        });
      } catch (dbError: any) {
        if (dbError.message.includes('overlaps')) {
          return NextResponse.json({ error: dbError.message }, { status: 409 });
        }
        throw dbError;
      }
    } else {
      // Single entry create
      const validatedData = createTimetableEntrySchema.parse(body);

      try {
        const timetableEntry = await createTimetableEntry(validatedData);
        return NextResponse.json({ success: true, data: timetableEntry });
      } catch (dbError: any) {
        if (dbError.message.includes('overlaps')) {
          return NextResponse.json({ error: dbError.message }, { status: 409 });
        }
        throw dbError;
      }
    }
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }

    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('Error creating timetable:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    const timetable = await getTimetableByStudent(studentId);
    return NextResponse.json({ success: true, data: timetable });
  } catch (error: any) {
    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('Error fetching timetable:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
