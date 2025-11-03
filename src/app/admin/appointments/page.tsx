"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Check, ChevronsUpDown, Search, X, Edit } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status dialog state
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>("");
  const [selectedAppointmentStatus, setSelectedAppointmentStatus] = useState<string>("");

  // Filter states
  const [studentOpen, setStudentOpen] = useState(false);
  const [teacherOpen, setTeacherOpen] = useState(false);
  const [studentQuery, setStudentQuery] = useState("");
  const [teacherQuery, setTeacherQuery] = useState("");
  const [studentResults, setStudentResults] = useState<User[]>([]);
  const [teacherResults, setTeacherResults] = useState<User[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();

      if (selectedStudent) params.append('studentId', selectedStudent.id);
      if (selectedTeacher) params.append('teacherId', selectedTeacher.id);
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const response = await fetch(`/api/appointments?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch appointments');
      }
      const data = await response.json();

      // Ensure data is an array
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
  }, [selectedStudent, selectedTeacher, startDate, endDate]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    if (studentQuery.length > 0) {
      fetch(`/api/users/search?query=${encodeURIComponent(studentQuery)}&role=student`)
        .then((res) => res.json())
        .then((data) => setStudentResults(Array.isArray(data) ? data : []))
        .catch(() => setStudentResults([]));
    } else {
      setStudentResults([]);
    }
  }, [studentQuery]);

  useEffect(() => {
    if (teacherQuery.length > 0) {
      fetch(`/api/users/search?query=${encodeURIComponent(teacherQuery)}&role=teacher`)
        .then((res) => res.json())
        .then((data) => setTeacherResults(Array.isArray(data) ? data : []))
        .catch(() => setTeacherResults([]));
    } else {
      setTeacherResults([]);
    }
  }, [teacherQuery]);

  const clearFilters = () => {
    setSelectedStudent(null);
    setSelectedTeacher(null);
    setStartDate(undefined);
    setEndDate(undefined);
    setStudentQuery("");
    setTeacherQuery("");
    fetchAppointments();
  };

  const handleOpenStatusDialog = (appointmentId: string, currentStatus: string) => {
    setSelectedAppointmentId(appointmentId);
    setSelectedAppointmentStatus(currentStatus);
    setStatusDialogOpen(true);
  };

  const handleStatusUpdated = () => {
    fetchAppointments();
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Appointments</h1>
        <div className="text-center">Loading appointments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Appointments</h1>
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Appointments</h1>
        <Button onClick={fetchAppointments}>
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Filters
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Student Filter */}
            <div>
              <Label>Filter by Student</Label>
              <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={studentOpen}
                    className="w-full justify-between mt-1"
                  >
                    {selectedStudent ? `${selectedStudent.name} (${selectedStudent.email})` : "Select student..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search by name or email..."
                      value={studentQuery}
                      onValueChange={setStudentQuery}
                    />
                    <CommandList>
                      <CommandEmpty>No student found.</CommandEmpty>
                      <CommandGroup>
                        {studentResults.map((user) => (
                          <CommandItem
                            key={user.id}
                            value={`${user.name} ${user.email}`}
                            onSelect={() => {
                              setSelectedStudent(user);
                              setStudentOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedStudent?.id === user.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{user.name}</span>
                              <span className="text-sm text-gray-500">{user.email}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Teacher Filter */}
            <div>
              <Label>Filter by Teacher</Label>
              <Popover open={teacherOpen} onOpenChange={setTeacherOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={teacherOpen}
                    className="w-full justify-between mt-1"
                  >
                    {selectedTeacher ? `${selectedTeacher.name} (${selectedTeacher.email})` : "Select teacher..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search by name or email..."
                      value={teacherQuery}
                      onValueChange={setTeacherQuery}
                    />
                    <CommandList>
                      <CommandEmpty>No teacher found.</CommandEmpty>
                      <CommandGroup>
                        {teacherResults.map((user) => (
                          <CommandItem
                            key={user.id}
                            value={`${user.name} ${user.email}`}
                            onSelect={() => {
                              setSelectedTeacher(user);
                              setTeacherOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedTeacher?.id === user.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{user.name}</span>
                              <span className="text-sm text-gray-500">{user.email}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Start Date Filter */}
            <div>
              <Label>Start Date</Label>
              <div className="mt-1">
                <DateTimePicker value={startDate} onChange={setStartDate} />
              </div>
            </div>

            {/* End Date Filter */}
            <div>
              <Label>End Date</Label>
              <div className="mt-1">
                <DateTimePicker value={endDate} onChange={setEndDate} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="grid gap-4">
        {appointments.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              No appointments found matching the filters.
            </CardContent>
          </Card>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Appointment #{appointment.id.slice(-8)}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={appointment.status === 'scheduled' ? 'default' : 'secondary'}>
                      {appointment.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenStatusDialog(appointment.id, appointment.status)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Update Status
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Student</p>
                    <p>{users[appointment.studentId]?.name || 'Unknown'} ({users[appointment.studentId]?.email || 'Unknown'})</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Teacher</p>
                    <p>{users[appointment.teacherId]?.name || 'Unknown'} ({users[appointment.teacherId]?.email || 'Unknown'})</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Start Time</p>
                    <p>{format(new Date(appointment.startTime), 'PPpp')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">End Time</p>
                    <p>{format(new Date(appointment.endTime), 'PPpp')}</p>
                  </div>
                </div>
                {appointment.notes && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Notes</p>
                    <p className="text-sm">{appointment.notes}</p>
                  </div>
                )}
                <div className="mt-4 text-xs text-gray-500">
                  Created: {format(new Date(appointment.createdAt), 'PPp')}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

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