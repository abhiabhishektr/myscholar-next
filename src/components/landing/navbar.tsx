"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, Shield, User } from "lucide-react";
import Image from "next/image";

const Navbar = () => {
  const { signOut, useSession } = authClient;
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === "admin";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-blue-200 dark:border-blue-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo/Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="MySchoolar Tuition Logo"
              width={160}
              height={50}
              className="h-10 md:h-12 w-auto object-contain"
            />
          </Link>

          {/* Navigation Links */}
          {session && (
            <div className="hidden md:flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950">
                  Dashboard
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {!session ? (
            <div className="flex items-center gap-2">
              <Link href="/auth/register">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950">
                  Sign Up
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Sign In</Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Admin Badge */}
              {isAdmin && (
                <Badge
                  className="hidden sm:flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Shield className="h-3 w-3" />
                  Admin
                </Badge>
              )}

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-blue-200 dark:ring-blue-800">
                      <AvatarImage
                        src={session.user.image || ""}
                        alt={session.user.name || ""}
                      />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        {session.user.name?.charAt(0)?.toUpperCase() ||
                          session.user.email?.charAt(0)?.toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user.name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email
                          ? session.user.email.replace(/^[^@]+/, "***")
                          : ""}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>

                  {/* Admin Panel Link - Only show for admin users */}
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
