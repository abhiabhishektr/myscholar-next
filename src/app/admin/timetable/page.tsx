import type { Metadata } from 'next';
import { getUsers } from '@/utils/users';
import { getAllSubjects } from '@/db/subjects';
import { TimetableManager } from '@/components/admin/timetable-manager';

export const metadata: Metadata = {
  title: 'Create Timetable | Admin Dashboard',
  description: 'Create and manage student timetables',
};

export default async function TimetablePage() {
  // Fetch students
  const { users: students } = await getUsers({ role: 'student', limit: 1000 });

  // Fetch teachers
  const { users: teachers } = await getUsers({ role: 'teacher', limit: 1000 });

  // Fetch subjects
  const subjects = await getAllSubjects();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Timetable Management</h1>
        <p className="text-muted-foreground">
          Create and manage weekly schedules for students
        </p>
      </div>

      <TimetableManager students={students} teachers={teachers} subjects={subjects} />
    </div>
  );
}