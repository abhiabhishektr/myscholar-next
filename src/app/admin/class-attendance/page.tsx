"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  Filter, 
  Download, 
  TrendingUp, 
  AlertCircle,
  Award,
  BarChart3,
  Search,
  Users
} from "lucide-react";
import { toast } from "react-hot-toast";

interface AttendanceRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  classDate: string;
  startTime: string;
  duration: string;
  notes: string | null;
  markedAt: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface TeacherStats {
  totalClasses: number;
  totalHours: number;
  uniqueStudents: number;
  uniqueSubjects: number;
  durationBreakdown: Record<string, number>;
  studentStats: Array<{
    studentId: string;
    studentName: string;
    totalClasses: number;
    totalHours: number;
    subjects: string[];
  }>;
  subjectStats: Array<{
    subjectId: string;
    subjectName: string;
    totalClasses: number;
    totalHours: number;
  }>;
  missedClasses: Array<{
    date: string;
    dayName: string;
    studentName: string;
    subjectName: string;
    scheduledStartTime: string;
    scheduledEndTime: string;
  }>;
  missedCount: number;
  weeklyScheduledCount: number;
  attendanceRate: string;
}

interface OverallStats {
  totalClasses: number;
  uniqueTeachers: number;
  uniqueStudents: number;
  uniqueSubjects: number;
}

interface TopTeacher {
  teacherId: string;
  teacherName: string;
  totalClasses: number;
  uniqueStudents: number;
}

