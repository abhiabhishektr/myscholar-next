import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { TeacherDashboard } from '@/components/dashboard/teacher-dashboard';

export default async function TeacherDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== 'teacher') {
    redirect('/auth/login');
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TeacherDashboard teacher={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role || 'teacher'
      }} />
    </Suspense>
  );
}