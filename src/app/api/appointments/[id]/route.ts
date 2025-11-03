import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { auth } from '@/lib/auth';
import { updateAppointmentSchema } from '@/schemas/appointment';
import { getAppointmentById, updateAppointment, softDeleteAppointment } from '@/db/appointments';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const appointment = await getAppointmentById(id);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    return NextResponse.json(appointment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Get the current session
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get the appointment to check if user has permission
    const appointment = await getAppointmentById(id);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Check if user is admin or the assigned teacher
    const isAdmin = session.user.role === 'admin';
    const isAssignedTeacher = session.user.id === appointment.teacherId;

    if (!isAdmin && !isAssignedTeacher) {
      return NextResponse.json(
        { error: 'Unauthorized: Only admin or the assigned teacher can update this appointment' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const validatedData = updateAppointmentSchema.parse(body);

    const data: any = {};
    if (validatedData.status !== undefined) data.status = validatedData.status;
    if (validatedData.notes !== undefined) data.notes = validatedData.notes;
    if (validatedData.punchInTime) data.punchInTime = new Date(validatedData.punchInTime);

    const updatedAppointment = await updateAppointment(id, data);
    if (!updatedAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    return NextResponse.json(updatedAppointment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);

    const { id } = await params;
    const appointment = await softDeleteAppointment(id);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Appointment deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
