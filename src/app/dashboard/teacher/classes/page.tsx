import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import TeacherLayout from "@/components/dashboard/teacher-layout";
import MyClassesContent from "./classes-content";

export default async function MyClassesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "teacher") {
    redirect("/auth/login");
  }

  const teacher = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role || "teacher",
  };

  return (
    <TeacherLayout teacher={teacher}>
      <Suspense fallback={<div>Loading...</div>}>
        <MyClassesContent />
      </Suspense>
    </TeacherLayout>
  );
}
