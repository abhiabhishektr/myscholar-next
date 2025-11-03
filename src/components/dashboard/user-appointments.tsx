"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, CheckCircle2, TrendingUp, FileText } from "lucide-react";
import { format, differenceInHours, differenceInMinutes, startOfMonth, endOfMonth } from "date-fns";

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
  const [updatingAppointments, setUpdatingAppointments] = useState<Set<string>>(new Set());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  // Calculate duration in hours
  const calculateDuration = (startTime: string, endTime: string): string => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = differenceInHours(end, start);
    const minutes = differenceInMinutes(end, start) % 60;
    
    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  // Calculate total hours for completed appointments
  const calculateTotalHours = () => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    
    const completedInMonth = appointments.filter(apt => 
      apt.status === 'completed' && 
      new Date(apt.startTime) >= monthStart && 
      new Date(apt.startTime) <= monthEnd
    );

    const totalMinutes = completedInMonth.reduce((total, apt) => {
      const start = new Date(apt.startTime);
      const end = new Date(apt.endTime);
      return total + differenceInMinutes(end, start);
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return { hours, minutes, count: completedInMonth.length };
  };

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
      <Card className="shadow-lg border-none">
        <CardContent className="p-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading appointments...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg border-none border-l-4 border-red-500">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-red-600 dark:text-red-400 mb-1">Error</h3>
              <p className="text-sm text-red-500 dark:text-red-300">{error}</p>
            </div>
          </div>
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

  const analytics = currentUser.role === 'teacher' ? calculateTotalHours() : null;

  return (
    <div className="space-y-6">
      {/* Analytics Section for Teachers */}
      {currentUser.role === 'teacher' && analytics && (
        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              Reports & Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Hours Card */}
              <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Total Hours
                    </p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {analytics.hours}h {analytics.minutes}m
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <div className="h-1 w-full bg-blue-100 dark:bg-blue-900 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>

              {/* Completed Sessions Card */}
              <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-green-500">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Completed Sessions
                    </p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {analytics.count}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <span className="text-green-600 dark:text-green-400">↗</span>
                    This month
                  </span>
                </div>
              </div>

              {/* Period Selector Card */}
              <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-purple-500">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Period
                    </p>
                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {format(selectedMonth, 'MMMM yyyy')}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 text-xs hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    onClick={() => {
                      const newMonth = new Date(selectedMonth);
                      newMonth.setMonth(newMonth.getMonth() - 1);
                      setSelectedMonth(newMonth);
                    }}
                  >
                    ← Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 text-xs hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    onClick={() => setSelectedMonth(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 text-xs hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    onClick={() => {
                      const newMonth = new Date(selectedMonth);
                      newMonth.setMonth(newMonth.getMonth() + 1);
                      setSelectedMonth(newMonth);
                    }}
                    disabled={new Date(selectedMonth).getMonth() >= new Date().getMonth()}
                  >
                    Next →
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <Card className="shadow-lg border-none">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 hover:shadow-lg transition-all duration-300 hover:border-green-300 dark:hover:border-green-700"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full -mr-16 -mt-16 opacity-50"></div>
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={getStatusBadgeProps(appointment.status).variant}
                          className={`${getStatusBadgeProps(appointment.status).className} px-3 py-1 text-xs font-semibold`}
                        >
                          {appointment.status}
                        </Badge>
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          #{appointment.id.slice(-8)}
                        </span>
                      </div>
                      {currentUser.role === 'teacher' && appointment.status === 'scheduled' && (
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all"
                          onClick={() => handleQuickComplete(appointment.id, true)}
                          disabled={updatingAppointments.has(appointment.id)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Mark Complete
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {currentUser.role === 'teacher' ? 'Student' : 'Teacher'}
                          </p>
                          <p className="font-semibold text-sm">
                            {currentUser.role === 'teacher'
                              ? users[appointment.studentId]?.name || 'Unknown'
                              : users[appointment.teacherId]?.name || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                          <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Start Time</p>
                          <p className="font-semibold text-sm">
                            {format(new Date(appointment.startTime), 'PPp')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                          <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                          <p className="font-bold text-sm text-orange-600 dark:text-orange-400">
                            {calculateDuration(appointment.startTime, appointment.endTime)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-start gap-3">
                          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Notes</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.notes}</p>
                          </div>
                        </div>
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
        <Card className="shadow-lg border-none">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900 dark:to-slate-900">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              Past Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {pastAppointments.slice(0, 5).map((appointment) => (
                <div
                  key={appointment.id}
                  className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 opacity-90 hover:opacity-100 transition-all duration-300"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-800 dark:to-slate-800 rounded-full -mr-12 -mt-12 opacity-30"></div>
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={getStatusBadgeProps(appointment.status).variant}
                          className={`${getStatusBadgeProps(appointment.status).className} px-3 py-1 text-xs font-semibold`}
                        >
                          {appointment.status}
                        </Badge>
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          #{appointment.id.slice(-8)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {currentUser.role === 'teacher' ? 'Student' : 'Teacher'}
                          </p>
                          <p className="font-semibold text-sm">
                            {currentUser.role === 'teacher'
                              ? users[appointment.studentId]?.name || 'Unknown'
                              : users[appointment.teacherId]?.name || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                          <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Start Time</p>
                          <p className="font-semibold text-sm">
                            {format(new Date(appointment.startTime), 'PPp')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                          <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                          <p className="font-bold text-sm text-orange-600 dark:text-orange-400">
                            {calculateDuration(appointment.startTime, appointment.endTime)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {appointment.punchInTime && (
                      <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <div>
                            <p className="text-xs font-semibold text-green-700 dark:text-green-300">Completed at</p>
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                              {format(new Date(appointment.punchInTime), 'PPp')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {appointment.notes && (
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-start gap-3">
                          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Notes</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.notes}</p>
                          </div>
                        </div>
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
        <Card className="shadow-lg border-none">
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                <Calendar className="h-12 w-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No Appointments Found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  You don&apos;t have any appointments scheduled yet.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
