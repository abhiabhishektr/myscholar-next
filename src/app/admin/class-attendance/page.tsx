"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { TeacherSelector } from "@/components/admin/teacher-selector";
import { StudentSelector } from "@/components/admin/student-selector";
import type { UserWithDetails } from "@/utils/users";

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

interface StudentStats {
  totalClasses: number;
  totalHours: number;
  uniqueTeachers: number;
  uniqueSubjects: number;
  durationBreakdown: Record<string, number>;
  teacherStats: Array<{
    teacherId: string;
    teacherName: string;
    totalClasses: number;
    totalHours: number;
    subjects: string[];
  }>;
  subjectStats: Array<{
    subjectId: string;
    subjectName: string;
    totalClasses: number;
    totalHours: number;
    teachers: string[];
  }>;
  monthlyStats: Array<{
    month: string;
    totalClasses: number;
    totalHours: number;
  }>;
  recentClasses: AttendanceRecord[];
}

export default function ClassAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<AttendanceRecord[]>([]);
  const [teachers, setTeachers] = useState<UserWithDetails[]>([]);
  const [students, setStudents] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [studentSearch, setStudentSearch] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState("overview");
  
  // Teacher Details
  const [teacherStats, setTeacherStats] = useState<TeacherStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  
  // Student Details
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [loadingStudentStats, setLoadingStudentStats] = useState(false);
  
  // Overall Stats
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [topTeachers, setTopTeachers] = useState<TopTeacher[]>([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const ITEMS_PER_PAGE = 10;
  const INITIAL_DISPLAY_LIMIT = 5;

   
  useEffect(() => {
    fetchTeachers();
    fetchStudents();
    fetchAttendance();
    fetchOverallStats();
    fetchTopTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply client-side filters when attendance or student search changes
  useEffect(() => {
    let filtered = [...attendance];
    
    if (studentSearch.trim()) {
      const search = studentSearch.toLowerCase();
      filtered = filtered.filter(a => 
        a.studentName?.toLowerCase().includes(search)
      );
    }
    
    setFilteredAttendance(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [attendance, studentSearch]);

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

  const fetchStudents = async () => {
    try {
      const data = await fetchWithRetry('/api/admin/users?role=student', {}, 3, 5000);
      setStudents(data.users || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students — retrying later');
      setStudents([]);
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
      const records = data.attendance || [];
      setAttendance(records);
      
      // Show warning for large datasets
      if (records.length > 100) {
        toast.success(`Loaded ${records.length} records. Use filters for better performance.`, {
          duration: 4000,
        });
      }
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

  const fetchStudentStats = async (studentId: string) => {
    if (!studentId || studentId === "all") {
      setStudentStats(null);
      return;
    }

    try {
      setLoadingStudentStats(true);
      const params = new URLSearchParams({ type: 'student', studentId });
      if (startDate) params.append('startDate', new Date(startDate).toISOString());
      if (endDate) params.append('endDate', new Date(endDate).toISOString());

      const data = await fetchWithRetry(
        `/api/admin/analytics?${params.toString()}`,
        {},
        3,
        8000
      );
      setStudentStats(data.stats);
    } catch (error) {
      console.error("Error fetching student stats:", error);
      toast.error("Failed to load student statistics — retrying");
      setStudentStats(null);
    } finally {
      setLoadingStudentStats(false);
    }
  };

  const handleFilter = () => {
    fetchAttendance({
      teacherId: selectedTeacher,
      startDate,
      endDate,
    });
    setCurrentPage(1); // Reset to first page
    if (selectedTeacher && selectedTeacher !== "all") {
      fetchTeacherStats(selectedTeacher);
    }
  };

  const handleReset = () => {
    setSelectedTeacher("all");
    setSelectedStudent("all");
    setStudentSearch("");
    setStartDate("");
    setEndDate("");
    setTeacherStats(null);
    setStudentStats(null);
    setCurrentPage(1); // Reset to first page
    setShowAllStudents(false);
    setShowAllSubjects(false);
    fetchAttendance();
  };

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudent(studentId);
    if (studentId !== "all") {
      fetchStudentStats(studentId);
      setActiveTab("student-details");
    } else {
      setStudentStats(null);
    }
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
      "45min": "45 min",
      "1hr": "1 hour",
      "1.5hr": "1h 30min",
      "1.75hr": "1h 45min",
      "2hr": "2 hours",
      "2.5hr": "2h 30min",
      "3hr": "3 hours",
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
      "45min": 0.75,
      "1hr": 1,
      "1.5hr": 1.5,
      "1.75hr": 1.75,
      "2hr": 2,
      "2.5hr": 2.5,
      "3hr": 3,
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="teacher-details" disabled={!teacherStats}>
            <User className="h-4 w-4 mr-2" />
            Teacher Details
          </TabsTrigger>
          <TabsTrigger value="student-details" disabled={!studentStats}>
            <Users className="h-4 w-4 mr-2" />
            Student Details
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
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Teacher</Label>
                  <TeacherSelector
                    teachers={teachers}
                    selectedTeacherId={selectedTeacher}
                    onTeacherChange={handleTeacherSelect}
                    placeholder="Search and select teacher..."
                    className="w-full"
                  />
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

          {/* Search Student */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Search Student
              </CardTitle>
              <CardDescription>Select a student to view detailed attendance history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Student</Label>
                  <StudentSelector
                    students={students}
                    selectedStudentId={selectedStudent}
                    onStudentChange={handleStudentSelect}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate-student">Start Date</Label>
                  <Input
                    id="startDate-student"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate-student">End Date</Label>
                  <Input
                    id="endDate-student"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => {
                  if (selectedStudent !== "all") {
                    fetchStudentStats(selectedStudent);
                  }
                }}>
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
              <CardContent className="py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">Loading teacher statistics...</p>
                </div>
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
                  {Object.keys(teacherStats.durationBreakdown).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No duration data available</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-4">
                      {Object.entries(teacherStats.durationBreakdown).map(([duration, count]) => (
                        <div key={duration} className="text-center p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                          <div className="text-2xl font-bold">{count}</div>
                          <div className="text-sm text-muted-foreground">{getDurationLabel(duration)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Student-wise Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Student-wise Breakdown</CardTitle>
                  <CardDescription>
                    Classes conducted for each student
                    {teacherStats.studentStats.length > INITIAL_DISPLAY_LIMIT && 
                      ` (${teacherStats.studentStats.length} students)`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {teacherStats.studentStats.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No student data available</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {(showAllStudents 
                          ? teacherStats.studentStats 
                          : teacherStats.studentStats.slice(0, INITIAL_DISPLAY_LIMIT)
                        ).map((student) => (
                          <div key={student.studentId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{student.studentName}</div>
                              <div className="text-sm text-muted-foreground truncate">
                                {student.subjects.join(", ")}
                              </div>
                            </div>
                            <div className="text-right ml-4 shrink-0">
                              <div className="font-bold">{student.totalClasses} classes</div>
                              <div className="text-sm text-muted-foreground">{student.totalHours.toFixed(1)} hours</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {teacherStats.studentStats.length > INITIAL_DISPLAY_LIMIT && (
                        <div className="mt-4 text-center">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setShowAllStudents(!showAllStudents)}
                          >
                            {showAllStudents ? 'Show Less' : `Show All ${teacherStats.studentStats.length} Students`}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Subject-wise Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Subject-wise Breakdown</CardTitle>
                  <CardDescription>
                    Classes per subject
                    {teacherStats.subjectStats.length > INITIAL_DISPLAY_LIMIT && 
                      ` (${teacherStats.subjectStats.length} subjects)`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {teacherStats.subjectStats.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No subject data available</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                        {(showAllSubjects 
                          ? teacherStats.subjectStats 
                          : teacherStats.subjectStats.slice(0, INITIAL_DISPLAY_LIMIT)
                        ).map((subject) => (
                          <div key={subject.subjectId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{subject.subjectName}</div>
                              <div className="text-sm text-muted-foreground">
                                {subject.totalHours.toFixed(1)} hours
                              </div>
                            </div>
                            <div className="text-2xl font-bold ml-4 shrink-0">{subject.totalClasses}</div>
                          </div>
                        ))}
                      </div>
                      {teacherStats.subjectStats.length > INITIAL_DISPLAY_LIMIT && (
                        <div className="mt-4 text-center">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setShowAllSubjects(!showAllSubjects)}
                          >
                            {showAllSubjects ? 'Show Less' : `Show All ${teacherStats.subjectStats.length} Subjects`}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
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

        {/* Student Details Tab */}
        <TabsContent value="student-details" className="space-y-6">
          {loadingStudentStats ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">Loading student statistics...</p>
                </div>
              </CardContent>
            </Card>
          ) : studentStats ? (
            <>
              {/* Student Performance Summary */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Classes Attended
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{studentStats.totalClasses}</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Total sessions
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{studentStats.totalHours.toFixed(1)}</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Learning hours
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Teachers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{studentStats.uniqueTeachers}</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {studentStats.uniqueSubjects} subjects
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Average Hours/Month
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {studentStats.monthlyStats.length > 0
                        ? (studentStats.totalHours / studentStats.monthlyStats.length).toFixed(1)
                        : "0"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Per month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Duration Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Class Duration Distribution</CardTitle>
                  <CardDescription>Breakdown of class lengths attended</CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(studentStats.durationBreakdown).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No duration data available</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-4">
                      {Object.entries(studentStats.durationBreakdown).map(([duration, count]) => (
                        <div key={duration} className="text-center p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                          <div className="text-2xl font-bold">{count}</div>
                          <div className="text-sm text-muted-foreground">{getDurationLabel(duration)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Teacher-wise Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Teacher-wise Breakdown</CardTitle>
                  <CardDescription>
                    Classes attended from each teacher
                    {studentStats.teacherStats.length > INITIAL_DISPLAY_LIMIT && 
                      ` (${studentStats.teacherStats.length} teachers)`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {studentStats.teacherStats.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No teacher data available</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {(showAllStudents 
                          ? studentStats.teacherStats 
                          : studentStats.teacherStats.slice(0, INITIAL_DISPLAY_LIMIT)
                        ).map((teacher) => (
                          <div key={teacher.teacherId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{teacher.teacherName}</div>
                              <div className="text-sm text-muted-foreground truncate">
                                {teacher.subjects.join(", ")}
                              </div>
                            </div>
                            <div className="text-right ml-4 shrink-0">
                              <div className="font-bold">{teacher.totalClasses} classes</div>
                              <div className="text-sm text-muted-foreground">{teacher.totalHours.toFixed(1)} hours</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {studentStats.teacherStats.length > INITIAL_DISPLAY_LIMIT && (
                        <div className="mt-4 text-center">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setShowAllStudents(!showAllStudents)}
                          >
                            {showAllStudents ? 'Show Less' : `Show All ${studentStats.teacherStats.length} Teachers`}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Subject-wise Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Subject-wise Breakdown</CardTitle>
                  <CardDescription>
                    Classes per subject with teacher details
                    {studentStats.subjectStats.length > INITIAL_DISPLAY_LIMIT && 
                      ` (${studentStats.subjectStats.length} subjects)`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {studentStats.subjectStats.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No subject data available</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                        {(showAllSubjects 
                          ? studentStats.subjectStats 
                          : studentStats.subjectStats.slice(0, INITIAL_DISPLAY_LIMIT)
                        ).map((subject) => (
                          <div key={subject.subjectId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{subject.subjectName}</div>
                              <div className="text-sm text-muted-foreground truncate">
                                Teachers: {subject.teachers.join(", ")}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {subject.totalHours.toFixed(1)} hours
                              </div>
                            </div>
                            <div className="text-2xl font-bold ml-4 shrink-0">{subject.totalClasses}</div>
                          </div>
                        ))}
                      </div>
                      {studentStats.subjectStats.length > INITIAL_DISPLAY_LIMIT && (
                        <div className="mt-4 text-center">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setShowAllSubjects(!showAllSubjects)}
                          >
                            {showAllSubjects ? 'Show Less' : `Show All ${studentStats.subjectStats.length} Subjects`}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Monthly Trend */}
              {studentStats.monthlyStats.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Attendance Trend</CardTitle>
                    <CardDescription>Classes and hours per month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {studentStats.monthlyStats.map((month) => (
                        <div key={month.month} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {new Date(month.month + "-01").toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long"
                              })}
                            </span>
                          </div>
                          <div className="flex gap-6 text-sm">
                            <div>
                              <span className="text-muted-foreground">Classes: </span>
                              <span className="font-bold">{month.totalClasses}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Hours: </span>
                              <span className="font-bold">{month.totalHours.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Classes */}
              {studentStats.recentClasses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Classes</CardTitle>
                    <CardDescription>Last 10 classes attended</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {studentStats.recentClasses.map((record) => (
                        <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(record.classDate)}
                              </Badge>
                              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTime(record.startTime)}
                              </Badge>
                              <Badge variant="outline">
                                {getDurationLabel(record.duration)}
                              </Badge>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">{record.teacherName}</span>
                              {" • "}
                              <span className="text-muted-foreground">{record.subjectName}</span>
                            </div>
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
                  Select a student from the Overview tab to view detailed attendance history
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
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Teacher</Label>
                  <TeacherSelector
                    teachers={teachers}
                    selectedTeacherId={selectedTeacher}
                    onTeacherChange={setSelectedTeacher}
                    placeholder="Search and select teacher..."
                    className="w-full"
                  />
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
                  <Label htmlFor="student-search-2">Student Name</Label>
                  <Input
                    id="student-search-2"
                    type="text"
                    placeholder="Search by student name"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
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
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredAttendance.length)} of {filteredAttendance.length} record{filteredAttendance.length !== 1 ? 's' : ''}
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
                <div className="flex flex-col items-center gap-3 py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">Loading attendance records...</p>
                </div>
              ) : filteredAttendance.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No attendance records found</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {filteredAttendance
                      .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                      .map((record) => (
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
                  
                  {/* Pagination Controls */}
                  {filteredAttendance.length > ITEMS_PER_PAGE && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Page {currentPage} of {Math.ceil(filteredAttendance.length / ITEMS_PER_PAGE)}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === Math.ceil(filteredAttendance.length / ITEMS_PER_PAGE)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
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