export default function ClassAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<AttendanceRecord[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [studentSearch, setStudentSearch] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState("overview");
  
  // Teacher Details
  const [teacherStats, setTeacherStats] = useState<TeacherStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  
  // Overall Stats
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [topTeachers, setTopTeachers] = useState<TopTeacher[]>([]);

   
  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
    fetchAttendance();
    fetchOverallStats();
    fetchTopTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply client-side filters when attendance, subject, or student search changes
  useEffect(() => {
    let filtered = [...attendance];
    
    if (selectedSubject && selectedSubject !== "all") {
      filtered = filtered.filter(a => a.subjectId === selectedSubject);
    }
    
    if (studentSearch.trim()) {
      const search = studentSearch.toLowerCase();
      filtered = filtered.filter(a => 
        a.studentName?.toLowerCase().includes(search)
      );
    }
    
    setFilteredAttendance(filtered);
  }, [attendance, selectedSubject, studentSearch]);

  // Small helper to fetch with timeout + retries
  const fetchWithRetry = async (
    url: string,
    opts: RequestInit = {},
    retries = 3,
    timeoutMs = 5000,
  ) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, { ...opts, signal: controller.signal });
        clearTimeout(id);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return await res.json();
      } catch (err) {
        clearTimeout(id);
        if (attempt === retries) throw err;
        // exponential backoff
        await new Promise((r) => setTimeout(r, 200 * Math.pow(2, attempt)));
      }
    }
    throw new Error('unreachable');
  };

  const fetchTeachers = async () => {
    try {
      const data = await fetchWithRetry('/api/admin/users?role=teacher', {}, 3, 5000);
      setTeachers(data.users || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to load teachers — retrying later');
      setTeachers([]);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await fetchWithRetry('/api/subjects', {}, 3, 5000);
      setSubjects(data.subjects || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
    }
  };

  const fetchAttendance = async (filters?: {
    teacherId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters?.teacherId && filters.teacherId !== "all") {
        params.append("teacherId", filters.teacherId);
      }
      if (filters?.startDate) {
        params.append("startDate", new Date(filters.startDate).toISOString());
      }
      if (filters?.endDate) {
        params.append("endDate", new Date(filters.endDate).toISOString());
      }

      const data = await fetchWithRetry(
        `/api/teacher/attendance?${params.toString()}`,
        {},
        3,
        8000
      );
      setAttendance(data.attendance || []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Failed to load attendance records — please try again");
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherStats = async (teacherId: string) => {
    if (!teacherId || teacherId === "all") {
      setTeacherStats(null);
      return;
    }

    try {
      setLoadingStats(true);
      const params = new URLSearchParams({ type: 'teacher', teacherId });
      if (startDate) params.append('startDate', new Date(startDate).toISOString());
      if (endDate) params.append('endDate', new Date(endDate).toISOString());

      const data = await fetchWithRetry(
        `/api/admin/analytics?${params.toString()}`,
        {},
        3,
        8000
      );
      setTeacherStats(data.stats);
    } catch (error) {
      console.error("Error fetching teacher stats:", error);
      toast.error("Failed to load teacher statistics — retrying");
      setTeacherStats(null);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchOverallStats = async () => {
    try {
      const params = new URLSearchParams({ type: 'overall' });
      const data = await fetchWithRetry(
        `/api/admin/analytics?${params.toString()}`,
        {},
        3,
        8000
      );
      setOverallStats(data.stats);
    } catch (error) {
      console.error("Error fetching overall stats:", error);
    }
  };

  const fetchTopTeachers = async () => {
    try {
      const params = new URLSearchParams({ type: 'top-teachers', limit: '5' });
      const data = await fetchWithRetry(
        `/api/admin/analytics?${params.toString()}`,
        {},
        3,
        8000
      );
      setTopTeachers(data.teachers || []);
    } catch (error) {
      console.error("Error fetching top teachers:", error);
    }
  };

  const handleFilter = () => {
    fetchAttendance({
      teacherId: selectedTeacher,
      startDate,
      endDate,
    });
    if (selectedTeacher && selectedTeacher !== "all") {
      fetchTeacherStats(selectedTeacher);
    }
  };

  const handleReset = () => {
    setSelectedTeacher("all");
    setSelectedSubject("all");
    setStudentSearch("");
    setStartDate("");
    setEndDate("");
    setTeacherStats(null);
    fetchAttendance();
  };

  const applyDatePreset = (preset: "today" | "week" | "month") => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (preset) {
      case "today":
        setStartDate(today.toISOString().split("T")[0]);
        setEndDate(today.toISOString().split("T")[0]);
        break;
      case "week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Sunday
        setStartDate(weekStart.toISOString().split("T")[0]);
        setEndDate(today.toISOString().split("T")[0]);
        break;
      case "month":
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        setStartDate(monthStart.toISOString().split("T")[0]);
        setEndDate(today.toISOString().split("T")[0]);
        break;
    }
  };

  const handleTeacherSelect = (teacherId: string) => {
    setSelectedTeacher(teacherId);
    if (teacherId !== "all") {
      fetchTeacherStats(teacherId);
      setActiveTab("teacher-details");
    } else {
      setTeacherStats(null);
    }
  };

  const getDurationLabel = (duration: string) => {
    const labels: Record<string, string> = {
      "30min": "30 min",
      "1hr": "1 hour",
      "1.5hr": "1.5 hours",
      "2hr": "2 hours",
    };
    return labels[duration] || duration;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const exportToCSV = () => {
    const headers = ["Date", "Teacher", "Student", "Subject", "Start Time", "Duration", "Notes"];
    const rows = filteredAttendance.map((record) => [
      formatDate(record.classDate),
      record.teacherName,
      record.studentName,
      record.subjectName,
      formatTime(record.startTime),
      getDurationLabel(record.duration),
      record.notes || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `class-attendance-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate stats from filtered attendance for display
  const displayData = filteredAttendance.length > 0 ? filteredAttendance : attendance;
  const totalClasses = displayData.length;
  const uniqueTeachersCount = new Set(displayData.map((a) => a.teacherId)).size;
  const totalHours = displayData.reduce((sum, record) => {
    const hours: Record<string, number> = {
      "30min": 0.5,
      "1hr": 1,
      "1.5hr": 1.5,
      "2hr": 2,
    };
    return sum + (hours[record.duration] || 0);
  }, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Class Attendance Analytics
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Comprehensive attendance tracking and teacher performance analytics
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="teacher-details" disabled={!teacherStats}>
            <User className="h-4 w-4 mr-2" />
            Teacher Details
          </TabsTrigger>
          <TabsTrigger value="records">
            <Calendar className="h-4 w-4 mr-2" />
            All Records
          </TabsTrigger>
          <TabsTrigger value="top-performers">
            <Award className="h-4 w-4 mr-2" />
            Top Performers
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Total Classes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{overallStats?.totalClasses || totalClasses}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Active Teachers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{overallStats?.uniqueTeachers || uniqueTeachersCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Teaching actively</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Total Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalHours.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground mt-1">Hours taught</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{overallStats?.uniqueStudents || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Receiving classes</p>
              </CardContent>
            </Card>
          </div>

          {/* Search Teacher */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Teacher
              </CardTitle>
              <CardDescription>Select a teacher to view detailed analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="teacher-search">Teacher</Label>
                  <Select value={selectedTeacher} onValueChange={handleTeacherSelect}>
                    <SelectTrigger id="teacher-search">
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Teachers</SelectItem>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate-search">Start Date</Label>
                  <Input
                    id="startDate-search"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate-search">End Date</Label>
                  <Input
                    id="endDate-search"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject-filter">Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger id="subject-filter">
                      <SelectValue placeholder="All subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-search">Student Name</Label>
                  <Input
                    id="student-search"
                    type="text"
                    placeholder="Search by student name"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleFilter}>
                  Apply Filters
                </Button>
                <Button onClick={handleReset} variant="outline">
                  Reset
                </Button>
                <div className="flex-1" />
                <Button variant="outline" size="sm" onClick={() => applyDatePreset("today")}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={() => applyDatePreset("week")}>
                  This Week
                </Button>
                <Button variant="outline" size="sm" onClick={() => applyDatePreset("month")}>
                  This Month
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teacher Details Tab */}
        <TabsContent value="teacher-details" className="space-y-6">
          {loadingStats ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">Loading teacher statistics...</div>
              </CardContent>
            </Card>
          ) : teacherStats ? (
            <>
              {/* Teacher Performance Summary */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Classes Conducted
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{teacherStats.totalClasses}</div>
                    <Badge variant="outline" className="mt-2 bg-green-50 text-green-700">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {teacherStats.attendanceRate}% Rate
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{teacherStats.totalHours.toFixed(1)}</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Teaching hours
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Students Taught
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{teacherStats.uniqueStudents}</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {teacherStats.uniqueSubjects} subjects
                    </p>
                  </CardContent>
                </Card>

                <Card className={teacherStats.missedCount > 0 ? "border-orange-200" : ""}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Missed Classes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600">{teacherStats.missedCount}</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Not conducted
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Duration Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Class Duration Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    {Object.entries(teacherStats.durationBreakdown).map(([duration, count]) => (
                      <div key={duration} className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-sm text-muted-foreground">{getDurationLabel(duration)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Student-wise Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Student-wise Breakdown</CardTitle>
                  <CardDescription>Classes conducted for each student</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {teacherStats.studentStats.map((student) => (
                      <div key={student.studentId} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{student.studentName}</div>
                          <div className="text-sm text-muted-foreground">
                            {student.subjects.join(", ")}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{student.totalClasses} classes</div>
                          <div className="text-sm text-muted-foreground">{student.totalHours.toFixed(1)} hours</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Subject-wise Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Subject-wise Breakdown</CardTitle>
                  <CardDescription>Classes per subject</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {teacherStats.subjectStats.map((subject) => (
                      <div key={subject.subjectId} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{subject.subjectName}</div>
                          <div className="text-sm text-muted-foreground">
                            {subject.totalHours.toFixed(1)} hours
                          </div>
                        </div>
                        <div className="text-2xl font-bold">{subject.totalClasses}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Missed Classes */}
              {teacherStats.missedCount > 0 && (
                <Card className="border-orange-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                      <AlertCircle className="h-5 w-5" />
                      Missed Classes ({teacherStats.missedCount})
                    </CardTitle>
                    <CardDescription>Classes that were scheduled but not conducted</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {teacherStats.missedClasses.map((missed, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50 dark:bg-orange-950">
                          <div className="space-y-1">
                            <div className="font-medium">{missed.studentName} - {missed.subjectName}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(missed.date)} ({missed.dayName})
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="bg-white">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTime(missed.scheduledStartTime)} - {formatTime(missed.scheduledEndTime)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Select a teacher from the Overview tab to view detailed statistics
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* All Records Tab */}
        <TabsContent value="records" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher-filter">Teacher</Label>
                  <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                    <SelectTrigger id="teacher-filter">
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Teachers</SelectItem>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate-filter">Start Date</Label>
                  <Input
                    id="startDate-filter"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate-filter">End Date</Label>
                  <Input
                    id="endDate-filter"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject-filter-2">Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger id="subject-filter-2">
                      <SelectValue placeholder="All subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-search-2">Student Name</Label>
                  <Input
                    id="student-search-2"
                    type="text"
                    placeholder="Search by student name"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-3">
                  <Label>&nbsp;</Label>
                  <div className="flex gap-2">
                    <Button onClick={handleFilter}>
                      Apply Filters
                    </Button>
                    <Button onClick={handleReset} variant="outline">
                      Reset
                    </Button>
                    <div className="flex-1" />
                    <Button variant="outline" size="sm" onClick={() => applyDatePreset("today")}>
                      Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => applyDatePreset("week")}>
                      This Week
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => applyDatePreset("month")}>
                      This Month
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Records */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Attendance Records</CardTitle>
                  <CardDescription>
                    Showing {filteredAttendance.length} record{filteredAttendance.length !== 1 ? 's' : ''}
                    {filteredAttendance.length !== attendance.length && ` (filtered from ${attendance.length} total)`}
                  </CardDescription>
                </div>
                <Button onClick={exportToCSV} variant="outline" size="sm" disabled={filteredAttendance.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : filteredAttendance.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No attendance records found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAttendance.map((record) => (
                    <div
                      key={record.id}
                      className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(record.classDate)}
                            </Badge>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTime(record.startTime)}
                            </Badge>
                            <Badge variant="outline">
                              {getDurationLabel(record.duration)}
                            </Badge>
                          </div>

                          <div className="grid md:grid-cols-3 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <span className="text-muted-foreground">Teacher:</span>{" "}
                                <span className="font-medium">{record.teacherName}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <span className="text-muted-foreground">Student:</span>{" "}
                                <span className="font-medium">{record.studentName}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <span className="text-muted-foreground">Subject:</span>{" "}
                                <span className="font-medium">{record.subjectName}</span>
                              </div>
                            </div>
                          </div>

                          {record.notes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              <strong>Notes:</strong> {record.notes}
                            </p>
                          )}

                          <p className="text-xs text-muted-foreground">
                            Marked at: {new Date(record.markedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Performers Tab */}
        <TabsContent value="top-performers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Top Performing Teachers
              </CardTitle>
              <CardDescription>
                Teachers ranked by total classes conducted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTeachers.map((teacher, index) => (
                  <div
                    key={teacher.teacherId}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`text-2xl font-bold ${
                        index === 0 ? "text-yellow-500" :
                        index === 1 ? "text-gray-400" :
                        index === 2 ? "text-orange-600" : "text-gray-600"
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-lg">{teacher.teacherName}</div>
                        <div className="text-sm text-muted-foreground">
                          {teacher.uniqueStudents} students taught
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">{teacher.totalClasses}</div>
                      <div className="text-sm text-muted-foreground">classes</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
