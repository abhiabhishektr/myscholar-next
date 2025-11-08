"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Search, Eye, Calendar, BookOpen, Clock, User, Mail, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import type { UserWithDetails } from "@/utils/users";

interface StudentTimetable {
  id: string;
  day: string;
  subjectName: string;
  teacherName: string;
  startTime: string;
  endTime: string;
  notes: string | null;
}

interface StudentStats {
  totalClasses: number;
  totalHours: number;
  subjects: string[];
  lastClass: string | null;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function StudentsPage() {
  const [students, setStudents] = useState<UserWithDetails[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<UserWithDetails | null>(null);
  const [studentTimetable, setStudentTimetable] = useState<StudentTimetable[]>([]);
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = students.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [students, searchQuery]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/teacher?action=students");
      const data = await response.json();

      if (data.success) {
        setStudents(data.data || []);
      } else {
        toast.error("Failed to load students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Error loading students");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetails = async (studentId: string) => {
    try {
      setLoadingDetails(true);

      // Fetch timetable
      const timetableResponse = await fetch(
        `/api/teacher?action=student-timetable&studentId=${studentId}`
      );
      const timetableData = await timetableResponse.json();

      if (timetableData.success) {
        setStudentTimetable(timetableData.data || []);
      }

      // Fetch student stats
      const statsResponse = await fetch(`/api/teacher/attendance?studentId=${studentId}`);
      const statsData = await statsResponse.json();

      if (statsData.success) {
        const attendance = statsData.attendance || [];
        const totalHours = attendance.reduce((sum: number, record: any) => {
          const hours: Record<string, number> = {
            "30min": 0.5,
            "1hr": 1,
            "1.5hr": 1.5,
            "2hr": 2,
          };
          return sum + (hours[record.duration] || 0);
        }, 0);

        const subjects = [...new Set(attendance.map((a: any) => a.subjectName))].filter(
          (s): s is string => typeof s === "string"
        );
        const lastClass = attendance.length > 0 ? attendance[0].classDate : null;

        setStudentStats({
          totalClasses: attendance.length,
          totalHours,
          subjects,
          lastClass,
        });
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
      toast.error("Error loading student details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewStudent = async (student: UserWithDetails) => {
    setSelectedStudent(student);
    setShowDetailsDialog(true);
    await fetchStudentDetails(student.id);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Students</h1>
          <p className="text-muted-foreground mt-1">View and manage students you teach</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <h3 className="text-2xl font-bold">{students.length}</h3>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Students</p>
                  <h3 className="text-2xl font-bold">
                    {students.filter((s) => !s.banned).length}
                  </h3>
                </div>
                <User className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Search Results</p>
                  <h3 className="text-2xl font-bold">{filteredStudents.length}</h3>
                </div>
                <Search className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle>Students List</CardTitle>
            <CardDescription>
              {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Loading students...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No students found</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredStudents.map((student) => (
                  <Card
                    key={student.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleViewStudent(student)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">
                              {student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{student.name}</h3>
                            <Badge variant={student.banned ? "destructive" : "secondary"}>
                              {student.banned ? "Inactive" : "Active"}
                            </Badge>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{student.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Joined {formatDate(student.createdAt.toString())}</span>
                        </div>
                      </div>

                      <Button variant="outline" size="sm" className="w-full mt-4">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {selectedStudent?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {selectedStudent?.name}
              </DialogTitle>
              <DialogDescription>{selectedStudent?.email}</DialogDescription>
            </DialogHeader>

            {loadingDetails ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Loading student details...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats */}
                {studentStats && (
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                          <p className="text-2xl font-bold">{studentStats.totalClasses}</p>
                          <p className="text-sm text-muted-foreground">Classes Taken</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <BookOpen className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                          <p className="text-2xl font-bold">{studentStats.totalHours.toFixed(1)}</p>
                          <p className="text-sm text-muted-foreground">Total Hours</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Calendar className="h-8 w-8 mx-auto mb-2 text-green-500" />
                          <p className="text-2xl font-bold">{studentStats.subjects.length}</p>
                          <p className="text-sm text-muted-foreground">Subjects</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Subjects */}
                {studentStats && studentStats.subjects.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Subjects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {studentStats.subjects.map((subject, index) => (
                          <Badge key={index} variant="secondary">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Timetable */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Weekly Timetable</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {studentTimetable.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No timetable created</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {DAYS_OF_WEEK.map((day) => {
                          const dayClasses = studentTimetable.filter((c) => c.day === day);
                          if (dayClasses.length === 0) return null;

                          return (
                            <div key={day} className="space-y-2">
                              <h4 className="font-semibold text-sm text-muted-foreground">
                                {day}
                              </h4>
                              <div className="space-y-2">
                                {dayClasses.map((cls) => (
                                  <div
                                    key={cls.id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                  >
                                    <div className="flex items-center gap-3">
                                      <BookOpen className="h-5 w-5 text-purple-500" />
                                      <div>
                                        <p className="font-medium">{cls.subjectName}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {cls.teacherName}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-medium">
                                        {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                                      </p>
                                    </div>
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
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
