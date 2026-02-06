import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Users,
  FileText,
  Search,
  Inbox,
  Calendar,
  MessageSquare,
  BarChart3,
  LucideIcon,
} from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "jobs" | "candidates" | "applications" | "search" | "messages" | "analytics" | "default";
  className?: string;
}

const variantConfig = {
  jobs: { icon: Briefcase, color: "text-primary" },
  candidates: { icon: Users, color: "text-success" },
  applications: { icon: FileText, color: "text-warning" },
  search: { icon: Search, color: "text-muted-foreground" },
  messages: { icon: MessageSquare, color: "text-primary" },
  analytics: { icon: BarChart3, color: "text-primary" },
  default: { icon: Inbox, color: "text-muted-foreground" },
};

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = "default",
  className,
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = icon || config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      {/* Animated illustration */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="relative mb-6"
      >
        {/* Background circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="h-32 w-32 rounded-full bg-secondary/50"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            className="h-24 w-24 rounded-full bg-secondary/30"
          />
        </div>
        
        {/* Icon */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
          <Icon className={cn("h-10 w-10", config.color)} />
        </div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-semibold mb-2"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground max-w-md mb-6"
      >
        {description}
      </motion.p>

      {actionLabel && onAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button onClick={onAction} variant="hero">
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

// Specific empty states
export function NoJobsFound({ onCreateJob }: { onCreateJob?: () => void }) {
  return (
    <EmptyState
      variant="jobs"
      title="No jobs posted yet"
      description="Start by creating your first job posting to attract top talent with AI-powered interviews."
      actionLabel="Post a Job"
      onAction={onCreateJob}
    />
  );
}

export function NoCandidatesFound() {
  return (
    <EmptyState
      variant="candidates"
      title="No candidates found"
      description="Candidates will appear here once they apply to your job postings."
    />
  );
}

export function NoApplicationsFound({ onBrowseJobs }: { onBrowseJobs?: () => void }) {
  return (
    <EmptyState
      variant="applications"
      title="No applications yet"
      description="You haven't applied to any jobs yet. Browse available positions and start your journey."
      actionLabel="Browse Jobs"
      onAction={onBrowseJobs}
    />
  );
}

export function NoSearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      variant="search"
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try adjusting your search terms.`}
    />
  );
}
