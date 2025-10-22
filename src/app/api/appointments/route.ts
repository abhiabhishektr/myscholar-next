import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createAppointmentSchema } from '@/schemas/appointment';
import { createAppointment, getAppointments } from '@/db/appointments';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const validatedData = createAppointmentSchema.parse(body);

    const data = {
      ...validatedData,
      startTime: new Date(validatedData.startTime),
      endTime: new Date(validatedData.endTime),
    };

    const appointment = await createAppointment(data);
    return NextResponse.json(appointment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: any = {};

    if (searchParams.get('studentId')) filters.studentId = searchParams.get('studentId');
    if (searchParams.get('teacherId')) filters.teacherId = searchParams.get('teacherId');
    if (searchParams.get('status')) filters.status = searchParams.get('status');
    if (searchParams.get('startDate')) filters.startDate = new Date(searchParams.get('startDate')!);
    if (searchParams.get('endDate')) filters.endDate = new Date(searchParams.get('endDate')!);

    const appointments = await getAppointments(filters);
    return NextResponse.json(appointments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
