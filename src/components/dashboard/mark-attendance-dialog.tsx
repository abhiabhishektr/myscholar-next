"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock } from "lucide-react";
import { toast } from "react-hot-toast";

interface MarkAttendanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classInfo: {
    timetableId: string;
    studentId: string;
    studentName: string;
    subjectId: string;
    subjectName: string;
    scheduledStartTime: string;
    scheduledEndTime: string;
  };
  teacherId: string;
  onSuccess?: () => void;
}

const DURATION_OPTIONS = [
  { value: "30min", label: "30 minutes" },
  { value: "1hr", label: "1 hour" },
  { value: "1.5hr", label: "1.5 hours" },
  { value: "2hr", label: "2 hours" },
] as const;

// Generate time options in 30-minute intervals
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      options.push({ value: timeString, label: displayTime });
    }
  }
  return options;
};

export function MarkAttendanceDialog({
  isOpen,
  onClose,
  classInfo,
  teacherId,
  onSuccess,
}: MarkAttendanceDialogProps) {
  const [startTime, setStartTime] = useState(classInfo.scheduledStartTime);
  const [duration, setDuration] = useState<"30min" | "1hr" | "1.5hr" | "2hr">("1hr");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeOptions = generateTimeOptions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/teacher/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacherId,
          studentId: classInfo.studentId,
          subjectId: classInfo.subjectId,
          timetableId: classInfo.timetableId,
          classDate: new Date().toISOString(),
          startTime,
          duration,
          notes: notes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to mark attendance");
      }

      toast.success("Class attendance marked successfully!");
      onSuccess?.();
      onClose();
      
      // Reset form
      setStartTime(classInfo.scheduledStartTime);
      setDuration("1hr");
      setNotes("");
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast.error(error instanceof Error ? error.message : "Failed to mark attendance");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Mark Class Attendance
            </DialogTitle>
            <DialogDescription>
              Mark attendance for <strong>{classInfo.studentName}</strong> - {classInfo.subjectName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Start Time */}
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger id="startTime">
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Scheduled: {new Date(`2000-01-01T${classInfo.scheduledStartTime}`).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Class Duration</Label>
              <Select value={duration} onValueChange={(value) => setDuration(value as typeof duration)}>
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about the class..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Marking..." : "Mark Attendance"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
