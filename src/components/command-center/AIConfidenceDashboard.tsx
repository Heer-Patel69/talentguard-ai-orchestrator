import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Eye, HelpCircle } from "lucide-react";

interface CandidateConfidence {
  id: string;
  name: string;
  confidence: number;
  recommendation: "shortlist" | "maybe" | "reject";
  jobTitle: string;
}

interface AIConfidenceDashboardProps {
  candidates: CandidateConfidence[];
  onViewCandidate?: (id: string) => void;
  className?: string;
}

export function AIConfidenceDashboard({
  candidates,
  onViewCandidate,
  className,
}: AIConfidenceDashboardProps) {
  const distribution = useMemo(() => {
    const buckets = [
      { range: "90-100%", min: 90, max: 100, count: 0, color: "bg-success" },
      { range: "80-89%", min: 80, max: 89, count: 0, color: "bg-success/70" },
      { range: "70-79%", min: 70, max: 79, count: 0, color: "bg-warning" },
      { range: "60-69%", min: 60, max: 69, count: 0, color: "bg-warning/70" },
      { range: "< 60%", min: 0, max: 59, count: 0, color: "bg-danger" },
    ];

    candidates.forEach((c) => {
      const bucket = buckets.find((b) => c.confidence >= b.min && c.confidence <= b.max);
      if (bucket) bucket.count++;
    });

    const maxCount = Math.max(...buckets.map((b) => b.count), 1);
    return buckets.map((b) => ({ ...b, percent: (b.count / maxCount) * 100 }));
  }, [candidates]);

  const lowConfidenceCandidates = useMemo(
    () => candidates.filter((c) => c.confidence < 70).sort((a, b) => a.confidence - b.confidence),
    [candidates]
  );

  const stats = useMemo(() => {
    if (candidates.length === 0) return { avg: 0, high: 0, low: 0, needsReview: 0 };
    const confidences = candidates.map((c) => c.confidence);
    return {
      avg: confidences.reduce((a, b) => a + b, 0) / candidates.length,
      high: candidates.filter((c) => c.confidence >= 80).length,
      low: candidates.filter((c) => c.confidence < 60).length,
      needsReview: candidates.filter((c) => c.recommendation === "maybe").length,
    };
  }, [candidates]);

  return (
    <div className={cn("rounded-xl border border-border bg-card p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">AI Confidence Distribution</h3>
          <p className="text-sm text-muted-foreground">
            {candidates.length} candidates analyzed
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{stats.avg.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Avg Confidence</p>
          </div>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="flex items-end gap-2 h-32 mb-4">
        {distribution.map((bucket, index) => (
          <motion.div
            key={bucket.range}
            initial={{ height: 0 }}
            animate={{ height: `${bucket.percent}%` }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="flex-1 flex flex-col items-center justify-end"
          >
            <div
              className={cn(
                "w-full rounded-t-lg transition-all hover:brightness-110 cursor-pointer min-h-[4px]",
                bucket.color
              )}
              style={{ height: `${Math.max(bucket.percent, 5)}%` }}
            />
          </motion.div>
        ))}
      </div>

      {/* X-axis labels */}
      <div className="flex gap-2 mb-6">
        {distribution.map((bucket) => (
          <div key={bucket.range} className="flex-1 text-center">
            <p className="text-xs font-medium">{bucket.count}</p>
            <p className="text-xs text-muted-foreground">{bucket.range}</p>
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-lg bg-secondary/50">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <div>
            <p className="text-lg font-bold">{stats.high}</p>
            <p className="text-xs text-muted-foreground">High Confidence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-warning" />
          <div>
            <p className="text-lg font-bold">{stats.needsReview}</p>
            <p className="text-xs text-muted-foreground">Needs Review</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-danger" />
          <div>
            <p className="text-lg font-bold">{stats.low}</p>
            <p className="text-xs text-muted-foreground">Low Confidence</p>
          </div>
        </div>
      </div>

      {/* Low Confidence Candidates */}
      {lowConfidenceCandidates.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Requires Manual Review ({lowConfidenceCandidates.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {lowConfidenceCandidates.slice(0, 5).map((candidate) => (
              <div
                key={candidate.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div>
                  <p className="font-medium">{candidate.name}</p>
                  <p className="text-xs text-muted-foreground">{candidate.jobTitle}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      candidate.confidence < 60
                        ? "bg-danger/10 text-danger border-danger/30"
                        : "bg-warning/10 text-warning border-warning/30"
                    )}
                  >
                    {candidate.confidence}%
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onViewCandidate?.(candidate.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {lowConfidenceCandidates.length > 5 && (
              <p className="text-xs text-center text-muted-foreground py-2">
                +{lowConfidenceCandidates.length - 5} more candidates
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
