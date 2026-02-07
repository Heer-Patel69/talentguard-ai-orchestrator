import { useMemo } from "react";

interface SalaryRange {
  min: number;
  max: number;
}

interface SalaryValidationResult {
  isValid: boolean;
  error: string | null;
  warning: string | null;
  suggestions: string[];
}

// Market salary ranges by experience level and currency (annual)
const marketRanges: Record<string, Record<string, SalaryRange>> = {
  INR: {
    fresher: { min: 300000, max: 800000 },
    junior: { min: 600000, max: 1200000 },
    mid: { min: 1000000, max: 2500000 },
    senior: { min: 2000000, max: 5000000 },
    architect: { min: 3500000, max: 8000000 },
  },
  USD: {
    fresher: { min: 40000, max: 70000 },
    junior: { min: 60000, max: 100000 },
    mid: { min: 90000, max: 150000 },
    senior: { min: 130000, max: 220000 },
    architect: { min: 180000, max: 350000 },
  },
};

export function useSalaryValidation(
  salaryMin: string,
  salaryMax: string,
  currency: "INR" | "USD",
  experienceLevel: string
): SalaryValidationResult {
  return useMemo(() => {
    const result: SalaryValidationResult = {
      isValid: true,
      error: null,
      warning: null,
      suggestions: [],
    };

    const min = salaryMin ? parseFloat(salaryMin) : null;
    const max = salaryMax ? parseFloat(salaryMax) : null;

    // Check if min > max
    if (min !== null && max !== null && min > max) {
      result.isValid = false;
      result.error = "Minimum salary cannot be greater than maximum salary";
      return result;
    }

    // Get market range for this experience level
    const marketRange = marketRanges[currency]?.[experienceLevel];
    if (!marketRange) return result;

    // Check if range is too low
    if (max !== null && max < marketRange.min) {
      result.warning = `This salary seems below market rate for ${experienceLevel} level`;
      result.suggestions.push(
        `Consider offering at least ${currency === "INR" ? "₹" : "$"}${marketRange.min.toLocaleString()} for better candidates`
      );
    }

    // Check if range is too high (suspicious)
    if (min !== null && min > marketRange.max * 1.5) {
      result.warning = "This salary is significantly above market rate";
      result.suggestions.push(
        "High salaries are great but may indicate a typo"
      );
    }

    // Check if range is too wide
    if (min !== null && max !== null) {
      const rangeSpread = (max - min) / min;
      if (rangeSpread > 1) {
        result.suggestions.push(
          "Consider narrowing the salary range for clearer expectations"
        );
      }
    }

    // Suggest market rates if empty
    if (min === null && max === null) {
      const currencySymbol = currency === "INR" ? "₹" : "$";
      result.suggestions.push(
        `Market rate for ${experienceLevel}: ${currencySymbol}${marketRange.min.toLocaleString()} - ${currencySymbol}${marketRange.max.toLocaleString()}`
      );
    }

    return result;
  }, [salaryMin, salaryMax, currency, experienceLevel]);
}
