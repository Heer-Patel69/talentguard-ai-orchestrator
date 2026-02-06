import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  Shuffle,
  CheckCircle2,
  Users,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface RolePattern {
  id: string;
  sourceRole: string;
  targetRole: string;
  transferableSkills: string[];
  successRate: number;
  sampleSize: number;
  confidenceLevel: number;
}

interface AlternativeRoleSuggestion {
  id: string;
  candidateName: string;
  candidateId: string;
  originalRole: string;
  suggestedRole: string;
  matchScore: number;
  matchingSkills: string[];
  reason: string;
}

interface CrossRolePatternsProps {
  patterns: RolePattern[];
  suggestions?: AlternativeRoleSuggestion[];
  onViewCandidate?: (candidateId: string) => void;
  onSuggestRole?: (candidateId: string, role: string) => void;
  className?: string;
}

export function CrossRolePatterns({
  patterns,
  suggestions = [],
  onViewCandidate,
  onSuggestRole,
  className,
}: CrossRolePatternsProps) {
  const topPatterns = useMemo(() => {
    return [...patterns]
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 6);
  }, [patterns]);

  const getConfidenceColor = (level: number) => {
    if (level >= 80) return "text-success";
    if (level >= 60) return "text-warning";
    return "text-muted-foreground";
  };

  return (
    <div className={cn("rounded-xl border border-border bg-card", className)}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shuffle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Cross-Role Pattern Recognition</h3>
            <p className="text-sm text-muted-foreground">
              Transferable skills and role transition success rates
            </p>
          </div>
        </div>
      </div>

      {/* Pattern Grid */}
      <div className="p-6">
        <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Top Role Transitions
        </h4>

        <div className="grid gap-4 md:grid-cols-2">
          {topPatterns.map((pattern, index) => (
            <motion.div
              key={pattern.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/40 transition-colors"
            >
              {/* Role Transition */}
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="font-medium">
                  {pattern.sourceRole}
                </Badge>
                <ArrowRight className="h-4 w-4 text-primary" />
                <Badge className="bg-primary text-primary-foreground font-medium">
                  {pattern.targetRole}
                </Badge>
              </div>

              {/* Success Rate */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span className="font-bold text-success">{pattern.successRate}%</span>
                </div>
                <Progress value={pattern.successRate} className="h-2" />
              </div>

              {/* Skills */}
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">Transferable Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {pattern.transferableSkills.slice(0, 4).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {pattern.transferableSkills.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{pattern.transferableSkills.length - 4}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {pattern.sampleSize} transitions
                </span>
                <span className={cn("flex items-center gap-1", getConfidenceColor(pattern.confidenceLevel))}>
                  <CheckCircle2 className="h-3 w-3" />
                  {pattern.confidenceLevel}% confidence
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Alternative Role Suggestions */}
      {suggestions.length > 0 && (
        <div className="p-6 pt-0">
          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-warning" />
            AI-Suggested Role Matches
          </h4>

          <div className="space-y-3">
            {suggestions.slice(0, 5).map((suggestion) => (
              <div
                key={suggestion.id}
                className="p-4 rounded-lg bg-warning/5 border border-warning/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{suggestion.candidateName}</span>
                      <Badge variant="outline" className="text-xs">
                        Applied: {suggestion.originalRole}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-muted-foreground">Better fit for:</span>
                      <Badge className="bg-success text-success-foreground">
                        {suggestion.suggestedRole}
                      </Badge>
                      <span className="text-sm font-bold text-success">
                        {suggestion.matchScore}% match
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">{suggestion.reason}</p>

                    <div className="flex flex-wrap gap-1">
                      {suggestion.matchingSkills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewCandidate?.(suggestion.candidateId)}
                    >
                      View Profile
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onSuggestRole?.(suggestion.candidateId, suggestion.suggestedRole)}
                    >
                      Suggest Role
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
