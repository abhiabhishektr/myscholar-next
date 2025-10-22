"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
}

export default function AppointmentPage() {
  const [studentOpen, setStudentOpen] = useState(false);
  const [teacherOpen, setTeacherOpen] = useState(false);
  const [studentQuery, setStudentQuery] = useState("");
  const [teacherQuery, setTeacherQuery] = useState("");
  const [studentResults, setStudentResults] = useState<User[]>([]);
  const [teacherResults, setTeacherResults] = useState<User[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [startTime, setStartTime] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (studentQuery.length > 0) {
      fetch(`/api/users/search?query=${encodeURIComponent(studentQuery)}&role=student`)
        .then((res) => res.json())
        .then((data) => setStudentResults(Array.isArray(data) ? data : []))
        .catch(() => setStudentResults([]));
    } else {
      setStudentResults([]);
    }
  }, [studentQuery]);

  useEffect(() => {
    if (teacherQuery.length > 0) {
      fetch(`/api/users/search?query=${encodeURIComponent(teacherQuery)}&role=teacher`)
        .then((res) => res.json())
        .then((data) => setTeacherResults(Array.isArray(data) ? data : []))
        .catch(() => setTeacherResults([]));
    } else {
      setTeacherResults([]);
    }
  }, [teacherQuery]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Create Appointment</h1>

      <div className="space-y-4">
        <div>
          <Label>Search Student</Label>
          <Popover open={studentOpen} onOpenChange={setStudentOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={studentOpen}
                className="w-full justify-between mt-1"
              >
                {selectedStudent ? `${selectedStudent.name} (${selectedStudent.email})` : "Select student..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput 
                  placeholder="Search by name or email..." 
                  value={studentQuery}
                  onValueChange={setStudentQuery}
                />
                <CommandList>
                  <CommandEmpty>No student found.</CommandEmpty>
                  <CommandGroup>
                    {studentResults.map((user) => (
                      <CommandItem
                        key={user.id}
                        value={`${user.name} ${user.email}`}
                        onSelect={() => {
                          setSelectedStudent(user);
                          setStudentOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedStudent?.id === user.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{user.name}</span>
                          <span className="text-sm text-gray-500">{user.email}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label>Search Teacher</Label>
          <Popover open={teacherOpen} onOpenChange={setTeacherOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={teacherOpen}
                className="w-full justify-between mt-1"
              >
                {selectedTeacher ? `${selectedTeacher.name} (${selectedTeacher.email})` : "Select teacher..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput 
                  placeholder="Search by name or email..." 
                  value={teacherQuery}
                  onValueChange={setTeacherQuery}
                />
                <CommandList>
                  <CommandEmpty>No teacher found.</CommandEmpty>
                  <CommandGroup>
                    {teacherResults.map((user) => (
                      <CommandItem
                        key={user.id}
                        value={`${user.name} ${user.email}`}
                        onSelect={() => {
                          setSelectedTeacher(user);
                          setTeacherOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedTeacher?.id === user.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{user.name}</span>
                          <span className="text-sm text-gray-500">{user.email}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>From Time</Label>
            <div className="mt-1">
              <DateTimePicker value={startTime} onChange={setStartTime} />
            </div>
          </div>

          <div>
            <Label>To Time</Label>
            <div className="mt-1">
              <DateTimePicker value={endTime} onChange={setEndTime} />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any additional notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1"
            rows={4}
          />
        </div>

        {message && (
          <div className={`p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !selectedStudent || !selectedTeacher || !startTime || !endTime}
          className="w-full"
        >
          {isSubmitting ? 'Creating Appointment...' : 'Create Appointment'}
        </Button>
      </div>
    </div>
  );

  async function handleSubmit() {
    if (!selectedStudent || !selectedTeacher || !startTime || !endTime) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          teacherId: selectedTeacher.id,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          notes: notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show alert for overlap or other errors
        if (data.error && data.error.includes('overlap')) {
          alert(`⚠️ Appointment Conflict!\n\n${data.error}\n\nPlease choose a different time slot.`);
        }
        throw new Error(data.error || 'Failed to create appointment');
      }

      setMessage({ type: 'success', text: 'Appointment created successfully!' });
      
      // Reset form
      setSelectedStudent(null);
      setSelectedTeacher(null);
      setStartTime(undefined);
      setEndTime(undefined);
      setNotes("");
      setStudentQuery("");
      setTeacherQuery("");
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }
}