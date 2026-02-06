import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CandidateDecision {
  id: string;
  name: string;
  currentDecision: "shortlist" | "maybe" | "reject";
  aiConfidence: number;
  aiReason: string;
  score: number;
}

interface OverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: CandidateDecision | null;
  onOverride: (data: {
    candidateId: string;
    newDecision: string;
    reason: string;
  }) => Promise<void>;
}

const decisions = [
  {
    value: "shortlist",
    label: "Shortlist",
    description: "Move forward to next stage",
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
  },
  {
    value: "hold",
    label: "Hold",
    description: "Keep on hold for review",
    icon: Clock,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
  },
  {
    value: "reject",
    label: "Reject",
    description: "Remove from consideration",
    icon: XCircle,
    color: "text-danger",
    bg: "bg-danger/10",
    border: "border-danger/30",
  },
];

export function OverrideDialog({
  open,
  onOpenChange,
  candidate,
  onOverride,
}: OverrideDialogProps) {
  const [newDecision, setNewDecision] = useState<string>("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!candidate || !newDecision || !reason.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a decision and provide a reason.",
        variant: "destructive",
      });
      return;
    }

    if (reason.trim().length < 20) {
      toast({
        title: "Reason too short",
        description: "Please provide a more detailed reason (at least 20 characters).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onOverride({
        candidateId: candidate.id,
        newDecision,
        reason: reason.trim(),
      });
      toast({
        title: "Decision overridden",
        description: "The override has been logged for audit purposes.",
      });
      onOpenChange(false);
      setNewDecision("");
      setReason("");
    } catch (error) {
      toast({
        title: "Failed to override",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case "shortlist":
        return <Badge className="bg-success text-success-foreground">Shortlist</Badge>;
      case "maybe":
        return <Badge className="bg-warning text-warning-foreground">Maybe</Badge>;
      case "reject":
        return <Badge className="bg-danger text-danger-foreground">Reject</Badge>;
      default:
        return <Badge variant="secondary">{decision}</Badge>;
    }
  };

  if (!candidate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-warning" />
            Override AI Decision
          </DialogTitle>
          <DialogDescription>
            Override the AI recommendation for this candidate. Your decision will be logged for audit purposes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Candidate Info */}
          <div className="p-4 rounded-lg bg-secondary/50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{candidate.name}</h4>
              <Badge variant="outline">Score: {candidate.score}/100</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">AI Decision:</span>
                {getDecisionBadge(candidate.currentDecision)}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Confidence:</span>
                <span className="font-medium">{candidate.aiConfidence}%</span>
              </div>
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-primary mb-1">AI Reasoning</p>
                <p className="text-sm text-muted-foreground">{candidate.aiReason}</p>
              </div>
            </div>
          </div>

          {/* New Decision Selection */}
          <div>
            <Label className="text-base">New Decision</Label>
            <RadioGroup
              value={newDecision}
              onValueChange={setNewDecision}
              className="grid grid-cols-3 gap-3 mt-3"
            >
              {decisions.map((decision) => (
                <Label
                  key={decision.value}
                  className={cn(
                    "flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all",
                    newDecision === decision.value
                      ? cn(decision.border, decision.bg, "ring-2 ring-offset-2 ring-primary")
                      : "border-border hover:bg-secondary"
                  )}
                >
                  <RadioGroupItem value={decision.value} className="sr-only" />
                  <decision.icon className={cn("h-6 w-6 mb-2", decision.color)} />
                  <span className="font-medium">{decision.label}</span>
                  <span className="text-xs text-muted-foreground text-center mt-1">
                    {decision.description}
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Reason Input */}
          <div>
            <Label htmlFor="reason" className="text-base">
              Reason for Override <span className="text-danger">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Provide a detailed reason for overriding the AI decision. This will be logged for audit and used to improve the AI model."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2 min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {reason.length}/20 minimum characters • This will be logged for model retraining
            </p>
          </div>

          {/* Warning */}
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
              <p className="text-sm text-warning">
                Overrides are permanently logged and affect AI model training. Ensure your reasoning is accurate and documented.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!newDecision || reason.length < 20 || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Confirm Override"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
