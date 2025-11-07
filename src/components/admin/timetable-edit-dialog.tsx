'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { TeacherSelector } from './teacher-selector';
import type { UserWithDetails } from '@/utils/users';

interface TimetableEntry {
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

interface TimetableEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: TimetableEntry | null;
  teachers: UserWithDetails[];
  subjects: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
  onSuccess: () => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function TimetableEditDialog({
  open,
  onOpenChange,
  entry,
  teachers,
  subjects,
  onSuccess,
}: TimetableEditDialogProps) {
  const [formData, setFormData] = useState({
    teacherId: '',
    subjectId: '',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  // Update form data when entry changes
  useEffect(() => {
    if (entry) {
      setFormData({
        teacherId: entry.teacherId,
        subjectId: entry.subjectId,
        day: entry.day,
        startTime: entry.startTime,
        endTime: entry.endTime,
        notes: entry.notes || '',
      });
    }
  }, [entry]);

  const handleSave = async () => {
    if (!entry) return;

    // Validation
    if (!formData.teacherId || !formData.subjectId || !formData.day) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`/api/timetable/${entry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: formData.teacherId,
          subjectId: formData.subjectId,
          day: formData.day,
          startTime: formData.startTime,
          endTime: formData.endTime,
          notes: formData.notes || null,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Timetable entry updated successfully');
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(data.error || 'Failed to update entry');
      }
    } catch (error) {
      toast.error('Error updating entry');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Timetable Entry</DialogTitle>
          <DialogDescription>
            Update the details of this class schedule
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Day *</Label>
              <Select
                value={formData.day}
                onValueChange={(value) => setFormData({ ...formData, day: value })}
              >
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
                value={formData.subjectId}
                onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
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
          </div>

          <div className="space-y-2">
            <Label>Teacher *</Label>
            <TeacherSelector
              teachers={teachers}
              selectedTeacherId={formData.teacherId}
              onTeacherChange={(value) => setFormData({ ...formData, teacherId: value })}
              className="w-full"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Start Time *</Label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>End Time *</Label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Input
              placeholder="Add any additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
