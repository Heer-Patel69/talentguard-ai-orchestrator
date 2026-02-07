import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DollarSign, AlertTriangle, CheckCircle2, Info, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSalaryValidation } from "@/hooks/useSalaryValidation";

interface SalaryInputProps {
  minValue: string;
  maxValue: string;
  currency: "INR" | "USD";
  experienceLevel: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  onCurrencyChange: (value: "INR" | "USD") => void;
  className?: string;
}

export function SalaryInput({
  minValue,
  maxValue,
  currency,
  experienceLevel,
  onMinChange,
  onMaxChange,
  onCurrencyChange,
  className,
}: SalaryInputProps) {
  const validation = useSalaryValidation(minValue, maxValue, currency, experienceLevel);

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    
    if (currency === "INR") {
      // Indian number format (lakhs)
      if (num >= 100000) {
        return `₹${(num / 100000).toFixed(1)}L`;
      }
      return `₹${num.toLocaleString("en-IN")}`;
    } else {
      // USD format
      if (num >= 1000) {
        return `$${(num / 1000).toFixed(0)}K`;
      }
      return `$${num.toLocaleString("en-US")}`;
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          Salary Range (Annual)
        </Label>
        <Select value={currency} onValueChange={(v) => onCurrencyChange(v as "INR" | "USD")}>
          <SelectTrigger className="w-20 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INR">INR</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {currency === "INR" ? "₹" : "$"}
            </span>
            <Input
              type="number"
              placeholder="Min"
              value={minValue}
              onChange={(e) => onMinChange(e.target.value)}
              className={cn(
                "pl-7",
                !validation.isValid && "border-danger focus-visible:ring-danger"
              )}
            />
          </div>
          {minValue && (
            <span className="text-xs text-muted-foreground">
              {formatCurrency(minValue)}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {currency === "INR" ? "₹" : "$"}
            </span>
            <Input
              type="number"
              placeholder="Max"
              value={maxValue}
              onChange={(e) => onMaxChange(e.target.value)}
              className={cn(
                "pl-7",
                !validation.isValid && "border-danger focus-visible:ring-danger"
              )}
            />
          </div>
          {maxValue && (
            <span className="text-xs text-muted-foreground">
              {formatCurrency(maxValue)}
            </span>
          )}
        </div>
      </div>

      {/* Validation Messages */}
      {validation.error && (
        <div className="flex items-center gap-2 text-sm text-danger">
          <AlertTriangle className="h-4 w-4" />
          {validation.error}
        </div>
      )}

      {validation.warning && (
        <div className="flex items-center gap-2 text-sm text-warning">
          <AlertTriangle className="h-4 w-4" />
          {validation.warning}
        </div>
      )}

      {/* Suggestions */}
      {validation.suggestions.length > 0 && !validation.error && (
        <div className="space-y-1">
          {validation.suggestions.map((suggestion, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 text-xs text-muted-foreground"
            >
              <TrendingUp className="h-3 w-3 mt-0.5 text-info" />
              {suggestion}
            </div>
          ))}
        </div>
      )}

      {/* Valid indicator */}
      {validation.isValid && !validation.warning && minValue && maxValue && (
        <div className="flex items-center gap-2 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" />
          Salary range looks good
        </div>
      )}
    </div>
  );
}
