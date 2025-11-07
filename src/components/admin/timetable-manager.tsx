'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimetableWeekView } from './timetable-week-view';
import { TimetableCreator } from './timetable-creator';
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

export function TimetableManager({ students, teachers, subjects }: TimetableManagerProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTimetableCreated = () => {
    // Trigger refresh of the timetable view
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Student Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Student</CardTitle>
          <CardDescription>Choose a student to view or create their timetable</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{student.name}</span>
                    <span className="text-sm text-muted-foreground">({student.email})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Timetable Content */}
      {selectedStudentId && (
        <Tabs defaultValue="view" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="view">View Timetable</TabsTrigger>
            <TabsTrigger value="create">Create/Edit</TabsTrigger>
          </TabsList>

          <TabsContent value="view" className="mt-6">
            <TimetableWeekView studentId={selectedStudentId} key={refreshKey} />
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

      {!selectedStudentId && (
        <Card>
          <CardContent className="flex min-h-[400px] items-center justify-center">
            <p className="text-muted-foreground">Please select a student to continue</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
