"use client";

import * as React from "react";
import {
  BookOpen,
  Calendar,
  Users,
  LogOut,
  Settings,
  Home,
  Clock,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface TeacherSidebarProps {
  teacher: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export function TeacherSidebar({ teacher }: TeacherSidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      toast.success("Logged out successfully");
      router.push("/auth/login");
    } catch (error) {
      toast.error("Failed to logout");
      console.error(error);
    }
  };

  const navItems = [
    {
      title: "Dashboard",
      url: "/dashboard/teacher",
      icon: Home,
    },
    {
      title: "My Classes",
      url: "/dashboard/teacher/classes",
      icon: Clock,
    },
    {
      title: "Students",
      url: "/dashboard/teacher/students",
      icon: Users,
    },
    {
      title: "Timetable",
      url: "/dashboard/teacher/timetable",
      icon: Calendar,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">MyScholar</span>
            <span className="text-xs text-muted-foreground">Teacher Portal</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                      {teacher.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-semibold">{teacher.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {teacher.email}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-56"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/teacher/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
