"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, User, CheckCircle2, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";
import { MarkAttendanceDialog } from "./mark-attendance-dialog";

interface ScheduledClass {
  id: string;
  studentId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  startTime: string;
  endTime: string;
  notes: string | null;
}

interface TodayClassesProps {
  teacherId: string;
}

export function TodayClasses({ teacherId }: TodayClassesProps) {
  const [classes, setClasses] = useState<ScheduledClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<ScheduledClass | null>(null);
  const [markedClasses, setMarkedClasses] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTodayClasses();
    checkMarkedClasses();
  }, []);

  const fetchTodayClasses = async () => {
    try {
      const response = await fetch("/api/teacher/scheduled-classes");
      if (!response.ok) {
        throw new Error("Failed to fetch scheduled classes");
      }
      const data = await response.json();
      setClasses(data.classes || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to load today's classes");
    } finally {
      setLoading(false);
    }
  };

  const checkMarkedClasses = async () => {
    try {
      const today = new Date();
      const startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const response = await fetch(
        `/api/teacher/attendance?startDate=${startDate}&endDate=${endDate}`
      );
      if (response.ok) {
        const data = await response.json();
        const marked = new Set<string>(
          data.attendance.map(
            (a: any) => `${a.studentId}-${a.subjectId}`
          )
        );
        setMarkedClasses(marked);
      }
    } catch (error) {
      console.error("Error checking marked classes:", error);
    }
  };

  const isClassMarked = (studentId: string, subjectId: string) => {
    return markedClasses.has(`${studentId}-${subjectId}`);
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

  const getCurrentTimeStatus = (startTime: string, endTime: string) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    
    const [endHours, endMinutes] = endTime.split(":").map(Number);
    const endTotalMinutes = endHours * 60 + endMinutes;

    if (currentMinutes < startTotalMinutes - 15) {
      return { status: "upcoming", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" };
    } else if (currentMinutes >= startTotalMinutes - 15 && currentMinutes <= endTotalMinutes + 15) {
      return { status: "ongoing", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" };
    } else {
      return { status: "completed", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today&apos;s Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading classes...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today&apos;s Classes
          </CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No classes scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {classes.map((classItem) => {
                const marked = isClassMarked(classItem.studentId, classItem.subjectId);
                const timeStatus = getCurrentTimeStatus(classItem.startTime, classItem.endTime);
                
                return (
                  <div
                    key={classItem.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{classItem.subjectName}</span>
                          <Badge variant="outline" className={timeStatus.color}>
                            {timeStatus.status}
                          </Badge>
                          {marked && (
                            <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Marked
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>{classItem.studentName}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
                          </span>
                        </div>
                        
                        {classItem.notes && (
                          <p className="text-sm text-muted-foreground">
                            Note: {classItem.notes}
                          </p>
                        )}
                      </div>
                      
                      <Button
                        size="sm"
                        disabled={marked}
                        onClick={() => setSelectedClass(classItem)}
                        className="ml-4"
                      >
                        {marked ? "Marked" : "Mark Attendance"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedClass && (
        <MarkAttendanceDialog
          isOpen={!!selectedClass}
          onClose={() => setSelectedClass(null)}
          classInfo={{
            timetableId: selectedClass.id,
            studentId: selectedClass.studentId,
            studentName: selectedClass.studentName,
            subjectId: selectedClass.subjectId,
            subjectName: selectedClass.subjectName,
            scheduledStartTime: selectedClass.startTime,
            scheduledEndTime: selectedClass.endTime,
          }}
          teacherId={teacherId}
          onSuccess={() => {
            checkMarkedClasses();
            setSelectedClass(null);
          }}
        />
      )}
    </>
  );
}
