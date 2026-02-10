import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Container, Section, SectionHeader } from "@/components/ui/layout";
import { InteractiveBackground } from "@/components/ui/interactive-background";
import { Navbar, Footer } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Check,
  UserCheck,
  Globe,
  HeartHandshake,
  Briefcase,
  Clock,
  Award,
  TrendingUp,
  Shield,
  Zap,
  BookOpen,
  Video,
  MessageSquare,
  Target,
  Star,
  Calendar,
  FileText,
  Code,
  Brain,
} from "lucide-react";

const jobCategories = [
  { name: "Software Engineering", count: 245, icon: Code },
  { name: "Data Science & AI", count: 128, icon: Brain },
  { name: "Product Management", count: 89, icon: Target },
  { name: "DevOps & Cloud", count: 156, icon: Zap },
  { name: "Design & UX", count: 67, icon: Star },
  { name: "Marketing & Sales", count: 112, icon: TrendingUp },
];

const benefits = [
  {
    icon: UserCheck,
    title: "Fair & Unbiased Assessment",
    description: "Our AI evaluates your skills objectively, focusing on what you know—not your background, accent, or appearance.",
    highlight: "100% skill-based",
  },
  {
    icon: Globe,
    title: "Interview Anytime, Anywhere",
    description: "No more scheduling hassles. Complete interviews on your own time, from anywhere in the world.",
    highlight: "24/7 availability",
  },
  {
    icon: HeartHandshake,
    title: "Instant Detailed Feedback",
    description: "Receive comprehensive feedback on your performance, including strengths and areas for improvement.",
    highlight: "Learn & grow",
  },
  {
    icon: Shield,
    title: "Privacy Protected",
    description: "Your data is encrypted and protected. We never share your information without your consent.",
    highlight: "GDPR compliant",
  },
  {
    icon: Clock,
    title: "Fast Results",
    description: "No more waiting weeks for feedback. Get your evaluation within hours of completing your interview.",
    highlight: "< 24 hour response",
  },
  {
    icon: Award,
    title: "Skill Verification",
    description: "Verified assessments that you can share with potential employers as proof of your abilities.",
    highlight: "Shareable credentials",
  },
];

const howItWorks = [
  {
    step: 1,
    title: "Create Your Profile",
    description: "Sign up and upload your resume. Our AI extracts your skills, experience, and preferences automatically.",
    icon: FileText,
  },
  {
    step: 2,
    title: "Browse & Apply",
    description: "Explore jobs matched to your profile. Apply with one click—your verified skills do the talking.",
    icon: Briefcase,
  },
  {
    step: 3,
    title: "Complete Assessments",
    description: "Take MCQ tests, coding challenges, and voice interviews at your convenience. No rigid scheduling.",
    icon: Code,
  },
  {
    step: 4,
    title: "AI Interview",
    description: "Have a natural conversation with our AI interviewer. It adapts to your responses and evaluates fairly.",
    icon: MessageSquare,
  },
  {
    step: 5,
    title: "Get Feedback & Offers",
    description: "Receive detailed performance feedback and connect directly with companies interested in hiring you.",
    icon: Award,
  },
];

const testimonials = [
  {
    quote: "The AI interview felt surprisingly natural. I could focus on showcasing my skills without the usual interview anxiety.",
    name: "Priya Sharma",
    role: "Software Engineer",
    company: "Hired at TechCorp",
  },
  {
    quote: "Getting instant feedback helped me understand exactly where I needed to improve. I landed my dream job on the second try!",
    name: "Rahul Mehta",
    role: "Data Scientist",
    company: "Hired at DataFlow",
  },
  {
    quote: "As a working professional, being able to interview at midnight from my home was a game-changer.",
    name: "Ananya Patel",
    role: "Product Manager",
    company: "Hired at InnovateCo",
  },
];

const stats = [
  { value: "50K+", label: "Successful Placements" },
  { value: "500+", label: "Partner Companies" },
  { value: "4.9/5", label: "Candidate Rating" },
  { value: "< 24h", label: "Average Response Time" },
];

export default function ForCandidatesPage() {
  return (
    <div className="min-h-screen">
      <InteractiveBackground particleCount={25} enableParticles={true} enableGradientOrbs={true} enableGridPattern={true} />
      <Navbar />

      {/* Hero Section */}
      <Section className="pt-32 md:pt-40">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl text-center"
          >
            <Badge variant="outline" className="mb-6 gap-2 bg-success/10 border-success/30">
              <UserCheck className="h-4 w-4 text-success" />
              For Candidates
            </Badge>

            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Land Your Dream Job with{" "}
              <span className="gradient-text">Fair AI Interviews</span>
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Experience stress-free interviewing. Our AI evaluates your true potential—not your 
              background—and gives you detailed feedback to help you grow.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="hero" size="xl" asChild>
                <Link to="/register/candidate">
                  Find Jobs Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </motion.div>
        </Container>
      </Section>

      {/* Featured Jobs Section */}
      <Section className="py-16">
        <Container>
          <SectionHeader
            eyebrow="Available Jobs"
            title="Explore opportunities across industries"
            description="Thousands of positions from top companies, all using fair AI-powered interviews."
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <GlassCard hover className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <category.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.count} open positions</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button variant="outline" size="lg" asChild>
              <Link to="/candidate/jobs">
                View All Jobs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Container>
      </Section>

      {/* Stats */}
      <Section className="py-16 bg-secondary/30">
        <Container>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="mb-2 text-4xl font-bold gradient-text md:text-5xl">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Benefits */}
      <Section>
        <Container>
          <SectionHeader
            eyebrow="Why Choose Us"
            title="Benefits of HireMinds AI for candidates"
            description="We've redesigned interviewing to be fair, convenient, and growth-focused."
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <GlassCard hover className="h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                      <benefit.icon className="h-6 w-6 text-success" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {benefit.highlight}
                    </Badge>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* How It Works */}
      <Section>
        <Container>
          <SectionHeader
            eyebrow="How It Works"
            title="Your path to a new career"
            description="Simple, transparent, and designed with candidates in mind."
          />

          <div className="relative mx-auto max-w-4xl">
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="mb-8 flex gap-6"
              >
                <div className="flex flex-col items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary text-xl font-bold">
                    <item.icon className="h-6 w-6" />
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="h-full w-0.5 bg-gradient-to-b from-primary to-transparent" />
                  )}
                </div>
                <div className="pb-8 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline">Step {item.step}</Badge>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Testimonials */}
      <Section>
        <Container>
          <SectionHeader
            eyebrow="Success Stories"
            title="Candidates who found their dream jobs"
          />

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <GlassCard className="h-full">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-semibold text-primary">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      <div className="text-xs text-success">{testimonial.company}</div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section>
        <Container>
          <GlassCard elevated className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Ready to start your journey?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
              Create your free profile and get matched with opportunities that fit your skills.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="hero" size="lg" asChild>
                <Link to="/register/candidate">
                  Create Free Profile
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/candidate/jobs">Browse Jobs</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" /> 100% free for candidates
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" /> No experience required
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" /> Get feedback on every interview
              </span>
            </div>
          </GlassCard>
        </Container>
      </Section>

      <Footer />
    </div>
  );
}
