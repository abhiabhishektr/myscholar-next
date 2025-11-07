'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { UserWithDetails } from '@/utils/users';

interface TimetableCreatorProps {
  studentId: string;
  teachers: UserWithDetails[];
  subjects: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
  onSuccess: () => void;
}

interface TimetableEntry {
  teacherId: string;
  subjectId: string;
  day: string;
  startTime: string;
  endTime: string;
  notes: string;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_ENTRY: TimetableEntry = {
  teacherId: '',
  subjectId: '',
  day: 'Monday',
  startTime: '09:00',
  endTime: '10:00',
  notes: '',
};

export function TimetableCreator({ studentId, teachers, subjects, onSuccess }: TimetableCreatorProps) {
  const [entries, setEntries] = useState<TimetableEntry[]>([{ ...DEFAULT_ENTRY }]);
  const [saving, setSaving] = useState(false);

  const addEntry = () => {
    setEntries([...entries, { ...DEFAULT_ENTRY }]);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof TimetableEntry, value: string) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  };

  const validateEntries = (): boolean => {
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      if (!entry.teacherId || !entry.subjectId || !entry.day) {
        toast.error(`Entry ${i + 1}: Please fill in all required fields`);
        return false;
      }

      if (entry.startTime >= entry.endTime) {
        toast.error(`Entry ${i + 1}: End time must be after start time`);
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateEntries()) return;

    try {
      setSaving(true);

      const response = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          entries,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || 'Timetable created successfully!');
        setEntries([{ ...DEFAULT_ENTRY }]);
        onSuccess();
      } else {
        toast.error(data.error || 'Failed to create timetable');
      }
    } catch (error) {
      toast.error('Error creating timetable');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const groupedEntries = DAYS_OF_WEEK.map((day) => ({
    day,
    entries: entries
      .map((entry, index) => ({ ...entry, index }))
      .filter((entry) => entry.day === day),
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Create Timetable Entries</CardTitle>
              <CardDescription>Add classes for each day of the week</CardDescription>
            </div>
            <Button onClick={addEntry} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Grid view by day */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {groupedEntries.map(({ day, entries: dayEntries }) => (
              <Card key={day} className="border-muted">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">{day}</CardTitle>
                  <CardDescription className="text-xs">
                    {dayEntries.length} {dayEntries.length === 1 ? 'class' : 'classes'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dayEntries.length === 0 ? (
                    <div className="flex h-24 items-center justify-center rounded-lg border border-dashed">
                      <p className="text-xs text-muted-foreground">No classes</p>
                    </div>
                  ) : (
                    dayEntries.map(({ index, teacherId, subjectId, startTime, endTime, notes }) => (
                      <div key={index} className="space-y-2 rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            Entry {index + 1}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeEntry(index)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Subject</Label>
                            <Select
                              value={subjectId}
                              onValueChange={(value) => updateEntry(index, 'subjectId', value)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select subject" />
                              </SelectTrigger>
                              <SelectContent>
                                {subjects.map((subject) => (
                                  <SelectItem key={subject.id} value={subject.id} className="text-xs">
                                    {subject.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Teacher</Label>
                            <Select
                              value={teacherId}
                              onValueChange={(value) => updateEntry(index, 'teacherId', value)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select teacher" />
                              </SelectTrigger>
                              <SelectContent>
                                {teachers.map((teacher) => (
                                  <SelectItem key={teacher.id} value={teacher.id} className="text-xs">
                                    {teacher.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Start</Label>
                              <Input
                                type="time"
                                value={startTime}
                                onChange={(e) => updateEntry(index, 'startTime', e.target.value)}
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">End</Label>
                              <Input
                                type="time"
                                value={endTime}
                                onChange={(e) => updateEntry(index, 'endTime', e.target.value)}
                                className="h-8 text-xs"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Notes (optional)</Label>
                            <Input
                              placeholder="Add notes..."
                              value={notes}
                              onChange={(e) => updateEntry(index, 'notes', e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* List of all entries for quick editing */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">All Entries</h3>
            {entries.map((entry, index) => (
              <Card key={index} className="border-muted">
                <CardContent className="pt-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                    <div className="space-y-2">
                      <Label>Day *</Label>
                      <Select value={entry.day} onValueChange={(value) => updateEntry(index, 'day', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS_OF_WEEK.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Subject *</Label>
                      <Select
                        value={entry.subjectId}
                        onValueChange={(value) => updateEntry(index, 'subjectId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Teacher *</Label>
                      <Select
                        value={entry.teacherId}
                        onValueChange={(value) => updateEntry(index, 'teacherId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Start Time *</Label>
                      <Input
                        type="time"
                        value={entry.startTime}
                        onChange={(e) => updateEntry(index, 'startTime', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>End Time *</Label>
                      <Input
                        type="time"
                        value={entry.endTime}
                        onChange={(e) => updateEntry(index, 'endTime', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Actions</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => removeEntry(index)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <Label>Notes</Label>
                    <Input
                      placeholder="Add any additional notes..."
                      value={entry.notes}
                      onChange={(e) => updateEntry(index, 'notes', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={addEntry} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Another Entry
            </Button>
            <Button onClick={handleSave} disabled={saving || entries.length === 0}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : `Save ${entries.length} ${entries.length === 1 ? 'Entry' : 'Entries'}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
