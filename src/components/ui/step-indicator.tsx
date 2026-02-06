import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{
                scale: index === currentStep ? 1.1 : 1,
                backgroundColor:
                  index < currentStep
                    ? "hsl(var(--success))"
                    : index === currentStep
                    ? "hsl(var(--primary))"
                    : "hsl(var(--secondary))",
              }}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors",
                index <= currentStep ? "text-primary-foreground" : "text-muted-foreground"
              )}
            >
              {index < currentStep ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </motion.div>
            <span
              className={cn(
                "mt-2 text-xs font-medium",
                index === currentStep ? "text-primary" : "text-muted-foreground"
              )}
            >
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "mx-2 h-0.5 w-12 md:w-20",
                index < currentStep ? "bg-success" : "bg-secondary"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
