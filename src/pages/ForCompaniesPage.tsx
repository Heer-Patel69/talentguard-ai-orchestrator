import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Container, Section, SectionHeader, PageBackground } from "@/components/ui/layout";
import { Navbar, Footer } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Eye,
  Code,
  BarChart3,
  ArrowRight,
  Check,
  Zap,
  Lock,
  Bot,
  Shield,
  Building2,
  Users,
  Clock,
  TrendingUp,
  FileSearch,
  Video,
  PieChart,
  Briefcase,
  Target,
  Award,
  Layers,
  Settings,
  MessageSquare,
} from "lucide-react";

const platformFeatures = [
  {
    icon: Brain,
    title: "AI-Powered Screening",
    description: "Our 6-agent pipeline automatically screens resumes, verifies credentials, and evaluates technical skills without human intervention.",
    highlight: "90% time savings",
  },
  {
    icon: Bot,
    title: "Autonomous AI Interviewer",
    description: "Natural voice conversations with adaptive questioning that adjusts based on candidate responses and skill level.",
    highlight: "24/7 availability",
  },
  {
    icon: Code,
    title: "Technical Assessment Suite",
    description: "Built-in IDE with 20+ language support, automated code evaluation, and complexity analysis for coding interviews.",
    highlight: "Instant scoring",
  },
  {
    icon: Eye,
    title: "Advanced Proctoring",
    description: "Real-time gaze tracking, face verification, tab-switch detection, and plagiarism checks ensure interview integrity.",
    highlight: "99.2% fraud detection",
  },
  {
    icon: BarChart3,
    title: "Explainable AI Decisions",
    description: "Every recommendation comes with detailed reasoning, score breakdowns, and evidence that recruiters can trust and audit.",
    highlight: "Full transparency",
  },
  {
    icon: Video,
    title: "Interview Playback",
    description: "Review complete interview recordings with synchronized code playback, transcript search, and AI-highlighted moments.",
    highlight: "Easy review",
  },
];

const benefits = [
  {
    icon: Clock,
    title: "Reduce Time-to-Hire by 90%",
    description: "Automate screening, interviewing, and evaluation. What took weeks now takes days.",
  },
  {
    icon: TrendingUp,
    title: "Improve Quality of Hire",
    description: "AI-driven assessments evaluate skills objectively, reducing bias and improving candidate-job fit.",
  },
  {
    icon: Shield,
    title: "Eliminate Interview Fraud",
    description: "Multi-layer proctoring detects impersonation, cheating, and AI-generated responses.",
  },
  {
    icon: Users,
    title: "Scale Without Limits",
    description: "Interview hundreds of candidates simultaneously without increasing recruiter workload.",
  },
  {
    icon: FileSearch,
    title: "Data-Driven Insights",
    description: "Analytics dashboard reveals hiring patterns, pipeline bottlenecks, and diversity metrics.",
  },
  {
    icon: Target,
    title: "Custom Interview Pipelines",
    description: "Configure rounds, questions, and scoring weights to match your unique hiring needs.",
  },
];

const howItWorks = [
  {
    step: 1,
    title: "Post Your Job",
    description: "Define role requirements, required skills, and customize interview rounds. Set difficulty levels and passing thresholds.",
    icon: Briefcase,
  },
  {
    step: 2,
    title: "AI Screens Candidates",
    description: "Our Gatekeeper agent analyzes resumes, verifies GitHub/LinkedIn profiles, and creates a shortlist of qualified candidates.",
    icon: FileSearch,
  },
  {
    step: 3,
    title: "Automated Interviews",
    description: "Candidates complete MCQ assessments, coding challenges, and voice interviews at their convenience—all AI-proctored.",
    icon: Bot,
  },
  {
    step: 4,
    title: "AI Evaluation & Ranking",
    description: "The Verdict agent aggregates all scores, detects fraud, and provides ranked recommendations with detailed explanations.",
    icon: Award,
  },
  {
    step: 5,
    title: "Review & Decide",
    description: "Access full interview playbacks, AI reasoning, and comparative analytics. Make confident hiring decisions.",
    icon: PieChart,
  },
];

