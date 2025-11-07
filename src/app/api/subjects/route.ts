import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createSubjectSchema } from '@/schemas/timetable';
import { createSubject, getAllSubjects } from '@/db/subjects';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const validatedData = createSubjectSchema.parse(body);

    const subject = await createSubject({
      name: validatedData.name,
      description: validatedData.description || undefined,
    });
    return NextResponse.json({ success: true, data: subject });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors.map((err) => ({ field: err.path.join('.'), message: err.message })),
        },
        { status: 400 },
      );
    }

    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('Error creating subject:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const subjects = await getAllSubjects();
    return NextResponse.json({ success: true, data: subjects });
  } catch (error: any) {
    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
