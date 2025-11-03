import React from "react";
import Navbar from "@/components/landing/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Trophy, GraduationCap, RefreshCw, CheckCircle2, Users, Clock, Award, Target, Lightbulb, Star, ArrowRight } from "lucide-react";
import { Hero } from "@/components/ui/animated-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

      {/* Hero Section */}
      <Hero />

      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Features Section with Gradient Background */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-3xl" />
          <div className="relative">
            <div className="text-center mb-16">
              <Badge className="mb-4" variant="secondary">Our Services</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Comprehensive Learning Programs
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Tailored courses designed to help students excel in academics and competitive exams
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary group-hover:scale-110 transition-transform">
                        {React.cloneElement(feature.icon, { className: "h-7 w-7" })}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                        <CardDescription className="text-base">{feature.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {feature.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-sm font-medium">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="secondary">Simple Process</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get started with personalized tutoring in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Target className="h-8 w-8" />,
                step: "01",
                title: "Book Your Demo",
                description: "Schedule a free consultation to discuss your learning goals and find the perfect tutor match."
              },
              {
                icon: <Lightbulb className="h-8 w-8" />,
                step: "02",
                title: "Start Learning",
                description: "Begin your personalized one-on-one sessions with expert mentors at your convenience."
              },
              {
                icon: <Award className="h-8 w-8" />,
                step: "03",
                title: "Achieve Excellence",
                description: "Track your progress and watch your grades improve with our proven teaching methods."
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-border/50">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg">
                        {item.icon}
                      </div>
                      <span className="text-6xl font-bold text-muted-foreground/10">
                        {item.step}
                      </span>
                    </div>
                    <CardTitle className="text-2xl mb-2">{item.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-8 w-8 text-primary/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us & Stats Combined */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 rounded-3xl" />
          <div className="relative">
            <div className="text-center mb-16">
              <Badge className="mb-4" variant="secondary">Why MySchoolar</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Excellence in Education
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Star className="h-6 w-6 text-primary" />
                    Why Choose Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {[
                      { icon: Clock, text: "Flexible Scheduling" },
                      { icon: Users, text: "Expert Mentors" },
                      { icon: Award, text: "Proven Results" },
                      { icon: Target, text: "Personalized Learning" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-lg">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-primary" />
                    Our Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { value: "3,000+", label: "Students Enrolled", icon: Users },
                      { value: "20k+", label: "Sessions Completed", icon: BookOpen },
                      { value: "95%", label: "Success Rate", icon: Award },
                      { value: "50+", label: "Expert Tutors", icon: GraduationCap }
                    ].map((stat, index) => (
                      <div key={index} className="text-center p-4 rounded-xl hover:bg-background/50 transition-colors">
                        <div className="flex justify-center mb-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <stat.icon className="h-6 w-6" />
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                        <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="secondary">Success Stories</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What Our Students Say
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Hear from students who have transformed their academic journey with us
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Priya Sharma",
                grade: "Class 12 CBSE",
                text: "MySchoolar helped me improve my Math score from 60% to 95%. The personalized attention made all the difference!",
                rating: 5
              },
              {
                name: "Arjun Menon",
                grade: "JEE Aspirant",
                text: "The tutors are exceptional. They not only teach concepts but also help develop problem-solving skills.",
                rating: 5
              },
              {
                name: "Anjali Krishnan",
                grade: "Class 10 ICSE",
                text: "Flexible scheduling and expert guidance helped me balance studies and extracurriculars perfectly.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="border-border/50 hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.grade}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <Card className="border-border/50 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent overflow-hidden relative">
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
            <CardContent className="relative p-12 text-center">
              <Badge className="mb-4" variant="secondary">Get Started Today</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Excel in Your Studies?
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                Book your free demo session today and experience personalized learning like never before
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8" asChild>
                  <a href="/auth/register">
                    Start Free Demo
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                  <a href="#contact">Contact Us</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact Section */}
        <section className="py-20" id="contact">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-2xl">Get in Touch</CardTitle>
                <CardDescription className="text-base">
                  Have questions? Reach out to us for personalized guidance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <Target className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1">Address</p>
                    <p className="text-sm text-muted-foreground">
                      MySchoolar Tuition, AAB Complex, Court Road, Alathur, Palakkad, Kerala, 678541
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <Clock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1">Phone</p>
                    <p className="text-sm text-muted-foreground">
                      +91 88482 65641 | +91 79091 93350
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <Users className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1">Email</p>
                    <p className="text-sm text-muted-foreground">
                      info@myschoolartuition.com
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="text-2xl">About MySchoolar Tuition</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Transforming Education for KG to 12th Grade Through One-to-One Tuition. 
                  At MySchoolar Tuition, we provide personalized one-on-one tutoring tailored 
                  to each student&apos;s unique needs and learning style.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Clock, text: "Flexible Timings" },
                    { icon: Award, text: "Certified Tutors" },
                    { icon: Target, text: "Goal-Oriented" },
                    { icon: Lightbulb, text: "Interactive Learning" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                      <item.icon className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 mt-20 border-t border-border/50">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              © 2025 MySchoolar Tuition. All Rights Reserved.
            </p>
            <p className="text-sm text-muted-foreground/70">
              Empowering students to achieve their dreams through quality education
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
