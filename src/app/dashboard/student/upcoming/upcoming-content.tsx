"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BookOpen } from "lucide-react";
import { toast } from "react-hot-toast";

interface UpcomingClass {
  id: string;
  day: string;
  subjectName: string;
  teacherName: string;
  startTime: string;
  endTime: string;
  notes: string | null;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function StudentUpcomingContent() {
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<"today" | "tomorrow" | "week">("today");

  useEffect(() => {
    fetchUpcomingClasses();
  }, []);

  const fetchUpcomingClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/student/timetable");
      const data = await response.json();

      if (data.success) {
        setUpcomingClasses(data.data || []);
      } else {
        toast.error("Failed to load upcoming classes");
      }
    } catch (error) {
      console.error("Error fetching upcoming classes:", error);
      toast.error("Error loading upcoming classes");
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

  const getFilteredClasses = () => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
      weekday: "long",
    });

    if (selectedFilter === "today") {
      return upcomingClasses.filter((cls) => cls.day === today);
    } else if (selectedFilter === "tomorrow") {
      return upcomingClasses.filter((cls) => cls.day === tomorrow);
    } else {
      // This week
      return upcomingClasses;
    }
  };

  const filteredClasses = getFilteredClasses();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading upcoming classes...</p>
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
          <h1 className="text-3xl font-bold">Upcoming Classes</h1>
          <p className="text-muted-foreground mt-1">Plan your schedule ahead</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <Badge
            variant={selectedFilter === "today" ? "default" : "outline"}
            className="cursor-pointer px-4 py-2"
            onClick={() => setSelectedFilter("today")}
          >
            Today
          </Badge>
          <Badge
            variant={selectedFilter === "tomorrow" ? "default" : "outline"}
            className="cursor-pointer px-4 py-2"
            onClick={() => setSelectedFilter("tomorrow")}
          >
            Tomorrow
          </Badge>
          <Badge
            variant={selectedFilter === "week" ? "default" : "outline"}
            className="cursor-pointer px-4 py-2"
            onClick={() => setSelectedFilter("week")}
          >
            This Week
          </Badge>
        </div>

        {/* Classes List */}
        {selectedFilter === "week" ? (
          // Group by day for week view
          <div className="space-y-6">
            {DAYS_OF_WEEK.map((day) => {
              const dayClasses = upcomingClasses.filter((cls) => cls.day === day);
              if (dayClasses.length === 0) return null;

              return (
                <Card key={day}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {day}
                      <Badge variant="secondary">{dayClasses.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dayClasses
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((cls) => (
                          <div
                            key={cls.id}
                            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{cls.subjectName}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Teacher: {cls.teacherName}
                                </p>
                                {cls.notes && (
                                  <p className="text-xs text-muted-foreground mt-1">{cls.notes}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <p className="font-medium">
                                  {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          // Single day view
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {selectedFilter === "today" ? "Today's" : "Tomorrow's"} Classes
                <Badge variant="secondary">{filteredClasses.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredClasses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No classes scheduled for {selectedFilter}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredClasses
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((cls) => (
                      <div
                        key={cls.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{cls.subjectName}</h4>
                            <p className="text-sm text-muted-foreground">
                              Teacher: {cls.teacherName}
                            </p>
                            {cls.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{cls.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">
                              {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
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
