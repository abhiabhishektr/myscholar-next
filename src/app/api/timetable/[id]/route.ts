import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { updateTimetableEntrySchema } from '@/schemas/timetable';
import { updateTimetableEntry, softDeleteTimetableEntry, getTimetableById } from '@/db/timetable';
import { ZodError } from 'zod';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);

    const { id } = await params;
    const timetableEntry = await getTimetableById(id);

    if (!timetableEntry) {
      return NextResponse.json({ error: 'Timetable entry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: timetableEntry });
  } catch (error: any) {
    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('Error fetching timetable entry:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateTimetableEntrySchema.parse(body);

    // Validate time logic if both times are provided
    if (validatedData.startTime && validatedData.endTime) {
      if (validatedData.startTime >= validatedData.endTime) {
        return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
      }
    }

    const updatedEntry = await updateTimetableEntry(id, validatedData);

    if (!updatedEntry) {
      return NextResponse.json({ error: 'Timetable entry not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedEntry,
      message: 'Timetable entry updated successfully',
    });
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

    console.error('Error updating timetable entry:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);

    const { id } = await params;
    const deletedEntry = await softDeleteTimetableEntry(id);

    if (!deletedEntry) {
      return NextResponse.json({ error: 'Timetable entry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Timetable entry deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('Error deleting timetable entry:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
