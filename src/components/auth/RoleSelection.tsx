import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Building2, UserCheck, ArrowRight, Brain } from "lucide-react";

export function RoleSelection() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">
              Hire<span className="gradient-text">Minds</span> AI
            </span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Welcome to HireMinds AI
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose how you'd like to continue
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Company/Interviewer */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard hover className="h-full flex flex-col">
              <div className="flex-1">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-3">I'm a Company</h2>
                <p className="text-muted-foreground mb-6">
                  Looking to hire top talent with AI-powered interviews. 
                  Streamline your recruitment process and find the perfect candidates.
                </p>
                <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Post unlimited job positions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    AI-powered candidate screening
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Advanced fraud detection
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Detailed candidate reports
                  </li>
                </ul>
              </div>
              <Button variant="hero" className="w-full" asChild>
                <Link to="/register/interviewer">
                  Continue as Company
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </GlassCard>
          </motion.div>

          {/* Candidate */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard hover className="h-full flex flex-col">
              <div className="flex-1">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-success/10">
                  <UserCheck className="h-8 w-8 text-success" />
                </div>
                <h2 className="text-2xl font-bold mb-3">I'm a Candidate</h2>
                <p className="text-muted-foreground mb-6">
                  Ready to showcase your skills and land your dream job. 
                  Take AI-powered interviews at your convenience.
                </p>
                <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Fair and unbiased AI evaluation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Interview anytime, anywhere
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Instant feedback on performance
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Verified candidate badge
                  </li>
                </ul>
              </div>
              <Button variant="outline" className="w-full border-success text-success hover:bg-success/10" asChild>
                <Link to="/register/candidate">
                  Continue as Candidate
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </GlassCard>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8 text-muted-foreground"
        >
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
