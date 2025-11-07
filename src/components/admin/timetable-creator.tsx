'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, Pencil } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { TeacherSelector } from './teacher-selector';
import { TimetableEditDialog } from './timetable-edit-dialog';
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

interface ExistingTimetableEntry {
  id: string;
  studentId: string;
  teacherId: string;
  subjectId: string;
  subjectName: string;
  day: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  isActive: boolean;
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
  const [existingEntries, setExistingEntries] = useState<ExistingTimetableEntry[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [editEntry, setEditEntry] = useState<ExistingTimetableEntry | null>(null);

  // Fetch existing timetable entries
  useEffect(() => {
    const fetchExisting = async () => {
      try {
        setLoadingExisting(true);
        const response = await fetch(`/api/timetable?studentId=${studentId}`);
        const data = await response.json();

        if (data.success) {
          setExistingEntries(data.data);
        }
      } catch (error) {
        console.error('Error fetching existing entries:', error);
      } finally {
        setLoadingExisting(false);
      }
    };

    fetchExisting();
  }, [studentId]);

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
        // Refresh existing entries
        const refreshResponse = await fetch(`/api/timetable?studentId=${studentId}`);
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setExistingEntries(refreshData.data);
        }
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

  const handleEditSuccess = async () => {
    // Refresh existing entries after edit
    try {
      const response = await fetch(`/api/timetable?studentId=${studentId}`);
      const data = await response.json();
      if (data.success) {
        setExistingEntries(data.data);
      }
      onSuccess();
    } catch (error) {
      console.error('Error refreshing entries:', error);
    }
  };

  const handleDeleteExisting = async (id: string) => {
    try {
      const response = await fetch(`/api/timetable/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Entry deleted successfully');
        setExistingEntries(existingEntries.filter((entry) => entry.id !== id));
        onSuccess();
      } else {
        toast.error(data.error || 'Failed to delete entry');
      }
    } catch (error) {
      toast.error('Error deleting entry');
      console.error(error);
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
      {/* Existing Timetable Entries */}
      {!loadingExisting && existingEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Timetable</CardTitle>
            <CardDescription>
              {existingEntries.length} existing {existingEntries.length === 1 ? 'entry' : 'entries'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {existingEntries.map((entry) => (
                <Card key={entry.id} className="border-muted">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Day</Label>
                          <p className="font-medium">{entry.day}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Subject</Label>
                          <p className="font-medium">{entry.subjectName}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Time</Label>
                          <p className="font-medium">
                            {entry.startTime} - {entry.endTime}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Teacher</Label>
                          <p className="font-medium">
                            {teachers.find((t) => t.id === entry.teacherId)?.name || 'Unknown'}
                          </p>
                        </div>
                        {entry.notes && (
                          <div className="sm:col-span-2 md:col-span-4">
                            <Label className="text-xs text-muted-foreground">Notes</Label>
                            <p className="text-sm">{entry.notes}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditEntry(entry)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteExisting(entry.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create New Entries */}
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
                            <TeacherSelector
                              teachers={teachers}
                              selectedTeacherId={teacherId}
                              onTeacherChange={(value) => updateEntry(index, 'teacherId', value)}
                              className="h-8 w-full text-xs"
                            />
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
                      <TeacherSelector
                        teachers={teachers}
                        selectedTeacherId={entry.teacherId}
                        onTeacherChange={(value) => updateEntry(index, 'teacherId', value)}
                        className="w-full"
                      />
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

      {/* Edit Dialog */}
      <TimetableEditDialog
        open={editEntry !== null}
        onOpenChange={(open) => !open && setEditEntry(null)}
        entry={editEntry}
        teachers={teachers}
        subjects={subjects}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
