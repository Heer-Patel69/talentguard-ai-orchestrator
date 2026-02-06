import { PageBackground } from "@/components/ui/layout";
import { InterviewerRegisterForm } from "@/components/auth/InterviewerRegisterForm";
import { Brain } from "lucide-react";
import { Link } from "react-router-dom";

export default function InterviewerRegisterPage() {
  return (
    <div className="min-h-screen py-12">
      <PageBackground pattern="dots" />
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">
              Hire<span className="gradient-text">Minds</span> AI
            </span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Register as a Company</h1>
          <p className="text-muted-foreground">
            Set up your account to start hiring top talent
          </p>
        </div>
        <InterviewerRegisterForm />
      </div>
    </div>
  );
}
