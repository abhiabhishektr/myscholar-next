"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, BookOpen, GraduationCap } from "lucide-react";
import { toast } from "react-hot-toast";

interface UpcomingClass {
  id: string;
  day: string;
  subjectName: string;
  teacherName: string;
  startTime: string;
  endTime: string;
}

interface StudentStats {
  totalClasses: number;
  totalHours: number;
  upcomingToday: number;
  totalSubjects: number;
}

interface StudentDashboardContentProps {
  studentId: string;
  studentName: string;
}

export default function StudentDashboardContent({ studentId, studentName }: StudentDashboardContentProps) {
  const [stats, setStats] = useState<StudentStats>({
    totalClasses: 0,
    totalHours: 0,
    upcomingToday: 0,
    totalSubjects: 0,
  });
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [studentId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch attendance history
      const attendanceRes = await fetch(`/api/student/attendance`);
      const attendanceData = await attendanceRes.json();

      if (attendanceData.attendance) {
        const classes = attendanceData.attendance;
        const totalClasses = classes.length;
        const totalHours = classes.reduce((sum: number, cls: any) => {
          const durationMap: Record<string, number> = {
            "30min": 0.5,
            "1hr": 1,
            "1.5hr": 1.5,
            "2hr": 2,
          };
          return sum + (durationMap[cls.duration] || 0);
        }, 0);

        const subjects = new Set(classes.map((c: any) => c.subjectId));

        // Fetch timetable
        const timetableRes = await fetch(`/api/student/timetable`);
        const timetableData = await timetableRes.json();

        if (timetableData.success) {
          const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
          const todayClasses = timetableData.data.filter((c: any) => c.day === today);

          setStats({
            totalClasses,
            totalHours,
            upcomingToday: todayClasses.length,
            totalSubjects: subjects.size,
          });

          // Set upcoming classes (next 3)
          setUpcomingClasses(todayClasses.slice(0, 3));
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
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
          <h1 className="text-3xl font-bold">Welcome back, {studentName.split(" ")[0]}!</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s your learning progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-100">Total Classes</p>
                  <h3 className="text-3xl font-bold text-white mt-2">{stats.totalClasses}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-green-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-100">Total Hours</p>
                  <h3 className="text-3xl font-bold text-white mt-2">{stats.totalHours.toFixed(1)}</h3>
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
                  <p className="text-sm font-medium text-purple-100">Classes Today</p>
                  <h3 className="text-3xl font-bold text-white mt-2">{stats.upcomingToday}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-500 to-orange-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-100">Subjects</p>
                  <h3 className="text-3xl font-bold text-white mt-2">{stats.totalSubjects}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today&apos;s Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingClasses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No classes scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{cls.subjectName}</h4>
                        <p className="text-sm text-muted-foreground">Teacher: {cls.teacherName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                      </p>
                      <p className="text-sm text-muted-foreground">{cls.day}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
