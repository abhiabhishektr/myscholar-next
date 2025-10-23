import Navbar from "@/components/landing/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Users, Mail, Settings, Code } from "lucide-react";
import Link from "next/link";

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Quick Actions */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Get started with common tasks and explore the template features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex-col gap-2"
                asChild
              >
                <Link href="/auth/register">
                  <Users className="h-5 w-5" />
                  <span>Create Account</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex-col gap-2"
                asChild
              >
                <Link href="/admin">
                  <Shield className="h-5 w-5" />
                  <span>Admin Panel</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex-col gap-2"
                asChild
              >
                <Link
                  href="https://github.com/abhiabhishektr/myschoolar-tuition-starter"
                  target="_blank"
                >
                  <Code className="h-5 w-5" />
                  <span>View Source</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex-col gap-2"
                asChild
              >
                <Link href="https://docs.myscholar.com" target="_blank">
                  <Mail className="h-5 w-5" />
                  <span>Documentation</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