const stats = [
  { value: "90%", label: "Faster Hiring" },
  { value: "3x", label: "More Candidates Screened" },
  { value: "99.2%", label: "Fraud Detection Rate" },
  { value: "85%", label: "Recruiter Satisfaction" },
];

export default function ForCompaniesPage() {
  return (
    <div className="min-h-screen">
      <PageBackground pattern="grid" />
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
            <Badge variant="outline" className="mb-6 gap-2 bg-primary/10 border-primary/30">
              <Building2 className="h-4 w-4" />
              For Companies
            </Badge>

            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Hire Top Talent with{" "}
              <span className="gradient-text">AI Automation</span>
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Transform your hiring process with our autonomous AI platform. Screen thousands of candidates, 
              conduct proctored interviews, and get explainable recommendations—all without human intervention.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="hero" size="xl" asChild>
                <Link to="/register/interviewer">
                  Start Hiring Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
          </motion.div>
        </Container>
      </Section>

      {/* Stats */}
      <Section className="py-16">
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

      {/* Platform Features */}
      <Section>
        <Container>
          <SectionHeader
            eyebrow="Platform Features"
            title="Everything you need for autonomous hiring"
            description="Our comprehensive platform handles every stage of the hiring process with AI precision."
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {platformFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <GlassCard hover className="h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.highlight}
                    </Badge>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Benefits */}
      <Section>
        <Container>
          <SectionHeader
            eyebrow="Benefits"
            title="Why companies choose HireMinds AI"
            description="Join hundreds of organizations transforming their talent acquisition."
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
                <GlassCard className="h-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 mb-4">
                    <benefit.icon className="h-5 w-5 text-success" />
                  </div>
                  <h3 className="mb-2 font-semibold">{benefit.title}</h3>
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
            title="From job posting to perfect hire"
            description="Our 5-step process automates your entire recruitment pipeline."
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

      {/* Enterprise Features */}
      <Section>
        <Container>
          <GlassCard elevated className="gradient-border">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div>
                <Badge variant="outline" className="mb-4 gap-2">
                  <Layers className="h-4 w-4" />
                  Enterprise Ready
                </Badge>
                <h2 className="text-3xl font-bold mb-4">Built for Scale</h2>
                <p className="text-muted-foreground mb-6">
                  HireMinds AI is designed for organizations of all sizes, from startups to Fortune 500 companies.
                </p>
                <ul className="space-y-3">
                  {[
                    "SOC2 Type II Compliant",
                    "SSO & SAML Integration",
                    "Custom Branding",
                    "Dedicated Account Manager",
                    "99.9% Uptime SLA",
                    "API Access & Webhooks",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-success" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <GlassCard className="text-center p-6">
                  <Settings className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="font-semibold">Custom Pipelines</div>
                </GlassCard>
                <GlassCard className="text-center p-6">
                  <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="font-semibold">24/7 Support</div>
                </GlassCard>
                <GlassCard className="text-center p-6">
                  <Lock className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="font-semibold">Data Security</div>
                </GlassCard>
                <GlassCard className="text-center p-6">
                  <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="font-semibold">Fast Integration</div>
                </GlassCard>
              </div>
            </div>
          </GlassCard>
        </Container>
      </Section>

      {/* CTA */}
      <Section>
        <Container>
          <GlassCard elevated className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Ready to transform your hiring?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
              Start your free trial today and experience the future of recruitment.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="hero" size="lg" asChild>
                <Link to="/register/interviewer">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" /> No credit card required
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" /> 14-day free trial
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" /> Cancel anytime
              </span>
            </div>
          </GlassCard>
        </Container>
      </Section>

      <Footer />
    </div>
  );
}
