import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Trophy, Star, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  score: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  experienceYears: number;
  recommendation: "shortlist" | "maybe" | "reject";
  aiConfidence: number;
  strengths: string[];
  weaknesses: string[];
}

interface CandidateComparisonProps {
  candidates: CandidateProfile[];
  onRemoveCandidate?: (id: string) => void;
  className?: string;
}

const metrics = [
  { key: "score", label: "Overall Score", max: 100 },
  { key: "technicalScore", label: "Technical", max: 100 },
  { key: "communicationScore", label: "Communication", max: 100 },
  { key: "problemSolvingScore", label: "Problem Solving", max: 100 },
  { key: "aiConfidence", label: "AI Confidence", max: 100 },
  { key: "experienceYears", label: "Experience", max: 15, suffix: " yrs" },
];

export function CandidateComparison({
  candidates,
  onRemoveCandidate,
  className,
}: CandidateComparisonProps) {
  const maxValues = useMemo(() => {
    const result: Record<string, number> = {};
    metrics.forEach((metric) => {
      result[metric.key] = Math.max(
        ...candidates.map((c) => c[metric.key as keyof CandidateProfile] as number),
        1
      );
    });
    return result;
  }, [candidates]);

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case "shortlist": return "bg-success text-success-foreground";
      case "maybe": return "bg-warning text-warning-foreground";
      case "reject": return "bg-danger text-danger-foreground";
      default: return "bg-muted";
    }
  };

  const getComparisonIcon = (value: number, maxValue: number) => {
    const ratio = value / maxValue;
    if (ratio >= 0.95) return <Trophy className="h-4 w-4 text-warning" />;
    if (ratio >= 0.8) return <TrendingUp className="h-4 w-4 text-success" />;
    if (ratio <= 0.5) return <TrendingDown className="h-4 w-4 text-danger" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  if (candidates.length === 0) {
    return (
      <div className={cn("rounded-xl border border-dashed border-border bg-card p-8 text-center", className)}>
        <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Compare Candidates</h3>
        <p className="text-muted-foreground">
          Select 2-4 candidates to compare their profiles side by side
        </p>
      </div>
    );
  }

  // Radar chart points calculation
  const getRadarPoints = (candidate: CandidateProfile) => {
    const radarMetrics = [
      candidate.technicalScore / 100,
      candidate.communicationScore / 100,
      candidate.problemSolvingScore / 100,
      candidate.aiConfidence / 100,
    ];
    
    const centerX = 50;
    const centerY = 50;
    const radius = 40;
    
    return radarMetrics.map((value, index) => {
      const angle = (index * 2 * Math.PI) / radarMetrics.length - Math.PI / 2;
      return {
        x: centerX + radius * value * Math.cos(angle),
        y: centerY + radius * value * Math.sin(angle),
      };
    });
  };

  const radarColors = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--danger))"];

  return (
    <div className={cn("rounded-xl border border-border bg-card p-6", className)}>
      <h3 className="text-lg font-semibold mb-6">Candidate Comparison</h3>

      {/* Radar Chart */}
      <div className="flex justify-center mb-8">
        <div className="relative w-64 h-64">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Grid circles */}
            {[0.25, 0.5, 0.75, 1].map((r) => (
              <circle
                key={r}
                cx="50"
                cy="50"
                r={40 * r}
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-border"
              />
            ))}
            
            {/* Axes */}
            {[0, 1, 2, 3].map((i) => {
              const angle = (i * 2 * Math.PI) / 4 - Math.PI / 2;
              return (
                <line
                  key={i}
                  x1="50"
                  y1="50"
                  x2={50 + 40 * Math.cos(angle)}
                  y2={50 + 40 * Math.sin(angle)}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-border"
                />
              );
            })}

            {/* Candidate polygons */}
            {candidates.map((candidate, idx) => {
              const points = getRadarPoints(candidate);
              const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
              
              return (
                <motion.path
                  key={candidate.id}
                  d={pathD}
                  fill={radarColors[idx % radarColors.length]}
                  fillOpacity={0.2}
                  stroke={radarColors[idx % radarColors.length]}
                  strokeWidth="1.5"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.2 }}
                />
              );
            })}
          </svg>

          {/* Axis Labels */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-xs text-muted-foreground">
            Technical
          </div>
          <div className="absolute right-0 top-1/2 translate-x-2 -translate-y-1/2 text-xs text-muted-foreground">
            Communication
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 text-xs text-muted-foreground">
            Problem Solving
          </div>
          <div className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 text-xs text-muted-foreground">
            AI Confidence
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mb-6">
        {candidates.map((candidate, idx) => (
          <div key={candidate.id} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: radarColors[idx % radarColors.length] }}
            />
            <span className="text-sm">{candidate.name}</span>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 font-medium">Metric</th>
              {candidates.map((c) => (
                <th key={c.id} className="text-center py-3 px-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-medium truncate max-w-[100px]">{c.name}</span>
                    {onRemoveCandidate && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => onRemoveCandidate(c.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Recommendation Row */}
            <tr className="border-b border-border">
              <td className="py-3 px-2 font-medium">Recommendation</td>
              {candidates.map((c) => (
                <td key={c.id} className="text-center py-3 px-2">
                  <Badge className={getRecommendationColor(c.recommendation)}>
                    {c.recommendation}
                  </Badge>
                </td>
              ))}
            </tr>

            {/* Metric Rows */}
            {metrics.map((metric) => (
              <tr key={metric.key} className="border-b border-border">
                <td className="py-3 px-2 font-medium">{metric.label}</td>
                {candidates.map((c) => {
                  const value = c[metric.key as keyof CandidateProfile] as number;
                  const isMax = value === maxValues[metric.key];
                  
                  return (
                    <td key={c.id} className="text-center py-3 px-2">
                      <div className="flex items-center justify-center gap-1">
                        {isMax && getComparisonIcon(value, maxValues[metric.key])}
                        <span className={cn(isMax && "font-bold text-primary")}>
                          {value}{metric.suffix || ""}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Strengths Row */}
            <tr className="border-b border-border">
              <td className="py-3 px-2 font-medium align-top">Strengths</td>
              {candidates.map((c) => (
                <td key={c.id} className="py-3 px-2">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {c.strengths.slice(0, 3).map((s, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-success/10 text-success">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* Weaknesses Row */}
            <tr>
              <td className="py-3 px-2 font-medium align-top">Weaknesses</td>
              {candidates.map((c) => (
                <td key={c.id} className="py-3 px-2">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {c.weaknesses.slice(0, 3).map((w, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-danger/10 text-danger">
                        {w}
                      </Badge>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
