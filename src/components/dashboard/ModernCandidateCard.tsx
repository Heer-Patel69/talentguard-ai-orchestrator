import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Github,
  Linkedin,
  Mail,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Eye,
  MoreVertical,
  Star,
  CheckCircle2,
  AlertTriangle,
  User,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CandidateCardProps {
  id: string;
  name: string;
  email: string;
  job: string;
  stage: string;
  status: string;
  score: number;
  profileScore: number;
  verificationStatus: string;
  githubUrl: string | null;
  linkedinUrl: string | null;
  onStatusChange?: (id: string, status: string) => void;
  delay?: number;
  // New props for test tracking
  testsCompleted?: number;
  testsPassed?: number;
  currentRound?: number;
  totalRounds?: number;
  hasProfile?: boolean;
  fraudFlags?: number;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  applied: { label: "Applied", color: "bg-info/10 text-info border-info/30" },
  screening: { label: "Screening", color: "bg-primary/10 text-primary border-primary/30" },
  interviewing: { label: "Interviewing", color: "bg-warning/10 text-warning border-warning/30" },
  shortlisted: { label: "Shortlisted", color: "bg-success/10 text-success border-success/30" },
  rejected: { label: "Rejected", color: "bg-danger/10 text-danger border-danger/30" },
  hired: { label: "Hired", color: "bg-success/10 text-success border-success/30" },
};

export function ModernCandidateCard({
  id,
  name,
  email,
  job,
  stage,
  status,
  score,
  profileScore,
  verificationStatus,
  githubUrl,
  linkedinUrl,
  onStatusChange,
  delay = 0,
  testsCompleted = 0,
  testsPassed = 0,
  currentRound = 0,
  totalRounds = 5,
  hasProfile = true,
  fraudFlags = 0,
}: CandidateCardProps) {
  const statusInfo = statusConfig[status] || statusConfig.applied;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase() || "??";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ y: -2 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-5",
        "hover:border-primary/30 hover:shadow-[0_0_30px_-10px_hsl(var(--primary)/0.2)] transition-all duration-300"
      )}
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          {/* Avatar & Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-lg font-bold text-primary-foreground shadow-lg">
                {initials}
              </div>
              {verificationStatus === "verified" && (
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-success text-success-foreground">
                  <ShieldCheck className="h-3 w-3" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{name}</h3>
                {profileScore > 0 && (
                  <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20">
                    <Star className="h-3 w-3 mr-1 text-primary" />
                    {profileScore}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{job}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{email}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/candidates/${id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Report
                </Link>
              </DropdownMenuItem>
              {onStatusChange && (
                <>
                  <DropdownMenuItem onClick={() => onStatusChange(id, "shortlisted")}>
                    Shortlist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(id, "rejected")}>
                    Reject
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status & Stage */}
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <Badge variant="outline" className={cn("text-xs", statusInfo.color)}>
            {statusInfo.label}
          </Badge>
          <span className="text-xs text-muted-foreground">{stage}</span>
          {!hasProfile && (
            <Badge variant="outline" className="text-xs gap-1 text-warning border-warning/30">
              <User className="h-3 w-3" />
              Incomplete Profile
            </Badge>
          )}
          {fraudFlags > 0 && (
            <Badge variant="outline" className="text-xs gap-1 text-danger border-danger/30">
              <ShieldAlert className="h-3 w-3" />
              {fraudFlags} Flag{fraudFlags > 1 ? 's' : ''}
            </Badge>
          )}
          {score > 0 && (
            <Badge variant="secondary" className="text-xs ml-auto">
              Score: {score}%
            </Badge>
          )}
        </div>

        {/* Test Progress */}
        {totalRounds > 0 && (
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Assessment Progress
              </span>
              <span className="font-medium">
                {testsPassed}/{totalRounds} passed
              </span>
            </div>
            <Progress 
              value={(testsPassed / totalRounds) * 100} 
              className="h-1.5" 
            />
          </div>
        )}

        {/* Social Links */}
        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border/50">
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-3.5 w-3.5" />
              GitHub
            </a>
          )}
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Linkedin className="h-3.5 w-3.5" />
              LinkedIn
            </a>
          )}
          <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs" asChild>
            <Link to={`/dashboard/candidates/${id}`}>
              View Details
              <Eye className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
