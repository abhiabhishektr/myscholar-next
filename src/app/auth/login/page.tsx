"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import LoginForm from "@/components/auth/login-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GoogleIcon } from "@/components/ui/icons";
import { signInWithGoogle } from "@/lib/auth-client";
import { ArrowRight, BookOpen, GraduationCap, Users } from "lucide-react";
import Image from "next/image";

const LoginPage = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <Link href="/" className="inline-block mb-8">
            <Image
              src="/logo.png"
              alt="MySchoolar Tuition Logo"
              width={200}
              height={80}
              className="h-16 w-auto object-contain brightness-0 invert"
            />
          </Link>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome Back!
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed max-w-md">
            Continue your journey towards academic excellence with personalized one-on-one tutoring.
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Expert Mentors</h3>
              <p className="text-blue-100 text-sm">Learn from experienced educators</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Personalized Learning</h3>
              <p className="text-blue-100 text-sm">Tailored to your unique needs</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">3,000+ Students</h3>
              <p className="text-blue-100 text-sm">Join our growing community</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="MySchoolar Tuition Logo"
                width={200}
                height={80}
                className="h-14 w-auto object-contain mx-auto"
              />
            </Link>
          </div>

          <Card className="border-blue-200 dark:border-blue-800 shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                Sign In
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <LoginForm />
              
              <div className="flex items-center my-4">
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
                <span className="mx-3 text-gray-500 dark:text-gray-400 text-xs font-medium">
                  OR CONTINUE WITH
                </span>
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
              </div>
              
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  className="border-blue-200 hover:bg-blue-50 hover:border-blue-400 dark:border-blue-800 dark:hover:bg-blue-950"
                  type="button"
                  onClick={signInWithGoogle}
                >
                  <GoogleIcon className="mr-2" />
                  Google
                </Button>
              </div>
              
              <div className="text-center text-sm pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-300">Don&apos;t have an account? </span>
                <Link
                  href="/auth/register"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold inline-flex items-center gap-1 group"
                >
                  Create one now
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            By signing in, you agree to our{" "}
            <Link href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
