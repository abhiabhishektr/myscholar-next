import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { updateAppointmentSchema } from '@/schemas/appointment';
import { getAppointmentById, updateAppointment, softDeleteAppointment } from '@/db/appointments';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const appointment = await getAppointmentById(params.id);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    return NextResponse.json(appointment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const validatedData = updateAppointmentSchema.parse(body);

    const data: any = {};
    if (validatedData.status !== undefined) data.status = validatedData.status;
    if (validatedData.notes !== undefined) data.notes = validatedData.notes;
    if (validatedData.punchInTime) data.punchInTime = new Date(validatedData.punchInTime);

    const appointment = await updateAppointment(params.id, data);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    return NextResponse.json(appointment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);

    const appointment = await softDeleteAppointment(params.id);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Appointment deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
