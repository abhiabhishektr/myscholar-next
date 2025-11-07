'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit2, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
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

interface Subject {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface SubjectManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  onSubjectsUpdated: (subjects: Subject[]) => void;
}

export function SubjectManager({ open, onOpenChange, subjects, onSubjectsUpdated }: SubjectManagerProps) {
  const [localSubjects, setLocalSubjects] = useState<Subject[]>(subjects);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectDescription, setNewSubjectDescription] = useState('');
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteSubjectId, setDeleteSubjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      const data = await response.json();
      if (data.success) {
        setLocalSubjects(data.data);
        onSubjectsUpdated(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch subjects');
      console.error(error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSubjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) {
      toast.error('Subject name is required');
      return;
    }

    if (newSubjectName.length > 100) {
      toast.error('Subject name must be less than 100 characters');
      return;
    }

    if (newSubjectDescription && newSubjectDescription.length > 500) {
      toast.error('Description must be less than 500 characters');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSubjectName.trim(),
          description: newSubjectDescription.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors from backend
        if (data.details) {
          const errorMessages = data.details.map((err: any) => err.message).join(', ');
          toast.error(errorMessages);
        } else {
          toast.error(data.error || 'Failed to add subject');
        }
        return;
      }

      if (data.success) {
        toast.success('Subject added successfully');
        setNewSubjectName('');
        setNewSubjectDescription('');
        fetchSubjects();
      }
    } catch (error) {
      toast.error('Error adding subject');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubject = async () => {
    if (!editingSubject) return;

    if (!editingSubject.name.trim()) {
      toast.error('Subject name is required');
      return;
    }

    if (editingSubject.name.length > 100) {
      toast.error('Subject name must be less than 100 characters');
      return;
    }

    if (editingSubject.description && editingSubject.description.length > 500) {
      toast.error('Description must be less than 500 characters');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/subjects/${editingSubject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingSubject.name.trim(),
          description: editingSubject.description?.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          const errorMessages = data.details.map((err: any) => err.message).join(', ');
          toast.error(errorMessages);
        } else {
          toast.error(data.error || 'Failed to update subject');
        }
        return;
      }

      if (data.success) {
        toast.success('Subject updated successfully');
        setEditingSubject(null);
        fetchSubjects();
      }
    } catch (error) {
      toast.error('Error updating subject');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async () => {
    if (!deleteSubjectId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/subjects/${deleteSubjectId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Subject deleted successfully');
        fetchSubjects();
      } else {
        toast.error(data.error || 'Failed to delete subject');
      }
    } catch (error) {
      toast.error('Error deleting subject');
      console.error(error);
    } finally {
      setLoading(false);
      setDeleteSubjectId(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Subjects</DialogTitle>
            <DialogDescription>Add, edit, or remove subjects for the timetable</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Add New Subject */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add New Subject</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject-name">Subject Name *</Label>
                  <Input
                    id="subject-name"
                    placeholder="e.g., Mathematics, Physics, English"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddSubject();
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject-description">Description (Optional)</Label>
                  <Input
                    id="subject-description"
                    placeholder="Brief description of the subject"
                    value={newSubjectDescription}
                    onChange={(e) => setNewSubjectDescription(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddSubject} disabled={loading || !newSubjectName.trim()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Subject
                </Button>
              </CardContent>
            </Card>

            {/* Existing Subjects */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Existing Subjects ({localSubjects.length})</h3>

              {localSubjects.length === 0 ? (
                <Card>
                  <CardContent className="flex min-h-[200px] items-center justify-center">
                    <div className="text-center space-y-2">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
                      <p className="text-muted-foreground">No subjects added yet</p>
                      <p className="text-sm text-muted-foreground">Add your first subject above</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {localSubjects.map((subject) => (
                    <Card key={subject.id}>
                      <CardContent className="pt-4">
                        {editingSubject?.id === subject.id ? (
                          <div className="space-y-3">
                            <Input
                              value={editingSubject.name}
                              onChange={(e) =>
                                setEditingSubject({ ...editingSubject, name: e.target.value })
                              }
                              placeholder="Subject name"
                            />
                            <Input
                              value={editingSubject.description || ''}
                              onChange={(e) =>
                                setEditingSubject({ ...editingSubject, description: e.target.value })
                              }
                              placeholder="Description"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleUpdateSubject} disabled={loading}>
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingSubject(null)}
                                disabled={loading}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-semibold">{subject.name}</h4>
                              {subject.description && (
                                <p className="text-sm text-muted-foreground mt-1">{subject.description}</p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setEditingSubject(subject)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setDeleteSubjectId(subject.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteSubjectId !== null} onOpenChange={() => setDeleteSubjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subject?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this subject and may affect
              existing timetables that use it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubject}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
