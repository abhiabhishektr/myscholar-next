'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, Users, BookOpen, Eye, ChevronRight, Search, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { UserWithDetails } from '@/utils/users';

interface UpcomingClass {
  id: string;
  studentId: string;
  teacherId: string;
  subjectId: string;
  subjectName: string;
  day: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  isActive: boolean;
}

interface StudentTimetableEntry {
  id: string;
  studentId: string;
  teacherId: string;
  subjectId: string;
  subjectName: string;
  teacherName: string;
  day: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface TeacherDashboardProps {
  teacher: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export function TeacherDashboard({ teacher }: TeacherDashboardProps) {
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
  const [students, setStudents] = useState<UserWithDetails[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<UserWithDetails | null>(null);
  const [studentTimetable, setStudentTimetable] = useState<StudentTimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const [showTimetableDialog, setShowTimetableDialog] = useState(false);

  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserWithDetails[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch upcoming classes
      const upcomingResponse = await fetch('/api/teacher?action=upcoming');
      const upcomingData = await upcomingResponse.json();

      if (upcomingData.success) {
        setUpcomingClasses(upcomingData.data);
      }

      // Fetch students
      const studentsResponse = await fetch('/api/teacher?action=students');
      const studentsData = await studentsResponse.json();

      if (studentsData.success) {
        setStudents(studentsData.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const searchStudents = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await fetch(`/api/teacher?action=search-students&query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching students:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      if (query.trim()) {
        searchStudents(query.trim());
      } else {
        setSearchResults([]);
      }
    }, 300);

    setSearchTimeout(timeout);
  };

  const fetchStudentTimetable = async (studentId: string) => {
    try {
      setLoadingTimetable(true);
      const response = await fetch(`/api/teacher?action=student-timetable&studentId=${studentId}`);
      const data = await response.json();

      if (data.success) {
        setStudentTimetable(data.data);
      } else {
        toast.error('Failed to load student timetable');
      }
    } catch (error) {
      toast.error('Error loading student timetable');
      console.error(error);
    } finally {
      setLoadingTimetable(false);
    }
  };

  const handleViewStudentTimetable = async (student: UserWithDetails) => {
    setSelectedStudent(student);
    await fetchStudentTimetable(student.id);
    setShowTimetableDialog(true);
  };

  const getClassesByDay = (day: string) => {
    return upcomingClasses.filter(cls => cls.day === day);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="space-y-8">
            <Skeleton className="h-32 w-full" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {teacher.name.split(' ')[0]}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here&apos;s an overview of your teaching schedule
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-100">Upcoming Classes</p>
                  <h3 className="text-3xl font-bold text-white mt-2">
                    {upcomingClasses.length}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-100">Total Students</p>
                  <h3 className="text-3xl font-bold text-white mt-2">
                    {students.length}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-indigo-500 to-indigo-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-100">Active Subjects</p>
                  <h3 className="text-3xl font-bold text-white mt-2">
                    {new Set(upcomingClasses.map(c => c.subjectId)).size}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Upcoming Classes */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Upcoming Classes</CardTitle>
                    <CardDescription>Classes scheduled for today and tomorrow</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {upcomingClasses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      No upcoming classes
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      You don&apos;t have any classes scheduled for today or tomorrow.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {['today', 'tomorrow'].map((period) => {
                      const now = new Date();
                      const targetDay = period === 'today'
                        ? now.toLocaleDateString('en-US', { weekday: 'long' })
                        : new Date(now.getTime() + 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' });

                      const dayClasses = getClassesByDay(targetDay);

                      if (dayClasses.length === 0) return null;

                      return (
                        <div key={period} className="space-y-3">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                            {period === 'today' ? 'Today' : 'Tomorrow'} ({targetDay})
                          </h3>
                          <div className="space-y-3">
                            {dayClasses.map((cls) => (
                              <div
                                key={cls.id}
                                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <BookOpen className="w-6 h-6 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                      {cls.subjectName}
                                    </h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                                    </p>
                                    {cls.notes && (
                                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        {cls.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {period === 'today' ? 'Today' : 'Tomorrow'}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Students */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                    <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">My Students</CardTitle>
                    <CardDescription>Students you teach</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                      <Users className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No students assigned yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => handleViewStudentTimetable(student)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                              {student.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {student.email}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Student Search and Timetable Viewer */}
        <div className="mt-8">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-xl">Search Student Timetables</CardTitle>
                  <CardDescription>Find and view any student&apos;s schedule</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search students by name or email..."
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    className="pl-10"
                  />
                </div>

                {/* Search Results */}
                {searching ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-500">Searching...</span>
                  </div>
                ) : searchQuery && searchResults.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => handleViewStudentTimetable(student)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">
                              {student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                              {student.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {student.email}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View Timetable
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : searchQuery && searchQuery.length >= 2 ? (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No students found matching &quot;{searchQuery}&quot;
                  </div>
                ) : searchQuery && searchQuery.length < 2 ? (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                    Type at least 2 characters to search
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Timetable Dialog */}
        <Dialog open={showTimetableDialog} onOpenChange={setShowTimetableDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Eye className="w-5 h-5" />
                {selectedStudent?.name}&apos;s Timetable
              </DialogTitle>
              <DialogDescription>
                Complete weekly schedule for {selectedStudent?.name}
              </DialogDescription>
            </DialogHeader>

            {loadingTimetable ? (
              <div className="space-y-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : studentTimetable.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No timetable created
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  This student doesn&apos;t have any classes scheduled yet.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {DAYS_OF_WEEK.map((day) => {
                  const dayClasses = studentTimetable.filter(cls => cls.day === day);
                  return (
                    <div key={day} className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
                        {day}
                        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                          ({dayClasses.length} {dayClasses.length === 1 ? 'class' : 'classes'})
                        </span>
                      </h3>

                      {dayClasses.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                          No classes scheduled
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {dayClasses.map((cls) => (
                            <div
                              key={cls.id}
                              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                  <BookOpen className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                    {cls.subjectName}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <User className="w-3 h-3 text-gray-500" />
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {cls.teacherName || 'Unknown Teacher'}
                                      {cls.teacherId === teacher.id && (
                                        <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                          You
                                        </Badge>
                                      )}
                                    </p>
                                  </div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                                  </p>
                                  {cls.notes && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                      {cls.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Badge variant="outline">
                                {formatTime(cls.startTime)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}