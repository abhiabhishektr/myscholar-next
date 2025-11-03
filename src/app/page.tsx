import React from "react";
import Navbar from "@/components/landing/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Trophy, GraduationCap, RefreshCw, CheckCircle2, Users, Clock, Award, Target, Lightbulb, Star, ArrowRight, MessageCircle } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950">
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Video & CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 via-pink-50 to-rose-50 dark:from-orange-950/20 dark:via-pink-950/20 dark:to-rose-950/20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Video Section */}
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-orange-300 rounded-full blur-3xl opacity-50" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-300 rounded-full blur-3xl opacity-50" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-video bg-gray-900">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/7SCm2d0DHSU?si=yq_5OGpNyo6h3OP9"
                  title="MySchoolar Tuition Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            {/* CTA Content */}
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
                Start Shaping Your Future
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Give your child the advantage of personalized learning with MySchoolar Tuition. Whether it&apos;s exam preparation, bridging learning gaps, or striving for academic excellence, our expert mentors are here to support every step of the journey. Reach out to us today to schedule a consultation and take the first step toward unlocking your child&apos;s true potential.
              </p>
              <Button 
                size="lg" 
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                asChild
              >
                <a 
                  href="https://api.whatsapp.com/send?phone=+918848265641&text=Hi,%20could%20you%20please%20share%20the%20details%20of%20your%20one-to-one%20tuition%20classes?"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-5 h-5" />
                  Reach Us
                  <ArrowRight className="w-5 h-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Features Section with Gradient Background */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-indigo-100/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl blur-3xl" />
          <div className="relative">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-blue-600 text-white border-0 hover:bg-blue-700">Our Services</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-blue-900 dark:text-blue-100">
                Comprehensive Learning Programs
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
                Tailored courses designed to help students excel in academics and competitive exams
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl transition-all duration-300 group bg-white/80 dark:bg-gray-800/80 backdrop-blur"
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg group-hover:scale-110 transition-transform">
                        {React.cloneElement(feature.icon, { className: "h-7 w-7" })}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 text-blue-900 dark:text-blue-100">{feature.title}</CardTitle>
                        <CardDescription className="text-base text-gray-600 dark:text-gray-300">{feature.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {feature.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                          <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
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
            <Badge className="mb-4 bg-indigo-600 text-white border-0 hover:bg-indigo-700">Simple Process</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-blue-900 dark:text-blue-100">
              How It Works
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
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
                <Card className="h-full hover:shadow-2xl transition-all duration-300 border-blue-200 dark:border-blue-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                        {item.icon}
                      </div>
                      <span className="text-6xl font-bold text-blue-100 dark:text-blue-900/30">
                        {item.step}
                      </span>
                    </div>
                    <CardTitle className="text-2xl mb-2 text-blue-900 dark:text-blue-100">{item.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-8 w-8 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us & Stats Combined */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-indigo-100/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl blur-3xl" />
          <div className="relative">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-blue-600 text-white border-0 hover:bg-blue-700">Why MySchoolar</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-blue-900 dark:text-blue-100">
                Excellence in Education
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="border-blue-200 dark:border-blue-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2 text-blue-900 dark:text-blue-100">
                    <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
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
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow group-hover:scale-110 transition-transform">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-lg text-gray-700 dark:text-gray-200">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2 text-white">
                    <Trophy className="h-6 w-6" />
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
                      <div key={index} className="text-center p-4 rounded-xl bg-white/10 backdrop-blur hover:bg-white/20 transition-colors">
                        <div className="flex justify-center mb-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                            <stat.icon className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="text-3xl font-bold mb-1">{stat.value}</div>
                        <div className="text-sm text-blue-100 font-medium">{stat.label}</div>
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
            <Badge className="mb-4 bg-indigo-600 text-white border-0 hover:bg-indigo-700">Success Stories</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-blue-900 dark:text-blue-100">
              What Our Students Say
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
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
              <Card key={index} className="border-blue-200 dark:border-blue-800 hover:shadow-2xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-200 mb-6 leading-relaxed">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg shadow-lg">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-blue-900 dark:text-blue-100">{testimonial.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{testimonial.grade}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            <CardContent className="relative p-12 text-center text-white">
              <Badge className="mb-4 bg-white/20 text-white border-0 backdrop-blur hover:bg-white/30">Get Started Today</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Excel in Your Studies?
              </h2>
              <p className="text-blue-50 text-lg max-w-2xl mx-auto mb-8">
                Book your free demo session today and experience personalized learning like never before
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all font-semibold" asChild>
                  <a href="/auth/register">
                    Start Free Demo
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur font-semibold" asChild>
                  <a href="#contact">Contact Us</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact Section */}
        <section className="py-20" id="contact">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-blue-200 dark:border-blue-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-900 dark:text-blue-100">Get in Touch</CardTitle>
                <CardDescription className="text-base text-gray-600 dark:text-gray-300">
                  Have questions? Reach out to us for personalized guidance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                  <Target className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1 text-blue-900 dark:text-blue-100">Address</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      MySchoolar Tuition, AAB Complex, Court Road, Alathur, Palakkad, Kerala, 678541
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1 text-blue-900 dark:text-blue-100">Phone</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      +91 88482 65641 | +91 79091 93350
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1 text-blue-900 dark:text-blue-100">Email</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      info@myschoolartuition.com
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-900 dark:text-blue-100">About MySchoolar Tuition</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed mb-6">
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
                    <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-white/60 dark:bg-blue-900/30 hover:bg-white dark:hover:bg-blue-900/50 transition-colors">
                      <item.icon className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 mt-20 border-t border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-200 mb-4 font-medium">
              © 2025 MySchoolar Tuition. All Rights Reserved.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Empowering students to achieve their dreams through quality education
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
