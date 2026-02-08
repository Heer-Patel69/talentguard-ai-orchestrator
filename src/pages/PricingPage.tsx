import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Container, Section, SectionHeader, PageBackground } from "@/components/ui/layout";
import { Navbar, Footer } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  ArrowRight,
  Zap,
  Building2,
  Rocket,
  Crown,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const plans = [
  {
    name: "Starter",
    description: "Perfect for small teams getting started with AI hiring",
    price: "$0",
    period: "/month",
    icon: Zap,
    popular: false,
    features: [
      { text: "Up to 25 interviews/month", included: true },
      { text: "3 active job postings", included: true },
      { text: "AI resume screening", included: true },
      { text: "MCQ assessments", included: true },
      { text: "Coding challenges (5 languages)", included: true },
      { text: "Voice AI interviews", included: true },
      { text: "Basic fraud detection", included: true },
      { text: "Email support", included: true },
      { text: "Custom branding", included: false },
      { text: "API access", included: false },
      { text: "SSO integration", included: false },
      { text: "Dedicated account manager", included: false },
    ],
    cta: "Start Free Trial",
    ctaVariant: "outline" as const,
  },
  {
    name: "Professional",
    description: "For growing companies with serious hiring needs",
    price: "$299",
    period: "/month",
    icon: Rocket,
    popular: true,
    features: [
      { text: "Up to 100 interviews/month", included: true },
      { text: "10 active job postings", included: true },
      { text: "AI resume screening", included: true },
      { text: "MCQ assessments", included: true },
      { text: "Coding challenges (20+ languages)", included: true },
      { text: "Voice AI interviews", included: true },
      { text: "Advanced fraud detection", included: true },
      { text: "Priority email & chat support", included: true },
      { text: "Custom branding", included: true },
      { text: "API access", included: true },
      { text: "SSO integration", included: false },
      { text: "Dedicated account manager", included: false },
    ],
    cta: "Start Free Trial",
    ctaVariant: "hero" as const,
  },
  {
    name: "Enterprise",
    description: "For large organizations with custom requirements",
    price: "Custom",
    period: "",
    icon: Crown,
    popular: false,
    features: [
      { text: "Unlimited interviews", included: true },
      { text: "Unlimited job postings", included: true },
      { text: "AI resume screening", included: true },
      { text: "MCQ assessments", included: true },
      { text: "Coding challenges (all languages)", included: true },
      { text: "Voice AI interviews", included: true },
      { text: "Advanced fraud detection + custom rules", included: true },
      { text: "24/7 phone, email & chat support", included: true },
      { text: "Custom branding", included: true },
      { text: "Full API access + webhooks", included: true },
      { text: "SSO/SAML integration", included: true },
      { text: "Dedicated account manager", included: true },
    ],
    cta: "Contact Sales",
    ctaVariant: "outline" as const,
  },
];

const faqs = [
  {
    question: "Is there a free trial?",
    answer: "Yes! All paid plans come with a 14-day free trial. No credit card required to start. You can explore all features and cancel anytime if it's not the right fit.",
  },
  {
    question: "What counts as an interview?",
    answer: "An interview is counted when a candidate completes the full assessment pipeline for a job application. This includes resume screening, MCQ tests, coding challenges, and the AI voice interview.",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer: "Absolutely! You can change your plan at any time. Upgrades take effect immediately, and downgrades apply at the start of your next billing cycle. We'll prorate any differences.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for Enterprise plans. All payments are processed securely through Stripe.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes, security is our top priority. We're SOC2 Type II compliant, use AES-256 encryption for data at rest, and TLS 1.3 for data in transit. All interview recordings are encrypted and stored in secure, GDPR-compliant data centers.",
  },
  {
    question: "Do you offer discounts for startups or non-profits?",
    answer: "Yes! We offer 50% off for verified startups (under 2 years old, under $2M in funding) and 30% off for registered non-profit organizations. Contact us to apply.",
  },
  {
    question: "What happens if I exceed my interview limit?",
    answer: "We'll notify you when you reach 80% of your limit. If you exceed it, you can either upgrade your plan or pay for additional interviews at $5 each for Starter and $3 each for Professional.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time. Your access continues until the end of your current billing period. We don't offer refunds for partial months, but we're happy to help you find a solution that works.",
  },
];

