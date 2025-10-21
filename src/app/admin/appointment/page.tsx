"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/ui/date-time-picker";

export default function AppointmentPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Appointment</h1>

      <div className="space-y-4">
        <div>
          <Label htmlFor="student-search">Search Student</Label>
          <Input
            id="student-search"
            placeholder="Search for a student..."
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="teacher-search">Search Teacher</Label>
          <Input
            id="teacher-search"
            placeholder="Search for a teacher..."
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>From Time</Label>
            <div className="mt-1">
              <DateTimePicker />
            </div>
          </div>

          <div>
            <Label>To Time</Label>
            <div className="mt-1">
              <DateTimePicker />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}