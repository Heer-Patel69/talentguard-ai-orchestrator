import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { ScoreGauge } from "./ScoreGauge";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  Minus,
  Plus,
} from "lucide-react";

interface RoundScore {
  id: string;
  round_number: number;
  base_score: number;
  clarifying_questions_bonus: number;
  optimization_bonus: number;
  edge_cases_bonus: number;
  fraud_penalty: number;
  hints_penalty: number;
  final_score: number;
  weight: number;
  strengths: string[] | null;
  weaknesses: string[] | null;
  improvement_suggestions: string[] | null;
}

interface RoundScoreCardProps {
  score: RoundScore;
  roundType?: string;
  onClick?: () => void;
}

export function RoundScoreCard({ score, roundType, onClick }: RoundScoreCardProps) {
  const totalBonus = score.clarifying_questions_bonus + score.optimization_bonus + score.edge_cases_bonus;
  const totalPenalty = score.fraud_penalty + score.hints_penalty;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard 
        hover 
        className={cn("cursor-pointer", onClick && "hover:ring-2 hover:ring-primary/50")}
        onClick={onClick}
      >
        <div className="flex items-center gap-6">
          <ScoreGauge score={score.final_score} size="md" />

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Round {score.round_number}</h3>
                {roundType && (
                  <p className="text-sm text-muted-foreground capitalize">
                    {roundType.replace("_", " ")}
                  </p>
                )}
              </div>
              {onClick && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Base Score</span>
                <p className="font-medium">{score.base_score.toFixed(1)}</p>
              </div>
              <div>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Plus className="h-3 w-3 text-success" /> Bonus
                </span>
                <p className="font-medium text-success">+{totalBonus.toFixed(1)}</p>
              </div>
              <div>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Minus className="h-3 w-3 text-danger" /> Penalty
                </span>
                <p className="font-medium text-danger">-{totalPenalty.toFixed(1)}</p>
              </div>
            </div>

            {/* Bonus Breakdown */}
            {totalBonus > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {score.clarifying_questions_bonus > 0 && (
                  <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                    +{score.clarifying_questions_bonus} Clarifying Questions
                  </span>
                )}
                {score.optimization_bonus > 0 && (
                  <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                    +{score.optimization_bonus} Optimization
                  </span>
                )}
                {score.edge_cases_bonus > 0 && (
                  <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                    +{score.edge_cases_bonus} Edge Cases
                  </span>
                )}
              </div>
            )}

            {/* Penalty Breakdown */}
            {totalPenalty > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {score.fraud_penalty > 0 && (
                  <span className="text-xs bg-danger/10 text-danger px-2 py-0.5 rounded-full">
                    -{score.fraud_penalty} Fraud Flag
                  </span>
                )}
                {score.hints_penalty > 0 && (
                  <span className="text-xs bg-danger/10 text-danger px-2 py-0.5 rounded-full">
                    -{score.hints_penalty} Hints Used
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Strengths & Weaknesses Preview */}
        <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-success" /> Strengths
            </h4>
            <ul className="space-y-1">
              {(score.strengths || []).slice(0, 2).map((strength, i) => (
                <li key={i} className="text-xs text-muted-foreground line-clamp-1">
                  • {strength}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-warning" /> Areas to Improve
            </h4>
            <ul className="space-y-1">
              {(score.weaknesses || []).slice(0, 2).map((weakness, i) => (
                <li key={i} className="text-xs text-muted-foreground line-clamp-1">
                  • {weakness}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
