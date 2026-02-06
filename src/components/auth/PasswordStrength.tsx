import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = useMemo(() => {
    let score = 0;
    if (!password) return { score: 0, label: "", color: "" };

    // Length checks
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Character type checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score, label: "Weak", color: "bg-danger" };
    if (score <= 4) return { score, label: "Medium", color: "bg-warning" };
    return { score, label: "Strong", color: "bg-success" };
  }, [password]);

  if (!password) return null;

  const percentage = (strength.score / 6) * 100;

  return (
    <div className="space-y-2">
      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={cn("h-full transition-all duration-300", strength.color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Password strength</span>
        <span className={cn(
          strength.score <= 2 && "text-danger",
          strength.score > 2 && strength.score <= 4 && "text-warning",
          strength.score > 4 && "text-success"
        )}>
          {strength.label}
        </span>
      </div>
    </div>
  );
}
