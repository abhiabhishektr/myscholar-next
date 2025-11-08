import Navbar from "@/components/landing/navbar";
import { Mail } from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect teachers to their specific dashboard
  if (session?.user?.role === 'teacher') {
    redirect('/dashboard/teacher');
  }

  // Redirect students to their specific dashboard
  if (session?.user?.role === 'student') {
    redirect('/dashboard/student');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* User Info */}
        {session?.user && (
          <div className="mb-8">
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-white/80 text-sm font-medium mb-2">Welcome back,</p>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                      {session.user.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-white font-semibold capitalize text-sm">
                          {session.user.role}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                        <Mail className="w-4 h-4 text-white" />
                        <span className="text-white/90 text-sm">
                          {session.user.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Avatar Section */}
                  <div className="hidden md:block">
                    <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center shadow-xl">
                      <span className="text-4xl font-bold text-white">
                        {session.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;