import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { ScoreGauge } from "./ScoreGauge";
import { DecisionBadge, DecisionCard } from "./DecisionBadge";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Lightbulb,
  AlertTriangle,
  Award,
  Users,
  BarChart3,
  Target,
  MessageSquare,
  Brain,
} from "lucide-react";

interface CandidateScore {
  id: string;
  final_score: number;
  percentile_rank: number | null;
  technical_score: number;
  communication_score: number;
  problem_solving_score: number;
  recommendation: "shortlist" | "maybe" | "reject";
  recommendation_reason: string | null;
  recommendation_confidence: number | null;
  overall_summary: string | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  improvement_suggestions: string[] | null;
  risk_flags: string[] | null;
  risk_explanations: string[] | null;
  rank_among_applicants: number | null;
  total_applicants: number | null;
}

interface CandidateScoreSummaryProps {
  score: CandidateScore;
  candidateName: string;
}

export function CandidateScoreSummary({ score, candidateName }: CandidateScoreSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <GlassCard>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <ScoreGauge score={score.final_score} size="lg" label="Overall Score" />

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold">{candidateName}</h2>
            <div className="mt-2">
              <DecisionBadge
                decision={score.recommendation}
                confidence={score.recommendation_confidence ?? undefined}
                size="lg"
              />
            </div>

            {score.rank_among_applicants && score.total_applicants && (
              <div className="mt-4 flex items-center justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Award className="h-4 w-4 text-warning" />
                  Rank #{score.rank_among_applicants} of {score.total_applicants}
                </div>
                {score.percentile_rank && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Top {(100 - score.percentile_rank).toFixed(0)}%
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Category Scores */}
          <div className="grid grid-cols-3 gap-4">
            <ScoreGauge
              score={score.technical_score}
              size="sm"
              label="Technical"
            />
            <ScoreGauge
              score={score.communication_score}
              size="sm"
              label="Communication"
            />
            <ScoreGauge
              score={score.problem_solving_score}
              size="sm"
              label="Problem Solving"
            />
          </div>
        </div>

        {/* Overall Summary */}
        {score.overall_summary && (
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Summary
            </h3>
            <p className="text-muted-foreground">{score.overall_summary}</p>
          </div>
        )}
      </GlassCard>

      {/* Decision Recommendation */}
      <DecisionCard
        decision={score.recommendation}
        reason={score.recommendation_reason || "No specific reason provided."}
        confidence={score.recommendation_confidence ?? undefined}
      />

      {/* Strengths, Weaknesses, Suggestions */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="h-full">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-success" />
              Strengths
            </h3>
            <ul className="space-y-2">
              {(score.strengths || []).map((strength, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-success mt-1.5 shrink-0" />
                  {strength}
                </li>
              ))}
              {(!score.strengths || score.strengths.length === 0) && (
                <li className="text-sm text-muted-foreground italic">No strengths identified</li>
              )}
            </ul>
          </GlassCard>
        </motion.div>

        {/* Weaknesses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="h-full">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <TrendingDown className="h-5 w-5 text-warning" />
              Areas to Improve
            </h3>
            <ul className="space-y-2">
              {(score.weaknesses || []).map((weakness, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-warning mt-1.5 shrink-0" />
                  {weakness}
                </li>
              ))}
              {(!score.weaknesses || score.weaknesses.length === 0) && (
                <li className="text-sm text-muted-foreground italic">No weaknesses identified</li>
              )}
            </ul>
          </GlassCard>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="h-full">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-info" />
              Improvement Suggestions
            </h3>
            <ul className="space-y-2">
              {(score.improvement_suggestions || []).map((suggestion, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-info mt-1.5 shrink-0" />
                  {suggestion}
                </li>
              ))}
              {(!score.improvement_suggestions || score.improvement_suggestions.length === 0) && (
                <li className="text-sm text-muted-foreground italic">No suggestions available</li>
              )}
            </ul>
          </GlassCard>
        </motion.div>
      </div>

      {/* Risk Flags */}
      {score.risk_flags && score.risk_flags.length > 0 && (
        <GlassCard className="border-danger/30 bg-danger/5">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-danger" />
            Risk Flags
          </h3>
          <div className="space-y-3">
            {score.risk_flags.map((flag, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-danger/10 p-3">
                <AlertTriangle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-danger">{flag}</p>
                  {score.risk_explanations && score.risk_explanations[i] && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {score.risk_explanations[i]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
