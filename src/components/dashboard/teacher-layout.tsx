"use client";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { TeacherSidebar } from "@/components/dashboard/teacher-sidebar";

interface TeacherLayoutProps {
  children: React.ReactNode;
  teacher: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

const TeacherLayout = ({ children, teacher }: TeacherLayoutProps) => {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((segment) => segment);

  const relevantSegments =
    pathSegments[0] === "dashboard" && pathSegments[1] === "teacher"
      ? pathSegments.slice(2)
      : pathSegments;

  return (
    <SidebarProvider>
      <TeacherSidebar teacher={teacher} />
      <SidebarInset className="bg-background overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/dashboard/teacher">Teacher Dashboard</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {relevantSegments.length > 0 && <BreadcrumbSeparator />}
                {relevantSegments.map((segment, index) => {
                  const href = `/dashboard/teacher/${relevantSegments
                    .slice(0, index + 1)
                    .join("/")}`;
                  const isLast = index === relevantSegments.length - 1;
                  return (
                    <React.Fragment key={href}>
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage className="capitalize">
                            {segment}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild className="capitalize">
                            <Link href={href}>{segment}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator />}
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default TeacherLayout;
