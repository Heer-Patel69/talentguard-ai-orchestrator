import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Container, Section, SectionHeader } from "@/components/ui/layout";
import { Navbar, Footer } from "@/components/layout/Navbar";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { TypewriterText } from "@/components/ui/animated-gradient-border";
import { InteractiveBackground } from "@/components/ui/interactive-background";
import { staggerContainer, staggerItem, hoverLift, fadeInUp } from "@/lib/animation-presets";
import {
  Brain,
  Eye,
  Code,
  Users,
  BarChart3,
  ArrowRight,
  Check,
  Zap,
  Lock,
  Bot,
  Shield,
  Building2,
  UserCheck,
  Sparkles,
  Globe,
  HeartHandshake,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Multi-Agent Orchestration",
    description:
      "Autonomous AI agents coordinate the entire hiring process—from screening to final decision—without human intervention.",
    color: "from-teal-500 to-cyan-500",
  },
  {
    icon: Eye,
    title: "Advanced Proctoring",
    description:
      "Real-time gaze detection, person verification, and plagiarism checks ensure interview integrity.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: Code,
    title: "In-built IDE & Whiteboard",
    description:
      "Monaco-powered code editor and collaborative whiteboard for technical and system design rounds.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Lock,
    title: "Fraud Detection",
    description:
      "Tab-switching detection, multiple face alerts, and code playback analysis prevent cheating.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Bot,
    title: "AI Interviewer",
    description:
      "Dynamic questioning that adapts based on candidate responses and performance in real-time.",
    color: "from-teal-600 to-emerald-500",
  },
  {
    icon: BarChart3,
    title: "Explainable Decisions",
    description:
      "Every hire/no-hire decision comes with detailed reasoning that recruiters can trust and audit.",
    color: "from-cyan-500 to-teal-500",
  },
];

const stats = [
  { value: 90, suffix: "%", label: "Time Saved" },
  { value: 99.2, suffix: "%", label: "Fraud Detection", decimals: 1 },
  { value: 50, suffix: "K+", label: "Interviews" },
  { value: 4.9, suffix: "/5", label: "Trust Score", decimals: 1 },
];

const forCompanies = [
  { icon: Building2, title: "Enterprise Ready", description: "SOC2 compliant with SSO integration" },
  { icon: Sparkles, title: "AI-Powered Screening", description: "Reduce time-to-hire by 90%" },
  { icon: Shield, title: "Fraud Protection", description: "99.2% detection accuracy" },
];

const forCandidates = [
  { icon: UserCheck, title: "Fair Assessment", description: "Unbiased AI evaluation" },
  { icon: Globe, title: "Interview Anytime", description: "24/7 availability worldwide" },
  { icon: HeartHandshake, title: "Instant Feedback", description: "Know your strengths & areas to improve" },
];

