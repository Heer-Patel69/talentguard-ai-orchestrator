import { InteractiveBackground } from "@/components/ui/interactive-background";
import { CandidateRegisterForm } from "@/components/auth/CandidateRegisterForm";
import { Brain } from "lucide-react";
import { Link } from "react-router-dom";

export default function CandidateRegisterPage() {
  return (
    <div className="min-h-screen py-12">
      <InteractiveBackground 
        particleCount={20}
        enableParticles={true}
        enableGradientOrbs={true}
        enableGridPattern={true}
      />
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold font-display tracking-tight">
              Hire<span className="gradient-text">Minds</span> AI
            </span>
          </Link>
          <h1 className="text-2xl font-bold font-display mb-2">Register as a Candidate</h1>
          <p className="text-muted-foreground font-body">
            Create your profile and start your job search journey
          </p>
        </div>
        <CandidateRegisterForm />
      </div>
    </div>
  );
}
