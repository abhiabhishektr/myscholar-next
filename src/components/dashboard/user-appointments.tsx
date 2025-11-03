"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { AppointmentStatusDialog } from "@/components/admin/appointment-status-dialog";

interface Appointment {
  id: string;
  studentId: string;
  teacherId: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  createdAt: string;
  punchInTime?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserAppointmentsProps {
  currentUser: User;
}

const getStatusBadgeProps = (status: string) => {
  switch (status.toLowerCase()) {
    case 'scheduled':
      return { variant: 'default' as const, className: '' };
    case 'completed':
      return { variant: 'secondary' as const, className: 'bg-green-100 text-green-800 border-green-200' };
    case 'cancelled':
      return { variant: 'destructive' as const, className: '' };
    case 'no-show':
      return { variant: 'outline' as const, className: 'bg-orange-100 text-orange-800 border-orange-200' };
    default:
      return { variant: 'secondary' as const, className: '' };
  }
};

export function UserAppointments({ currentUser }: UserAppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>("");
  const [selectedAppointmentStatus, setSelectedAppointmentStatus] = useState<string>("");
  const [updatingAppointments, setUpdatingAppointments] = useState<Set<string>>(new Set());

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch appointments based on user role
      const params = new URLSearchParams();
      if (currentUser.role === 'teacher') {
        params.append('teacherId', currentUser.id);
      } else if (currentUser.role === 'student') {
        params.append('studentId', currentUser.id);
      }

      const response = await fetch(`/api/appointments?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch appointments');
      }
      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      setAppointments(data);

      // Fetch user details for all unique user IDs
      const userIds = new Set<string>();
      data.forEach((apt: Appointment) => {
        userIds.add(apt.studentId);
        userIds.add(apt.teacherId);
      });

      const userPromises = Array.from(userIds).map(async (id) => {
        try {
          const res = await fetch(`/api/users/${id}`);
          if (res.ok) {
            const user = await res.json();
            return { id, user };
          }
        } catch (error) {
          console.error(`Failed to fetch user ${id}:`, error);
        }
        return null;
      });

      const userResults = await Promise.all(userPromises);
      const userMap: Record<string, User> = {};
      userResults.forEach((result) => {
        if (result) {
          userMap[result.id] = result.user;
        }
      });

      setUsers(userMap);
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError(err.message || 'An error occurred while fetching appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.id, currentUser.role]);

  const handleOpenStatusDialog = (appointmentId: string, currentStatus: string) => {
    setSelectedAppointmentId(appointmentId);
    setSelectedAppointmentStatus(currentStatus);
    setStatusDialogOpen(true);
  };

  const handleStatusUpdated = () => {
    fetchAppointments();
  };

  const handleQuickComplete = async (appointmentId: string, checked: boolean) => {
    if (!checked) return; // Only handle when checking

    setUpdatingAppointments(prev => new Set(prev).add(appointmentId));

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "completed",
          punchInTime: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to mark appointment as completed");
      }

      await fetchAppointments();
    } catch (err: any) {
      console.error("Error updating appointment:", err);
      alert(err.message || "Failed to update appointment");
    } finally {
      setUpdatingAppointments(prev => {
        const newSet = new Set(prev);
        newSet.delete(appointmentId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          Loading appointments...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-600">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  const upcomingAppointments = appointments.filter(
    apt => apt.status === 'scheduled' && new Date(apt.startTime) > new Date()
  );
  const pastAppointments = appointments.filter(
    apt => apt.status !== 'scheduled' || new Date(apt.startTime) <= new Date()
  );

  return (
    <div className="space-y-6">
      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={getStatusBadgeProps(appointment.status).variant}
                          className={getStatusBadgeProps(appointment.status).className}
                        >
                          {appointment.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          #{appointment.id.slice(-8)}
                        </span>
                      </div>
                      {currentUser.role === 'teacher' && appointment.status === 'scheduled' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleQuickComplete(appointment.id, true)}
                          disabled={updatingAppointments.has(appointment.id)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Mark Complete
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {currentUser.role === 'teacher' ? 'Student:' : 'Teacher:'}
                        </span>
                        <span>
                          {currentUser.role === 'teacher'
                            ? users[appointment.studentId]?.name || 'Unknown'
                            : users[appointment.teacherId]?.name || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(appointment.startTime), 'PPp')}</span>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Notes:</span> {appointment.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past/Completed Appointments */}
      {pastAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Past Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastAppointments.slice(0, 5).map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-start gap-4 p-4 border rounded-lg opacity-75"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={getStatusBadgeProps(appointment.status).variant}
                          className={getStatusBadgeProps(appointment.status).className}
                        >
                          {appointment.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          #{appointment.id.slice(-8)}
                        </span>
                      </div>
                      {currentUser.role === 'teacher' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenStatusDialog(appointment.id, appointment.status)}
                        >
                          View Details
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {currentUser.role === 'teacher' ? 'Student:' : 'Teacher:'}
                        </span>
                        <span>
                          {currentUser.role === 'teacher'
                            ? users[appointment.studentId]?.name || 'Unknown'
                            : users[appointment.teacherId]?.name || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(appointment.startTime), 'PPp')}</span>
                      </div>
                    </div>

                    {appointment.punchInTime && (
                      <div className="text-sm text-green-600">
                        <span className="font-medium">Completed at:</span>{' '}
                        {format(new Date(appointment.punchInTime), 'PPp')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {appointments.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No appointments found.
          </CardContent>
        </Card>
      )}

      {/* Status Update Dialog */}
      <AppointmentStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        appointmentId={selectedAppointmentId}
        currentStatus={selectedAppointmentStatus}
        onStatusUpdated={handleStatusUpdated}
      />
    </div>
  );
}
