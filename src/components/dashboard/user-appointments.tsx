"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, CheckCircle2, TrendingUp, FileText, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
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

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Pagination states
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

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

  // Apply filters
  const filterAppointments = (apts: Appointment[]) => {
    return apts.filter(apt => {
      // Status filter
      if (statusFilter !== "all" && apt.status !== statusFilter) {
        return false;
      }

      // Search filter (search in student/teacher name or notes)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const otherUserId = currentUser.role === 'teacher' ? apt.studentId : apt.teacherId;
        const otherUserName = users[otherUserId]?.name?.toLowerCase() || '';
        const notes = apt.notes?.toLowerCase() || '';
        
        if (!otherUserName.includes(query) && !notes.includes(query)) {
          return false;
        }
      }

      return true;
    });
  };

  const filteredUpcoming = filterAppointments(upcomingAppointments);
  const filteredPast = filterAppointments(pastAppointments);

  // Pagination
  const paginateAppointments = (apts: Appointment[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return apts.slice(startIndex, endIndex);
  };

  const paginatedUpcoming = paginateAppointments(filteredUpcoming, upcomingPage);
  const paginatedPast = paginateAppointments(filteredPast, pastPage);

  const upcomingTotalPages = Math.ceil(filteredUpcoming.length / itemsPerPage);
  const pastTotalPages = Math.ceil(filteredPast.length / itemsPerPage);

  const analytics = currentUser.role === 'teacher' ? calculateTotalHours() : null;

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card className="shadow-lg border-none">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <Filter className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Items per page */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Items per page
              </label>
              <Select 
                value={itemsPerPage.toString()} 
                onValueChange={(val) => {
                  setItemsPerPage(parseInt(val));
                  setUpcomingPage(1);
                  setPastPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span>Upcoming: {filteredUpcoming.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
              <span>Past: {filteredPast.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

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
      {filteredUpcoming.length > 0 && (
        <Card className="shadow-lg border-none">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
            <CardTitle className="flex items-center justify-between text-xl">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                Upcoming Appointments
              </div>
              <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                {filteredUpcoming.length} total
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {paginatedUpcoming.map((appointment) => (
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

            {/* Pagination Controls for Upcoming */}
            {upcomingTotalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {((upcomingPage - 1) * itemsPerPage) + 1} to{' '}
                  {Math.min(upcomingPage * itemsPerPage, filteredUpcoming.length)} of{' '}
                  {filteredUpcoming.length} appointments
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUpcomingPage(upcomingPage - 1)}
                    disabled={upcomingPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(upcomingTotalPages, 5) }, (_, i) => {
                      let page = i + 1;
                      if (upcomingTotalPages > 5) {
                        if (upcomingPage <= 3) {
                          page = i + 1;
                        } else if (upcomingPage >= upcomingTotalPages - 2) {
                          page = upcomingTotalPages - 4 + i;
                        } else {
                          page = upcomingPage - 2 + i;
                        }
                      }
                      return page;
                    }).map((page) => (
                      <Button
                        key={page}
                        variant={page === upcomingPage ? "default" : "outline"}
                        size="sm"
                        className="w-9"
                        onClick={() => setUpcomingPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUpcomingPage(upcomingPage + 1)}
                    disabled={upcomingPage === upcomingTotalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Past/Completed Appointments */}
      {filteredPast.length > 0 && (
        <Card className="shadow-lg border-none">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900 dark:to-slate-900">
            <CardTitle className="flex items-center justify-between text-xl">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                Past Appointments
              </div>
              <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                {filteredPast.length} total
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {paginatedPast.map((appointment) => (
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

            {/* Pagination Controls for Past */}
            {pastTotalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {((pastPage - 1) * itemsPerPage) + 1} to{' '}
                  {Math.min(pastPage * itemsPerPage, filteredPast.length)} of{' '}
                  {filteredPast.length} appointments
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPastPage(pastPage - 1)}
                    disabled={pastPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(pastTotalPages, 5) }, (_, i) => {
                      let page = i + 1;
                      if (pastTotalPages > 5) {
                        if (pastPage <= 3) {
                          page = i + 1;
                        } else if (pastPage >= pastTotalPages - 2) {
                          page = pastTotalPages - 4 + i;
                        } else {
                          page = pastPage - 2 + i;
                        }
                      }
                      return page;
                    }).map((page) => (
                      <Button
                        key={page}
                        variant={page === pastPage ? "default" : "outline"}
                        size="sm"
                        className="w-9"
                        onClick={() => setPastPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPastPage(pastPage + 1)}
                    disabled={pastPage === pastTotalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
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
