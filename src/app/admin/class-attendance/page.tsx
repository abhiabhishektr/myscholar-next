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
import { Calendar, Clock, User, BookOpen, Filter, Download } from "lucide-react";
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

export default function ClassAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    fetchTeachers();
    fetchAttendance();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/users?role=teacher");
      if (!response.ok) throw new Error("Failed to fetch teachers");
      const data = await response.json();
      setTeachers(data.users || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Failed to load teachers");
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

      const response = await fetch(`/api/teacher/attendance?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch attendance");
      
      const data = await response.json();
      setAttendance(data.attendance || []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchAttendance({
      teacherId: selectedTeacher,
      startDate,
      endDate,
    });
  };

  const handleReset = () => {
    setSelectedTeacher("all");
    setStartDate("");
    setEndDate("");
    fetchAttendance();
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
    const rows = attendance.map((record) => [
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

  // Calculate stats
  const totalClasses = attendance.length;
  const uniqueTeachers = new Set(attendance.map((a) => a.teacherId)).size;
  const totalHours = attendance.reduce((sum, record) => {
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
          Class Attendance
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          View and track class attendance marked by teachers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalClasses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{uniqueTeachers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalHours.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter attendance records by teacher and date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="teacher">Teacher</Label>
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger id="teacher">
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
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <div className="flex gap-2">
                <Button onClick={handleFilter} className="flex-1">
                  Apply
                </Button>
                <Button onClick={handleReset} variant="outline">
                  Reset
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
            <CardTitle>Attendance Records</CardTitle>
            <Button onClick={exportToCSV} variant="outline" size="sm" disabled={attendance.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : attendance.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No attendance records found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {attendance.map((record) => (
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
    </div>
  );
}
