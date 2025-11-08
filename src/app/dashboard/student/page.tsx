import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import StudentLayout from "@/components/dashboard/student-layout";
import StudentDashboardContent from "./dashboard-content";

export default async function StudentDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "student") {
    redirect("/auth/login");
  }

  const student = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role || "student",
  };

  return (
    <StudentLayout student={student}>
      <Suspense fallback={<div>Loading...</div>}>
        <StudentDashboardContent studentId={student.id} studentName={student.name} />
      </Suspense>
    </StudentLayout>
  );
}
