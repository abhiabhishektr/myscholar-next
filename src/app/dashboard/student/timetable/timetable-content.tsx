"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, BookOpen, User } from "lucide-react";
import { toast } from "react-hot-toast";

interface TimetableEntry {
  id: string;
  day: string;
  subjectName: string;
  teacherName: string;
  startTime: string;
  endTime: string;
  notes: string | null;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function StudentTimetableContent() {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    fetchTimetable();
  }, []);

  useEffect(() => {
    // Set today as default selected day
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    setSelectedDay(today);
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/student/timetable");
      const data = await response.json();

      if (data.success) {
        setTimetable(data.data || []);
      } else {
        toast.error("Failed to load timetable");
      }
    } catch (error) {
      console.error("Error fetching timetable:", error);
      toast.error("Error loading timetable");
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

  const getClassesByDay = (day: string) => {
    return timetable.filter((entry) => entry.day === day);
  };

  const totalClasses = timetable.length;
  const uniqueTeachers = new Set(timetable.map((t) => t.teacherName)).size;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const classesToday = getClassesByDay(today).length;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading timetable...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">My Timetable</h1>
          <p className="text-muted-foreground mt-1">Your weekly class schedule</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Classes/Week</p>
                  <h3 className="text-2xl font-bold">{totalClasses}</h3>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Teachers</p>
                  <h3 className="text-2xl font-bold">{uniqueTeachers}</h3>
                </div>
                <User className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Classes Today</p>
                  <h3 className="text-2xl font-bold">{classesToday}</h3>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Day Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const dayClasses = getClassesByDay(day);
                const isToday = day === today;
                const isSelected = day === selectedDay;

                return (
                  <Button
                    key={day}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => setSelectedDay(day)}
                    className="relative"
                  >
                    {day}
                    {isToday && (
                      <Badge className="ml-2" variant="secondary">
                        Today
                      </Badge>
                    )}
                    <Badge variant="secondary" className="ml-2">
                      {dayClasses.length}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Schedule */}
        {selectedDay && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {selectedDay} Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getClassesByDay(selectedDay).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No classes scheduled for {selectedDay}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getClassesByDay(selectedDay)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{entry.subjectName}</h4>
                            <p className="text-sm text-muted-foreground">
                              Teacher: {entry.teacherName}
                            </p>
                            {entry.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">
                              {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
