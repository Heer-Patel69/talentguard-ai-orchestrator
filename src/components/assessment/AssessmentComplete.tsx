import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Code,
  Brain,
  MessageSquare,
  Layout,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AssessmentResults {
  score: number;
  correct: number;
  wrong: number;
  skipped: number;
  topicBreakdown?: Record<string, { correct: number; total: number }>;
}

interface NextRound {
  round_number: number;
  round_type: string;
  duration_minutes: number;
}

interface AssessmentCompleteProps {
  results: AssessmentResults;
  applicationId: string | null;
  nextRound: NextRound | null;
  roundType: "mcq" | "coding";
  passingScore?: number;
}

const roundTypeInfo = {
  mcq: { icon: HelpCircle, label: "MCQ Assessment", color: "text-primary" },
  coding: { icon: Code, label: "Coding Challenge", color: "text-success" },
  behavioral: { icon: MessageSquare, label: "Behavioral Assessment", color: "text-warning" },
  system_design: { icon: Layout, label: "System Design", color: "text-info" },
  live_ai_interview: { icon: Brain, label: "AI Interview", color: "text-purple-500" },
};

export function AssessmentComplete({
  results,
  applicationId,
  nextRound,
  roundType,
  passingScore = 60,
}: AssessmentCompleteProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdvancing, setIsAdvancing] = useState(false);

  const passed = results.score >= passingScore;

  const handleAdvanceToNext = async () => {
    if (!applicationId || !nextRound) return;

    setIsAdvancing(true);
    try {
      // Update application to next round
      const { error } = await supabase
        .from("applications")
        .update({
          current_round: nextRound.round_number,
          status: "interviewing",
        })
        .eq("id", applicationId);

      if (error) throw error;

      // Navigate to appropriate assessment
      const routeMap: Record<string, string> = {
        mcq: "/candidate/assessment/mcq",
        coding: "/candidate/assessment/coding",
        behavioral: "/candidate/interview/live",
        system_design: "/candidate/interview/live",
        live_ai_interview: "/candidate/interview/live",
      };

      const route = routeMap[nextRound.round_type] || "/candidate/interview";
      navigate(`${route}?application=${applicationId}`);

      toast({
        title: "Moving to next round!",
        description: `Get ready for your ${roundTypeInfo[nextRound.round_type as keyof typeof roundTypeInfo]?.label || nextRound.round_type}`,
      });
    } catch (error) {
      console.error("Error advancing to next round:", error);
      toast({
        title: "Error",
        description: "Failed to advance to next round. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdvancing(false);
    }
  };

  const NextRoundIcon = nextRound
    ? roundTypeInfo[nextRound.round_type as keyof typeof roundTypeInfo]?.icon || HelpCircle
    : HelpCircle;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <GlassCard>
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <div
                className={cn(
                  "h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-4",
                  passed ? "bg-success/10" : "bg-danger/10"
                )}
              >
                <Trophy
                  className={cn(
                    "h-12 w-12",
                    passed ? "text-success" : "text-danger"
                  )}
                />
              </div>
            </motion.div>
            <h1 className="text-2xl font-bold mb-2">
              {roundType === "mcq" ? "MCQ Assessment" : "Coding Challenge"} Complete!
            </h1>
            <p className="text-muted-foreground">Here's how you performed</p>
          </div>

          {/* Score card */}
          <div
            className={cn(
              "p-6 rounded-xl mb-6",
              passed ? "bg-success/10" : "bg-danger/10"
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-medium">Your Score</span>
              <span
                className={cn(
                  "text-4xl font-bold",
                  passed ? "text-success" : "text-danger"
                )}
              >
                {results.score}%
              </span>
            </div>
            <Progress value={results.score} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {passed
                ? "Congratulations! You've passed this round."
                : `Passing score: ${passingScore}%`}
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-success/10 text-center">
              <CheckCircle2 className="h-6 w-6 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-success">{results.correct}</p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div className="p-4 rounded-lg bg-danger/10 text-center">
              <XCircle className="h-6 w-6 text-danger mx-auto mb-2" />
              <p className="text-2xl font-bold text-danger">{results.wrong}</p>
              <p className="text-sm text-muted-foreground">Wrong</p>
            </div>
            <div className="p-4 rounded-lg bg-warning/10 text-center">
              <Clock className="h-6 w-6 text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold text-warning">{results.skipped}</p>
              <p className="text-sm text-muted-foreground">Skipped</p>
            </div>
          </div>

          {/* Topic breakdown */}
          {results.topicBreakdown && Object.keys(results.topicBreakdown).length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Topic Performance</h3>
              <div className="space-y-2">
                {Object.entries(results.topicBreakdown).map(([topic, data]) => (
                  <div key={topic} className="flex items-center gap-3">
                    <span className="text-sm w-32 truncate">{topic}</span>
                    <Progress
                      value={(data.correct / data.total) * 100}
                      className="flex-1 h-2"
                    />
                    <span className="text-sm text-muted-foreground w-16 text-right">
                      {data.correct}/{data.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Round Button */}
          {passed && nextRound && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/30"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <NextRoundIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Next: {roundTypeInfo[nextRound.round_type as keyof typeof roundTypeInfo]?.label || nextRound.round_type}</h4>
                  <p className="text-sm text-muted-foreground">
                    Round {nextRound.round_number} • {nextRound.duration_minutes} minutes
                  </p>
                </div>
              </div>
              <Button
                onClick={handleAdvanceToNext}
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isAdvancing}
              >
                {isAdvancing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading Next Assessment...
                  </>
                ) : (
                  <>
                    Move to Next Assessment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/candidate/applications")}
            >
              View Applications
            </Button>
            <Button
              className="flex-1"
              onClick={() => navigate("/candidate")}
            >
              Back to Dashboard
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
