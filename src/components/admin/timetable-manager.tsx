'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus } from 'lucide-react';
import { TimetableWeekView } from './timetable-week-view';
import { TimetableCreator } from './timetable-creator';
import { SubjectManager } from './subject-manager';
import { StudentSelector } from './student-selector';
import type { UserWithDetails } from '@/utils/users';

interface TimetableManagerProps {
  students: UserWithDetails[];
  teachers: UserWithDetails[];
  subjects: Array<{
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export function TimetableManager({ students, teachers, subjects: initialSubjects }: TimetableManagerProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [subjects, setSubjects] = useState(initialSubjects);
  const [showSubjectManager, setShowSubjectManager] = useState(false);

  const handleTimetableCreated = () => {
    // Trigger refresh of the timetable view
    setRefreshKey((prev) => prev + 1);
  };

  const handleSubjectsUpdated = (newSubjects: typeof subjects) => {
    setSubjects(newSubjects);
  };

  const hasNoSubjects = subjects.length === 0;

  return (
    <div className="space-y-6">
      {/* Subject Management Alert */}
      {hasNoSubjects && (
        <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="flex items-center justify-between pt-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-semibold text-orange-900 dark:text-orange-100">No Subjects Available</p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Please add subjects before creating timetables
                </p>
              </div>
            </div>
            <Button onClick={() => setShowSubjectManager(true)} variant="default">
              <Plus className="mr-2 h-4 w-4" />
              Add Subjects
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Subject Manager Dialog */}
      <SubjectManager
        open={showSubjectManager}
        onOpenChange={setShowSubjectManager}
        subjects={subjects}
        onSubjectsUpdated={handleSubjectsUpdated}
      />

      {/* Student Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Select Student</CardTitle>
              <CardDescription>Choose a student to view or create their timetable</CardDescription>
            </div>
            <Button onClick={() => setShowSubjectManager(true)} variant="outline" size="sm">
              <BookOpen className="mr-2 h-4 w-4" />
              Manage Subjects ({subjects.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <StudentSelector
            students={students}
            selectedStudentId={selectedStudentId}
            onStudentChange={setSelectedStudentId}
          />
        </CardContent>
      </Card>

      {/* Timetable Content */}
      {selectedStudentId && !hasNoSubjects && (
        <Tabs defaultValue="view" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="view">View Timetable</TabsTrigger>
            <TabsTrigger value="create">Create/Edit</TabsTrigger>
          </TabsList>

          <TabsContent value="view" className="mt-6">
            <TimetableWeekView 
              studentId={selectedStudentId} 
              teachers={teachers}
              subjects={subjects}
              key={refreshKey} 
            />
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            <TimetableCreator
              studentId={selectedStudentId}
              teachers={teachers}
              subjects={subjects}
              onSuccess={handleTimetableCreated}
            />
          </TabsContent>
        </Tabs>
      )}

      {!selectedStudentId && !hasNoSubjects && (
        <Card>
          <CardContent className="flex min-h-[400px] items-center justify-center">
            <p className="text-muted-foreground">Please select a student to continue</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
