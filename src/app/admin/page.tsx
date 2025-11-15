import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, CheckSquare, CreditCard, Settings, BarChart, UserCheck, Calendar } from "lucide-react";

const AdminPage = async () => {
  const adminFeatures = [
    {
      title: "User Management",
      description: "Manage users, roles, and permissions",
      icon: Users,
      href: "/admin/users",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Timetable Management",
      description: "Create and manage class schedules",
      icon: Clock,
      href: "/admin/timetable",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Class Attendance",
      description: "Track and manage student attendance",
      icon: CheckSquare,
      href: "/admin/class-attendance",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Payment Management",
      description: "View and manage payments",
      icon: CreditCard,
      href: "/admin/payments",
      color: "from-orange-500 to-orange-600"
    },
    {
      title: "Reports & Analytics",
      description: "View system statistics and reports",
      icon: BarChart,
      href: "/admin/reports",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      title: "Settings",
      description: "Configure system settings",
      icon: Settings,
      href: "/admin/settings",
      color: "from-gray-500 to-gray-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to the admin panel. Manage all aspects of your application from here.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminFeatures.map((feature) => (
          <Link key={feature.href} href={feature.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-2 hover:border-primary">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-primary font-medium hover:underline">
                  Manage →
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Stats Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Quick Statistics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">View all users</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Scheduled today</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
