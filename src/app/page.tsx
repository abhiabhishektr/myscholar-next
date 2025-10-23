import React from "react";
import Navbar from "@/components/landing/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Trophy, GraduationCap, RefreshCw } from "lucide-react";
import { Hero } from "@/components/ui/animated-hero";

const HomePage = () => {
  const features = [
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: "School Tuition KG-12th",
      description:
        "Comprehensive tutoring for all grades covering various curricula.",
      items: [
        "CBSE",
        "ICSE/ISC",
        "IGCSE",
        "IB",
      ],
    },
    {
      icon: <Trophy className="h-5 w-5" />,
      title: "Competitive Exams",
      description:
        "Preparation for entrance exams and competitive tests.",
      items: [
        "JEE",
        "NEET",
        "Olympiads",
        "Scholarships",
      ],
    },
    {
      icon: <GraduationCap className="h-5 w-5" />,
      title: "Foundation Courses",
      description:
        "Building strong foundations for future academic success.",
      items: [
        "Math Basics",
        "Science Fundamentals",
        "Language Skills",
        "Study Habits",
      ],
    },
    {
      icon: <RefreshCw className="h-5 w-5" />,
      title: "Revision Classes",
      description:
        "Focused revision to reinforce concepts and boost exam readiness.",
      items: [
        "Key Concepts",
        "Practice Questions",
        "Doubt Clearing",
        "Mock Tests",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <Hero />

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-border/50 hover:border-border transition-colors"
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {feature.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="text-sm text-muted-foreground">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* About Us */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>About Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Transforming Education for KG to 12th Grade Through One-to-One Tuition. At MySchoolar Tuition, we provide personalized one-on-one tutoring tailored to each students unique needs and learning style.
            </p>
          </CardContent>
        </Card>

        {/* Why Choose Us */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Why Choose Us</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Convenient Scheduling</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Expert Mentors</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Guaranteed Results</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>One-to-One Tuition</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Our Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">3,000+</div>
                  <div className="text-sm text-muted-foreground">Students Enrolled</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">20k+</div>
                  <div className="text-sm text-muted-foreground">Sessions Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
            <CardDescription>
              Have questions? Reach out to us for personalized guidance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Address:</strong> MySchoolar Tuition, AAB Complex, Court Road, Alathur, Palakkad, Kerala, 678541</p>
              <p><strong>Phone:</strong> +91 88482 65641 | +91 79091 93350</p>
              <p><strong>Email:</strong> info@myschoolartuition.com</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-border/50">
          <p className="text-muted-foreground">
            © 2025 MySchoolar Tuition. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
