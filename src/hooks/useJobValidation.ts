import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ValidationSuggestion {
  type: "spelling" | "grammar" | "content" | "seo" | "format" | "warning";
  message: string;
  position?: { start: number; end: number };
  suggestion?: string;
  severity: "low" | "medium" | "high";
}

export interface ValidationResult {
  isValid: boolean;
  score: number;
  suggestions: ValidationSuggestion[];
  duplicateWarning?: {
    isDuplicate: boolean;
    similarTitle?: string;
    similarity?: number;
  };
  seoScore?: number;
  readabilityScore?: number;
  isValidating?: boolean;
}

interface UseJobValidationOptions {
  debounceMs?: number;
  existingJobs?: string[];
  jobField?: string;
  experienceLevel?: string;
}

export function useJobValidation(options: UseJobValidationOptions = {}) {
  const { debounceMs = 800, existingJobs = [], jobField, experienceLevel } = options;
  const { toast } = useToast();
  
  const [validations, setValidations] = useState<Record<string, ValidationResult>>({
    title: { isValid: true, score: 0, suggestions: [] },
    description: { isValid: true, score: 0, suggestions: [] },
  });
  
  const [isValidating, setIsValidating] = useState<Record<string, boolean>>({});
  const [overallScore, setOverallScore] = useState(0);
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const abortControllers = useRef<Record<string, AbortController>>({});

  // Calculate overall completeness score
  useEffect(() => {
    const scores = Object.values(validations).map((v) => v.score);
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    setOverallScore(Math.round(avg));
  }, [validations]);

  const validateField = useCallback(
    async (field: "title" | "description" | "skills" | "full", content: string) => {
      // Skip if content is too short
      if (content.trim().length < 3) {
        setValidations((prev) => ({
          ...prev,
          [field]: {
            isValid: false,
            score: 0,
            suggestions: [
              {
                type: "content",
                message: "Content is too short",
                severity: "high",
              },
            ],
          },
        }));
        return;
      }

      // Cancel previous request for this field
      if (abortControllers.current[field]) {
        abortControllers.current[field].abort();
      }

      // Create new abort controller
      abortControllers.current[field] = new AbortController();

      setIsValidating((prev) => ({ ...prev, [field]: true }));

      try {
        const { data, error } = await supabase.functions.invoke("validate-job-content", {
          body: {
            field,
            content,
            context: {
              jobField,
              experienceLevel,
              existingJobs,
            },
          },
        });

        if (error) throw error;

        setValidations((prev) => ({
          ...prev,
          [field]: {
            ...data,
            isValidating: false,
          },
        }));

        // Show high-severity suggestions as toast
        const highSeverity = data.suggestions?.filter(
          (s: ValidationSuggestion) => s.severity === "high"
        );
        if (highSeverity?.length > 0) {
          toast({
            title: "Validation Issue",
            description: highSeverity[0].message,
            variant: "destructive",
          });
        }
      } catch (error) {
        // Ignore abort errors
        if (error instanceof Error && error.name === "AbortError") return;

        console.error("Validation error:", error);
        setValidations((prev) => ({
          ...prev,
          [field]: {
            isValid: true,
            score: 50,
            suggestions: [],
            isValidating: false,
          },
        }));
      } finally {
        setIsValidating((prev) => ({ ...prev, [field]: false }));
      }
    },
    [jobField, experienceLevel, existingJobs, toast]
  );

  const debouncedValidate = useCallback(
    (field: "title" | "description" | "skills" | "full", content: string) => {
      // Clear existing timer for this field
      if (debounceTimers.current[field]) {
        clearTimeout(debounceTimers.current[field]);
      }

      // Set validating state immediately for UI feedback
      setIsValidating((prev) => ({ ...prev, [field]: true }));

      // Set new debounced timer
      debounceTimers.current[field] = setTimeout(() => {
        validateField(field, content);
      }, debounceMs);
    },
    [validateField, debounceMs]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(clearTimeout);
      Object.values(abortControllers.current).forEach((c) => c.abort());
    };
  }, []);

  const getFieldStatus = useCallback(
    (field: string) => {
      const validation = validations[field];
      const validating = isValidating[field];

      if (validating) return "validating";
      if (!validation || validation.score === 0) return "empty";
      if (validation.score >= 80) return "excellent";
      if (validation.score >= 60) return "good";
      if (validation.score >= 40) return "fair";
      return "poor";
    },
    [validations, isValidating]
  );

  const getSuggestions = useCallback(
    (field: string): ValidationSuggestion[] => {
      return validations[field]?.suggestions || [];
    },
    [validations]
  );

  const hasErrors = useCallback(
    (field: string): boolean => {
      const suggestions = validations[field]?.suggestions || [];
      return suggestions.some((s) => s.severity === "high");
    },
    [validations]
  );

  const hasWarnings = useCallback(
    (field: string): boolean => {
      const suggestions = validations[field]?.suggestions || [];
      return suggestions.some((s) => s.severity === "medium");
    },
    [validations]
  );

  const validateAll = useCallback(
    async (data: { title: string; description: string }) => {
      await Promise.all([
        validateField("title", data.title),
        validateField("description", data.description),
      ]);

      // Check for any high-severity errors
      const allSuggestions = Object.values(validations).flatMap((v) => v.suggestions);
      const hasBlockingErrors = allSuggestions.some((s) => s.severity === "high");

      return !hasBlockingErrors;
    },
    [validateField, validations]
  );

  return {
    validations,
    isValidating,
    overallScore,
    validateField: debouncedValidate,
    validateImmediate: validateField,
    validateAll,
    getFieldStatus,
    getSuggestions,
    hasErrors,
    hasWarnings,
  };
}
