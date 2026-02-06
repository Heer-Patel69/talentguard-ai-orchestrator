import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  CalendarIcon,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Brain,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface RecruiterFeedbackFormProps {
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  aiRecommendation: "shortlist" | "reject" | "hold";
  aiConfidence: number;
  onSubmit?: (feedback: FeedbackData) => void;
  className?: string;
}

interface FeedbackData {
  recommendationAccuracy: "correct" | "incorrect" | "partially_correct";
  actualDecision: string;
  performanceRating?: number;
  performanceNotes?: string;
  probationEndDate?: Date;
}

export function RecruiterFeedbackForm({
  applicationId,
  candidateName,
  jobTitle,
  aiRecommendation,
  aiConfidence,
  onSubmit,
  className,
}: RecruiterFeedbackFormProps) {
  const [accuracy, setAccuracy] = useState<"correct" | "incorrect" | "partially_correct" | null>(null);
  const [actualDecision, setActualDecision] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [probationDate, setProbationDate] = useState<Date | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!accuracy) {
      toast({
        title: "Missing feedback",
        description: "Please indicate if the AI recommendation was correct",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const feedbackData: FeedbackData = {
        recommendationAccuracy: accuracy,
        actualDecision: actualDecision || aiRecommendation,
        performanceRating: rating > 0 ? rating : undefined,
        performanceNotes: notes || undefined,
        probationEndDate: probationDate,
      };

      await onSubmit?.(feedbackData);
      
      toast({
        title: "Feedback submitted",
        description: "Thank you! Your feedback helps improve our AI models.",
      });
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRecommendationBadge = () => {
    switch (aiRecommendation) {
      case "shortlist":
        return <Badge className="bg-success text-success-foreground">Shortlist</Badge>;
      case "reject":
        return <Badge className="bg-danger text-danger-foreground">Reject</Badge>;
      case "hold":
        return <Badge className="bg-warning text-warning-foreground">Hold</Badge>;
    }
  };

  return (
    <GlassCard className={cn("max-w-2xl", className)}>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">AI Recommendation Feedback</h2>
            <p className="text-sm text-muted-foreground">Help us improve by rating the AI's performance</p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Candidate</span>
            <span className="font-medium">{candidateName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Position</span>
            <span className="font-medium">{jobTitle}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">AI Recommendation</span>
            <div className="flex items-center gap-2">
              {getRecommendationBadge()}
              <span className="text-xs text-muted-foreground">({aiConfidence}% confidence)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Accuracy Selection */}
      <div className="mb-6">
        <Label className="text-sm font-medium mb-3 block">
          Was the AI recommendation correct?
        </Label>
        <div className="grid grid-cols-3 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setAccuracy("correct")}
            className={cn(
              "p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
              accuracy === "correct"
                ? "border-success bg-success/10"
                : "border-border hover:border-success/50"
            )}
          >
            <CheckCircle2 className={cn("h-8 w-8", accuracy === "correct" ? "text-success" : "text-muted-foreground")} />
            <span className="text-sm font-medium">Yes, Correct</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setAccuracy("partially_correct")}
            className={cn(
              "p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
              accuracy === "partially_correct"
                ? "border-warning bg-warning/10"
                : "border-border hover:border-warning/50"
            )}
          >
            <AlertCircle className={cn("h-8 w-8", accuracy === "partially_correct" ? "text-warning" : "text-muted-foreground")} />
            <span className="text-sm font-medium">Partially</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setAccuracy("incorrect")}
            className={cn(
              "p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
              accuracy === "incorrect"
                ? "border-danger bg-danger/10"
                : "border-border hover:border-danger/50"
            )}
          >
            <XCircle className={cn("h-8 w-8", accuracy === "incorrect" ? "text-danger" : "text-muted-foreground")} />
            <span className="text-sm font-medium">No, Incorrect</span>
          </motion.button>
        </div>
      </div>

      {/* Actual Decision (if different) */}
      {accuracy && accuracy !== "correct" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-6"
        >
          <Label className="text-sm font-medium mb-3 block">What was your actual decision?</Label>
          <div className="flex gap-3">
            {["shortlist", "reject", "hold"].map((decision) => (
              <Button
                key={decision}
                variant={actualDecision === decision ? "default" : "outline"}
                className="capitalize"
                onClick={() => setActualDecision(decision)}
              >
                {decision}
              </Button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Performance Rating (after probation) */}
      <div className="mb-6">
        <Label className="text-sm font-medium mb-3 block">
          Candidate Performance (after probation)
          <span className="text-muted-foreground font-normal ml-2">Optional</span>
        </Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="p-1"
            >
              <Star
                className={cn(
                  "h-8 w-8 transition-colors",
                  (hoverRating || rating) >= star
                    ? "text-warning fill-warning"
                    : "text-muted-foreground"
                )}
              />
            </motion.button>
          ))}
          {rating > 0 && (
            <span className="ml-3 text-sm text-muted-foreground">
              {rating === 1 && "Poor"}
              {rating === 2 && "Below Average"}
              {rating === 3 && "Average"}
              {rating === 4 && "Good"}
              {rating === 5 && "Excellent"}
            </span>
          )}
        </div>
      </div>

      {/* Probation End Date */}
      <div className="mb-6">
        <Label className="text-sm font-medium mb-3 block">
          Probation End Date
          <span className="text-muted-foreground font-normal ml-2">Optional</span>
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !probationDate && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {probationDate ? format(probationDate, "PPP") : "Select probation end date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={probationDate}
              onSelect={setProbationDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Performance Notes */}
      <div className="mb-6">
        <Label className="text-sm font-medium mb-3 block">
          Additional Notes
          <span className="text-muted-foreground font-normal ml-2">Optional</span>
        </Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any specific observations about the candidate's performance..."
          className="min-h-[100px]"
        />
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!accuracy || isSubmitting}
        className="w-full"
        variant="hero"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting Feedback...
          </>
        ) : (
          <>
            <ThumbsUp className="mr-2 h-4 w-4" />
            Submit Feedback
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground mt-4">
        Your feedback is anonymized and used to improve AI accuracy
      </p>
    </GlassCard>
  );
}
