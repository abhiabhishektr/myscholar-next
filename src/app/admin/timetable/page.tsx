import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Timetable | Admin Dashboard",
  description: "Create your timetable in the admin dashboard",
};

export default function TimetablePage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Create Your Timetable</h1>
        <p className="text-muted-foreground">
          This is the first step to set up your scheduling system.
        </p>
      </div>
      {/* TODO: Add timetable creation form/interface */}
    </div>
  );
}