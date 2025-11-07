'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, BookOpen, Trash2, Pencil } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { TimetableEditDialog } from './timetable-edit-dialog';
import type { UserWithDetails } from '@/utils/users';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TimetableEntry {
  id: string;
  studentId: string;
  teacherId: string;
  subjectId: string;
  subjectName: string;
  day: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface TimetableWeekViewProps {
  studentId: string;
  teachers: UserWithDetails[];
  subjects: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
}

export function TimetableWeekView({ studentId, teachers, subjects }: TimetableWeekViewProps) {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editEntry, setEditEntry] = useState<TimetableEntry | null>(null);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/timetable?studentId=${studentId}`);
      const data = await response.json();

      if (data.success) {
        setTimetable(data.data);
      } else {
        toast.error('Failed to fetch timetable');
      }
    } catch (error) {
      toast.error('Error fetching timetable');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/timetable/${deleteId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Timetable entry deleted successfully');
        fetchTimetable();
      } else {
        toast.error(data.error || 'Failed to delete entry');
      }
    } catch (error) {
      toast.error('Error deleting entry');
      console.error(error);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const getEntriesForDay = (day: string) => {
    return timetable
      .filter((entry) => entry.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {DAYS_OF_WEEK.map((day) => (
          <Card key={day}>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const hasAnyEntries = timetable.length > 0;

  return (
    <>
      {hasAnyEntries ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {DAYS_OF_WEEK.map((day) => {
            const dayEntries = getEntriesForDay(day);
            return (
              <Card key={day} className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{day}</CardTitle>
                  <CardDescription>{dayEntries.length} classes</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  {dayEntries.length === 0 ? (
                    <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
                      <p className="text-sm text-muted-foreground">No classes</p>
                    </div>
                  ) : (
                    dayEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="group relative space-y-2 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-primary" />
                              <span className="font-semibold text-sm">{entry.subjectName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>
                                {entry.startTime} - {entry.endTime}
                              </span>
                            </div>
                            {entry.notes && (
                              <p className="text-xs text-muted-foreground line-clamp-2">{entry.notes}</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setEditEntry(entry)}
                            >
                              <Pencil className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setDeleteId(entry.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex min-h-[400px] flex-col items-center justify-center gap-4">
            <div className="rounded-full bg-muted p-4">
              <Clock className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">No Timetable Created</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create a timetable for this student using the Create/Edit tab
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <TimetableEditDialog
        open={editEntry !== null}
        onOpenChange={(open) => !open && setEditEntry(null)}
        entry={editEntry}
        teachers={teachers}
        subjects={subjects}
        onSuccess={fetchTimetable}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Timetable Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this timetable entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
