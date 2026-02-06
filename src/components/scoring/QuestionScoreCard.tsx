import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { ScoreGauge } from "./ScoreGauge";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Code,
  MessageSquare,
  Lightbulb,
  Clock,
  Target,
} from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface QuestionScore {
  id: string;
  question_number: number;
  question_text: string;
  candidate_answer: string | null;
  technical_accuracy: number;
  code_quality: number;
  communication_clarity: number;
  problem_solving: number;
  time_efficiency: number;
  weighted_score: number;
  ai_evaluation: string | null;
  ai_reasoning: string | null;
  score_justification: string | null;
  time_taken_seconds: number | null;
  hints_used: number;
}

interface QuestionScoreCardProps {
  score: QuestionScore;
  index: number;
}

export function QuestionScoreCard({ score, index }: QuestionScoreCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getScoreLevel = (value: number) => {
    if (value >= 80) return { label: "Excellent", color: "text-success" };
    if (value >= 60) return { label: "Good", color: "text-warning" };
    if (value >= 40) return { label: "Fair", color: "text-orange-500" };
    return { label: "Needs Improvement", color: "text-danger" };
  };

  const formatTime = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const scoreLevel = getScoreLevel(score.weighted_score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <GlassCard className="overflow-hidden">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <span className="font-bold text-primary">Q{score.question_number}</span>
                </div>
                <div className="text-left">
                  <p className="font-medium line-clamp-1">{score.question_text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("text-sm font-medium", scoreLevel.color)}>
                      {scoreLevel.label}
                    </span>
                    {score.hints_used > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({score.hints_used} hints used)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ScoreGauge score={score.weighted_score} size="sm" />
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="border-t border-border p-4 space-y-4">
              {/* Score Breakdown */}
              <div className="grid grid-cols-5 gap-4">
                {[
                  { label: "Technical", value: score.technical_accuracy, icon: Target },
                  { label: "Code Quality", value: score.code_quality, icon: Code },
                  { label: "Communication", value: score.communication_clarity, icon: MessageSquare },
                  { label: "Problem Solving", value: score.problem_solving, icon: Lightbulb },
                  { label: "Time Efficiency", value: score.time_efficiency, icon: Clock },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <item.icon className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                    <div className={cn(
                      "text-lg font-bold",
                      getScoreLevel(item.value).color
                    )}>
                      {item.value.toFixed(0)}
                    </div>
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                  </div>
                ))}
              </div>

              {/* Candidate Answer */}
              {score.candidate_answer && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Candidate's Answer</h4>
                  <div className="rounded-lg bg-secondary/50 p-3 text-sm">
                    <pre className="whitespace-pre-wrap font-mono text-xs">
                      {score.candidate_answer}
                    </pre>
                  </div>
                </div>
              )}

              {/* AI Evaluation */}
              {score.ai_evaluation && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    AI Evaluation
                  </h4>
                  <p className="text-sm text-muted-foreground">{score.ai_evaluation}</p>
                </div>
              )}

              {/* AI Reasoning */}
              {score.ai_reasoning && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-warning" />
                    Reasoning
                  </h4>
                  <p className="text-sm text-muted-foreground">{score.ai_reasoning}</p>
                </div>
              )}

              {/* Score Justification */}
              {score.score_justification && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                  <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    Score Justification
                  </h4>
                  <p className="text-sm text-muted-foreground">{score.score_justification}</p>
                </div>
              )}

              {/* Meta info */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                <span>Time taken: {formatTime(score.time_taken_seconds)}</span>
                <span>Hints used: {score.hints_used}</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </GlassCard>
    </motion.div>
  );
}
