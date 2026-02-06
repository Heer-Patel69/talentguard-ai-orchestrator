import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Eye, Shield, ShieldAlert, ShieldCheck } from "lucide-react";

interface CandidateRisk {
  id: string;
  name: string;
  riskScore: number; // 0-100, higher = more risky
  riskLevel: "low" | "medium" | "high" | "critical";
  fraudFlags: string[];
  jobTitle: string;
}

interface RiskHeatmapProps {
  candidates: CandidateRisk[];
  onViewCandidate?: (id: string) => void;
  className?: string;
}

export function RiskHeatmap({ candidates, onViewCandidate, className }: RiskHeatmapProps) {
  const [filterLevel, setFilterLevel] = useState<string>("all");

  const filteredCandidates = useMemo(() => {
    if (filterLevel === "all") return candidates;
    return candidates.filter((c) => c.riskLevel === filterLevel);
  }, [candidates, filterLevel]);

  const riskCounts = useMemo(() => {
    return {
      low: candidates.filter((c) => c.riskLevel === "low").length,
      medium: candidates.filter((c) => c.riskLevel === "medium").length,
      high: candidates.filter((c) => c.riskLevel === "high").length,
      critical: candidates.filter((c) => c.riskLevel === "critical").length,
    };
  }, [candidates]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low": return "bg-success";
      case "medium": return "bg-warning";
      case "high": return "bg-danger";
      case "critical": return "bg-danger";
      default: return "bg-muted";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "low": return ShieldCheck;
      case "medium": return Shield;
      case "high": return ShieldAlert;
      case "critical": return AlertTriangle;
      default: return Shield;
    }
  };

  // Create heatmap grid (5 rows x 10 cols = 50 max visible)
  const gridSize = 50;
  const gridCandidates = filteredCandidates.slice(0, gridSize);

  return (
    <div className={cn("rounded-xl border border-border bg-card p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Fraud Risk Heatmap</h3>
          <p className="text-sm text-muted-foreground">
            {candidates.length} candidates • Click cell to view details
          </p>
        </div>
        <Select value={filterLevel} onValueChange={setFilterLevel}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Filter by risk" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="low">Low Risk</SelectItem>
            <SelectItem value="medium">Medium Risk</SelectItem>
            <SelectItem value="high">High Risk</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Risk Summary */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { level: "low", label: "Low", icon: ShieldCheck, color: "text-success", bg: "bg-success/10" },
          { level: "medium", label: "Medium", icon: Shield, color: "text-warning", bg: "bg-warning/10" },
          { level: "high", label: "High", icon: ShieldAlert, color: "text-danger", bg: "bg-danger/10" },
          { level: "critical", label: "Critical", icon: AlertTriangle, color: "text-danger", bg: "bg-danger/20" },
        ].map((item) => (
          <motion.button
            key={item.level}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilterLevel(item.level)}
            className={cn(
              "p-3 rounded-lg transition-all",
              item.bg,
              filterLevel === item.level && "ring-2 ring-primary"
            )}
          >
            <item.icon className={cn("h-5 w-5 mb-1", item.color)} />
            <p className="text-xl font-bold">{riskCounts[item.level as keyof typeof riskCounts]}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </motion.button>
        ))}
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-10 gap-1 mb-4">
        {gridCandidates.map((candidate, index) => {
          const RiskIcon = getRiskIcon(candidate.riskLevel);
          
          return (
            <motion.button
              key={candidate.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
              whileHover={{ scale: 1.1, zIndex: 10 }}
              onClick={() => onViewCandidate?.(candidate.id)}
              className={cn(
                "relative h-10 rounded-md transition-all group",
                getRiskColor(candidate.riskLevel),
                candidate.riskLevel === "critical" && "animate-pulse"
              )}
              title={`${candidate.name} - ${candidate.riskScore}% risk`}
            >
              {candidate.riskLevel === "critical" && (
                <RiskIcon className="absolute inset-0 m-auto h-4 w-4 text-white" />
              )}
              
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 rounded-lg bg-popover border border-border shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 whitespace-nowrap">
                <p className="text-xs font-medium">{candidate.name}</p>
                <p className="text-xs text-muted-foreground">Risk: {candidate.riskScore}%</p>
              </div>
            </motion.button>
          );
        })}
        
        {/* Empty cells for remaining grid */}
        {Array.from({ length: Math.max(0, gridSize - gridCandidates.length) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="h-10 rounded-md bg-secondary/30"
          />
        ))}
      </div>

      {filteredCandidates.length > gridSize && (
        <p className="text-xs text-center text-muted-foreground mb-4">
          Showing {gridSize} of {filteredCandidates.length} candidates
        </p>
      )}

      {/* High Risk Candidates List */}
      {candidates.filter((c) => c.riskLevel === "high" || c.riskLevel === "critical").length > 0 && (
        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-danger" />
            High Risk Candidates Requiring Attention
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {candidates
              .filter((c) => c.riskLevel === "high" || c.riskLevel === "critical")
              .slice(0, 5)
              .map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-danger/5 border border-danger/20"
                >
                  <div>
                    <p className="font-medium">{candidate.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {candidate.fraudFlags.slice(0, 2).map((flag, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-danger/10 text-danger">
                          {flag}
                        </Badge>
                      ))}
                      {candidate.fraudFlags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{candidate.fraudFlags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        candidate.riskLevel === "critical"
                          ? "bg-danger text-danger-foreground"
                          : "bg-danger/10 text-danger border-danger/30"
                      )}
                    >
                      {candidate.riskScore}%
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
          </div>
        </div>
      )}
    </div>
  );
}