const comparisonFeatures = [
  { name: "Interviews per month", starter: "25", pro: "100", enterprise: "Unlimited" },
  { name: "Active job postings", starter: "3", pro: "10", enterprise: "Unlimited" },
  { name: "AI resume screening", starter: true, pro: true, enterprise: true },
  { name: "MCQ assessments", starter: true, pro: true, enterprise: true },
  { name: "Coding languages", starter: "5", pro: "20+", enterprise: "All" },
  { name: "Voice AI interviews", starter: true, pro: true, enterprise: true },
  { name: "Interview playback", starter: true, pro: true, enterprise: true },
  { name: "Fraud detection", starter: "Basic", pro: "Advanced", enterprise: "Custom rules" },
  { name: "Analytics dashboard", starter: "Basic", pro: "Advanced", enterprise: "Custom" },
  { name: "Custom branding", starter: false, pro: true, enterprise: true },
  { name: "API access", starter: false, pro: true, enterprise: "Full + webhooks" },
  { name: "SSO/SAML", starter: false, pro: false, enterprise: true },
  { name: "Support", starter: "Email", pro: "Priority", enterprise: "24/7 + Dedicated" },
  { name: "SLA", starter: "99%", pro: "99.5%", enterprise: "99.9%" },
];

export default function PricingPage() {
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
            <Badge variant="outline" className="mb-6 gap-2">
              <Building2 className="h-4 w-4" />
              Simple, Transparent Pricing
            </Badge>

            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Plans that scale with your{" "}
              <span className="gradient-text">hiring needs</span>
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Start free, upgrade when you're ready. All plans include AI-powered interviews, 
              fraud detection, and explainable recommendations.
            </p>
          </motion.div>
        </Container>
      </Section>

      {/* Pricing Cards */}
      <Section className="py-16">
        <Container>
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <GlassCard 
                  className={`h-full ${plan.popular ? 'border-primary/50 bg-primary/5' : ''}`}
                  elevated={plan.popular}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${plan.popular ? 'bg-primary/20' : 'bg-primary/10'}`}>
                      <plan.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-2">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground/50 shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? '' : 'text-muted-foreground/50'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    variant={plan.ctaVariant} 
                    className="w-full" 
                    size="lg"
                    asChild
                  >
                    <Link to={plan.name === "Enterprise" ? "/contact" : "/register/interviewer"}>
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Feature Comparison Table */}
      <Section>
        <Container>
          <SectionHeader
            eyebrow="Compare Plans"
            title="Detailed feature comparison"
          />

          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-semibold">Feature</th>
                    <th className="text-center p-4 font-semibold">Starter</th>
                    <th className="text-center p-4 font-semibold bg-primary/5">Professional</th>
                    <th className="text-center p-4 font-semibold">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, index) => (
                    <tr key={feature.name} className={index % 2 === 0 ? 'bg-secondary/20' : ''}>
                      <td className="p-4 font-medium">{feature.name}</td>
                      <td className="text-center p-4">
                        {typeof feature.starter === 'boolean' ? (
                          feature.starter ? (
                            <Check className="h-5 w-5 text-success mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                          )
                        ) : (
                          feature.starter
                        )}
                      </td>
                      <td className="text-center p-4 bg-primary/5">
                        {typeof feature.pro === 'boolean' ? (
                          feature.pro ? (
                            <Check className="h-5 w-5 text-success mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                          )
                        ) : (
                          feature.pro
                        )}
                      </td>
                      <td className="text-center p-4">
                        {typeof feature.enterprise === 'boolean' ? (
                          feature.enterprise ? (
                            <Check className="h-5 w-5 text-success mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                          )
                        ) : (
                          feature.enterprise
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </Container>
      </Section>

      {/* FAQ */}
      <Section>
        <Container>
          <SectionHeader
            eyebrow="FAQ"
            title="Frequently asked questions"
            description="Everything you need to know about our pricing and plans."
          />

          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                      {faq.question}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pl-8">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section>
        <Container>
          <GlassCard elevated className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Still have questions?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
              Our team is here to help you find the perfect plan for your organization.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="hero" size="lg" asChild>
                <Link to="/register/interviewer">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/contact">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Talk to Sales
                </Link>
              </Button>
            </div>
          </GlassCard>
        </Container>
      </Section>

      <Footer />
    </div>
  );
}
