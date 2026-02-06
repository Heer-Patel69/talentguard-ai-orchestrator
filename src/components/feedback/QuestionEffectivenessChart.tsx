import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  MessageSquare,
  Target,
  Clock,
  TrendingUp,
  HelpCircle,
  ChevronRight,
} from "lucide-react";

interface QuestionData {
  id: string;
  questionText: string;
  questionType: string;
  jobField: string;
  differentiationScore: number;
  predictionAccuracy: number;
  avgTimeSpent: number;
  timesAsked: number;
}

interface QuestionEffectivenessChartProps {
  questions: QuestionData[];
  onViewQuestion?: (id: string) => void;
  className?: string;
}

export function QuestionEffectivenessChart({
  questions,
  onViewQuestion,
  className,
}: QuestionEffectivenessChartProps) {
  const sortedQuestions = useMemo(() => {
    return [...questions].sort((a, b) => b.differentiationScore - a.differentiationScore);
  }, [questions]);

  const topPerformers = sortedQuestions.slice(0, 5);
  const lowPerformers = sortedQuestions.slice(-3);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-danger";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-warning";
    return "bg-danger";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className={cn("rounded-xl border border-border bg-card", className)}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Question Effectiveness</h3>
            <p className="text-sm text-muted-foreground">
              Which questions best differentiate candidates
            </p>
          </div>
        </div>
      </div>

      {/* Top Performing Questions */}
      <div className="p-6">
        <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-success" />
          Top Performing Questions
        </h4>

        <div className="space-y-3">
          {topPerformers.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group"
              onClick={() => onViewQuestion?.(question.id)}
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-success/10 text-success font-bold text-sm shrink-0">
                  #{index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate mb-2">{question.questionText}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {question.questionType}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {question.differentiationScore}% differentiation
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(question.avgTimeSpent)} avg
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className={cn("text-lg font-bold", getScoreColor(question.predictionAccuracy))}>
                    {question.predictionAccuracy}%
                  </p>
                  <p className="text-xs text-muted-foreground">accuracy</p>
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Score Bar */}
              <div className="mt-3 flex items-center gap-3">
                <Progress 
                  value={question.differentiationScore} 
                  className={cn("h-1.5 flex-1", getScoreBg(question.differentiationScore))}
                />
                <span className="text-xs text-muted-foreground">
                  Asked {question.timesAsked} times
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Questions Needing Improvement */}
      {lowPerformers.some((q) => q.differentiationScore < 50) && (
        <div className="p-6 pt-0">
          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-warning" />
            Questions to Review
          </h4>

          <div className="space-y-2">
            {lowPerformers
              .filter((q) => q.differentiationScore < 50)
              .map((question) => (
                <div
                  key={question.id}
                  className="p-3 rounded-lg bg-warning/5 border border-warning/20 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{question.questionText}</p>
                    <p className="text-xs text-muted-foreground">
                      Only {question.differentiationScore}% differentiation score
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                    Review
                  </Badge>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="p-6 pt-0">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-secondary/50 text-center">
            <p className="text-lg font-bold">{questions.length}</p>
            <p className="text-xs text-muted-foreground">Total Questions</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50 text-center">
            <p className="text-lg font-bold">
              {Math.round(questions.reduce((acc, q) => acc + q.differentiationScore, 0) / questions.length)}%
            </p>
            <p className="text-xs text-muted-foreground">Avg Differentiation</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50 text-center">
            <p className="text-lg font-bold">
              {formatTime(Math.round(questions.reduce((acc, q) => acc + q.avgTimeSpent, 0) / questions.length))}
            </p>
            <p className="text-xs text-muted-foreground">Avg Time</p>
          </div>
        </div>
      </div>
    </div>
  );
}
