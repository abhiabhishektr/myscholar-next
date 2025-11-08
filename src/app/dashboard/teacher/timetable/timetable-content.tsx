"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BookOpen, User } from "lucide-react";
import { toast } from "react-hot-toast";

interface TimetableEntry {
  id: string;
  studentId: string;
  teacherId: string;
  subjectId: string;
  subjectName: string;
  studentName: string;
  day: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  isActive: boolean;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function TimetablePage() {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>("");

  useEffect(() => {
    // Set current day as selected
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    setSelectedDay(today);
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/teacher?action=upcoming");
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

  const getClassesForDay = (day: string) => {
    return timetable
      .filter((entry) => entry.day === day && entry.isActive)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getTodayClasses = () => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    return getClassesForDay(today);
  };

  const getUpcomingClassesToday = () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

    return timetable
      .filter(
        (entry) =>
          entry.day === today && entry.isActive && entry.startTime > currentTime
      )
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .slice(0, 3);
  };

  const totalClasses = timetable.filter((t) => t.isActive).length;
  const uniqueStudents = new Set(timetable.filter((t) => t.isActive).map((t) => t.studentId)).size;
  const todayClasses = getTodayClasses().length;

  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Timetable</h1>
          <p className="text-muted-foreground mt-1">View your weekly teaching schedule</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
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
                  <p className="text-sm text-muted-foreground">Students</p>
                  <h3 className="text-2xl font-bold">{uniqueStudents}</h3>
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
                  <h3 className="text-2xl font-bold">{todayClasses}</h3>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Classes Today */}
        {getUpcomingClassesToday().length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Upcoming Classes Today
              </CardTitle>
              <CardDescription>Your next classes for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getUpcomingClassesToday().map((cls) => (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-900/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{cls.subjectName}</h4>
                        <p className="text-sm text-muted-foreground">{cls.studentName}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="default">Upcoming</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Day Tabs */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedDay === day
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {day}
                  <span className="ml-2 text-xs">({getClassesForDay(day).length})</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Timetable */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {selectedDay}&apos;s Schedule
            </CardTitle>
            <CardDescription>
              {getClassesForDay(selectedDay).length} class
              {getClassesForDay(selectedDay).length !== 1 ? "es" : ""} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Loading timetable...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {DAYS_OF_WEEK.map((day) => {
                  if (day !== selectedDay) return null;

                  const dayClasses = getClassesForDay(day);

                  if (dayClasses.length === 0) {
                    return (
                      <div key={day} className="text-center py-12">
                        <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No classes scheduled for {day}</p>
                      </div>
                    );
                  }

                  return (
                    <div key={day} className="space-y-3">
                      {dayClasses.map((cls) => (
                        <div
                          key={cls.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shrink-0">
                              <BookOpen className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-lg">{cls.subjectName}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground truncate">
                                  {cls.studentName}
                                </p>
                              </div>
                              {cls.notes && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                  {cls.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-4 shrink-0">
                            <div className="flex items-center gap-2 text-primary font-semibold">
                              <Clock className="h-4 w-4" />
                              <span>
                                {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                              </span>
                            </div>
                            <Badge variant="secondary" className="mt-2">
                              {cls.day}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Week Overview */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Week Overview
            </CardTitle>
            <CardDescription>Quick view of all your classes this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {DAYS_OF_WEEK.map((day) => {
                const dayClasses = getClassesForDay(day);
                const isToday =
                  day === new Date().toLocaleDateString("en-US", { weekday: "long" });

                return (
                  <div key={day} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                        {day}
                        {isToday && <Badge variant="default">Today</Badge>}
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        {dayClasses.length} class{dayClasses.length !== 1 ? "es" : ""}
                      </span>
                    </div>

                    {dayClasses.length === 0 ? (
                      <p className="text-sm text-muted-foreground pl-4">No classes</p>
                    ) : (
                      <div className="grid gap-2 md:grid-cols-2">
                        {dayClasses.map((cls) => (
                          <div
                            key={cls.id}
                            className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
                          >
                            <BookOpen className="h-5 w-5 text-purple-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{cls.subjectName}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {cls.studentName}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs font-medium">{formatTime(cls.startTime)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