const triggerConfetti = () => {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#1a9e8f', '#2bb5a6', '#e8993e', '#3ca8c9', '#5cc4b5'],
  });
};

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <InteractiveBackground 
        particleCount={40}
        enableParticles={true}
        enableGradientOrbs={true}
        enableGridPattern={true}
        enableNoise={false}
      />
      
      <Navbar />

      {/* Hero Section */}
      <Section className="pt-32 md:pt-44">
        <Container>
          <div ref={heroRef}>
            <motion.div
              style={{ opacity: heroOpacity }}
              className="mx-auto max-w-5xl text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2.5 text-sm font-medium"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Zap className="h-4 w-4 text-primary" />
                </motion.div>
                <span className="text-primary font-semibold">Autonomous Hiring Platform</span>
                <motion.span 
                  className="ml-1 inline-flex h-2 w-2 rounded-full bg-success"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="mb-8 font-display text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl"
              >
                <span>Hire Smarter with </span>
                <br className="hidden md:block" />
                <span className="gradient-text inline-block">
                  <TypewriterText text="AI Agents" speed={80} delay={0.8} />
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mx-auto mb-10 max-w-2xl text-lg font-body text-muted-foreground md:text-xl leading-relaxed"
              >
                HireMinds AI orchestrates your entire hiring pipeline—from candidate
                screening to final selection—with fraud-proof proctoring and
                explainable AI decisions.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex flex-col items-center justify-center gap-4 sm:flex-row"
              >
                <motion.div {...hoverLift}>
                  <Button 
                    variant="hero" 
                    size="xl" 
                    asChild 
                    className="sparkle-hover relative overflow-hidden group"
                    onClick={triggerConfetti}
                  >
                    <Link to="/register">
                      <span className="relative z-10 flex items-center">
                        Start Hiring Free
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ["-200%", "200%"] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div {...hoverLift}>
                  <Button variant="outline" size="xl" asChild className="border-primary/30 hover:border-primary/60">
                    <Link to="/demo">Watch Demo</Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
            className="mt-20 md:mt-28"
          >
            <div className="vibrant-card mx-auto max-w-5xl p-0">
              <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
                <motion.div 
                  className="h-3 w-3 rounded-full bg-danger"
                  whileHover={{ scale: 1.3 }}
                />
                <motion.div 
                  className="h-3 w-3 rounded-full bg-warning"
                  whileHover={{ scale: 1.3 }}
                />
                <motion.div 
                  className="h-3 w-3 rounded-full bg-success"
                  whileHover={{ scale: 1.3 }}
                />
                <span className="ml-4 text-sm text-muted-foreground font-body">
                  Command Center — Live Interview
                </span>
              </div>
              <motion.div 
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="grid gap-4 p-6 md:grid-cols-3"
              >
                <motion.div variants={staggerItem} className="rounded-xl bg-secondary/50 p-5 hover:bg-secondary/70 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                  <div className="mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Active Candidates</span>
                  </div>
                  <div className="text-4xl font-bold font-display">
                    <AnimatedCounter value={24} />
                  </div>
                  <div className="text-sm text-muted-foreground font-body mt-1">
                    8 in technical round
                  </div>
                </motion.div>
                <motion.div variants={staggerItem} className="rounded-xl bg-secondary/50 p-5 hover:bg-secondary/70 transition-all duration-300 hover:shadow-lg hover:shadow-success/5">
                  <div className="mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-success" />
                    <span className="text-sm font-semibold">Trust Score</span>
                  </div>
                  <div className="text-4xl font-bold text-success font-display">
                    <AnimatedCounter value={94} suffix="%" />
                  </div>
                  <div className="text-sm text-muted-foreground font-body mt-1">
                    2 flags detected
                  </div>
                </motion.div>
                <motion.div variants={staggerItem} className="rounded-xl bg-secondary/50 p-5 hover:bg-secondary/70 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                  <div className="mb-3 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">AI Agent Status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.div 
                      className="h-2.5 w-2.5 rounded-full bg-success"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="font-semibold text-success">Processing</span>
                  </div>
                  <div className="text-sm text-muted-foreground font-body mt-1">
                    Evaluating responses
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </Container>
      </Section>

      {/* Stats */}
      <Section className="py-16">
        <Container>
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 gap-8 md:grid-cols-4"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={staggerItem}
                className="text-center group"
              >
                <div className="mb-2 text-4xl font-bold font-display gradient-text md:text-6xl">
                  <AnimatedCounter 
                    value={stat.value} 
                    suffix={stat.suffix}
                    decimals={stat.decimals || 0}
                    delay={index * 0.1}
                  />
                </div>
                <div className="text-sm text-muted-foreground font-body font-medium tracking-wide uppercase">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Section>

      {/* For Companies & Candidates */}
      <Section>
        <Container>
          <div className="grid gap-8 md:grid-cols-2">
            {/* For Companies */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <div className="vibrant-card h-full p-6 rounded-xl">
                <div className="mb-6 flex items-center gap-3">
                  <motion.div 
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20"
                  >
                    <Building2 className="h-6 w-6 text-primary" />
                  </motion.div>
                  <h3 className="text-2xl font-bold font-display">For Companies</h3>
                </div>
                <motion.div 
                  variants={staggerContainer}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  className="space-y-4"
                >
                  {forCompanies.map((item) => (
                    <motion.div 
                      key={item.title} 
                      variants={staggerItem}
                      className="flex items-start gap-3 group"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success/10 transition-all group-hover:bg-success/20 group-hover:scale-110">
                        <item.icon className="h-4 w-4 text-success" />
                      </div>
                      <div>
                        <h4 className="font-semibold font-display">{item.title}</h4>
                        <p className="text-sm text-muted-foreground font-body">{item.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
                <motion.div {...hoverLift}>
                  <Button variant="hero" className="mt-6 w-full group" asChild>
                    <Link to="/for-companies">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* For Candidates */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <div className="vibrant-card h-full p-6 rounded-xl">
                <div className="mb-6 flex items-center gap-3">
                  <motion.div 
                    whileHover={{ rotate: -10, scale: 1.1 }}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-primary/20"
                  >
                    <UserCheck className="h-6 w-6 text-accent" />
                  </motion.div>
                  <h3 className="text-2xl font-bold font-display">For Candidates</h3>
                </div>
                <motion.div 
                  variants={staggerContainer}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  className="space-y-4"
                >
                  {forCandidates.map((item) => (
                    <motion.div 
                      key={item.title} 
                      variants={staggerItem}
                      className="flex items-start gap-3 group"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success/10 transition-all group-hover:bg-success/20 group-hover:scale-110">
                        <item.icon className="h-4 w-4 text-success" />
                      </div>
                      <div>
                        <h4 className="font-semibold font-display">{item.title}</h4>
                        <p className="text-sm text-muted-foreground font-body">{item.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
                <motion.div {...hoverLift}>
                  <Button variant="outline" className="mt-6 w-full group border-primary/30 hover:border-primary/60" asChild>
                    <Link to="/for-candidates">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* Features */}
      <Section>
        <Container>
          <SectionHeader
            eyebrow="Features"
            title="Everything you need for autonomous hiring"
            description="From initial screening to final offer, HireMinds AI handles every step with precision and transparency."
          />

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={staggerItem}
              >
                <div className="vibrant-card h-full p-6 rounded-xl group">
                  <motion.div 
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} bg-opacity-10 transition-all group-hover:shadow-lg`}
                    style={{ background: `linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.1))` }}
                  >
                    <feature.icon className="h-6 w-6 text-primary" />
                  </motion.div>
                  <h3 className="mb-2 text-lg font-semibold font-display">{feature.title}</h3>
                  <p className="text-muted-foreground font-body leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Section>

      {/* How It Works */}
      <Section>
        <Container>
          <SectionHeader
            eyebrow="How It Works"
            title="From application to offer in 3 steps"
          />

          <div className="relative mx-auto max-w-4xl">
            {[
              {
                step: 1,
                title: "Configure Your Pipeline",
                description:
                  "Set up job requirements, define interview rounds, and customize AI behavior for your hiring needs.",
              },
              {
                step: 2,
                title: "AI Conducts Interviews",
                description:
                  "Candidates complete secure, proctored interviews with our AI interviewer—coding, system design, or behavioral.",
              },
              {
                step: 3,
                title: "Review & Hire",
                description:
                  "Get explainable recommendations with full playback. Make confident hiring decisions backed by data.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.15, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                className="mb-8 flex gap-6"
              >
                <div className="flex flex-col items-center">
                  <motion.div 
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-xl font-bold text-white shadow-lg shadow-primary/30 font-display"
                  >
                    {item.step}
                  </motion.div>
                  {index < 2 && (
                    <motion.div 
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="h-full w-0.5 bg-gradient-to-b from-primary via-accent to-transparent origin-top"
                    />
                  )}
                </div>
                <div className="pb-8">
                  <h3 className="mb-2 text-xl font-semibold font-display">{item.title}</h3>
                  <p className="text-muted-foreground font-body leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="vibrant-card animated-gradient-border mx-auto max-w-4xl text-center p-8 md:p-12 rounded-2xl relative overflow-hidden">
              {/* Aurora glow background */}
              <motion.div
                className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              
              <div className="relative z-10">
                <h2 className="mb-4 text-3xl font-bold font-display md:text-5xl">
                  Ready to transform your hiring?
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-muted-foreground font-body text-lg">
                  Join hundreds of companies using HireMinds AI to find the best
                  talent faster, fairer, and fraud-free.
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <motion.div {...hoverLift}>
                    <Button 
                      variant="hero" 
                      size="lg" 
                      asChild 
                      className="sparkle-hover"
                      onClick={triggerConfetti}
                    >
                      <Link to="/register">
                        Start Free Trial
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div {...hoverLift}>
                    <Button variant="outline" size="lg" asChild className="border-primary/30 hover:border-primary/60">
                      <Link to="/contact">Talk to Sales</Link>
                    </Button>
                  </motion.div>
                </div>
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground font-body"
                >
                  {[
                    "No credit card required",
                    "14-day free trial",
                    "Cancel anytime"
                  ].map((text, i) => (
                    <motion.span 
                      key={text}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4 text-success" /> {text}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </Container>
      </Section>

      <Footer />
    </div>
  );
}
