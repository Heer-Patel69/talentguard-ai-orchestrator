import { useEffect, useCallback, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseAutoSaveOptions<T> {
  key: string;
  data: T;
  enabled?: boolean;
  debounceMs?: number;
  onRestore?: (data: T) => void;
}

interface SavedData<T> {
  data: T;
  timestamp: string;
}

export function useAutoSave<T>({
  key,
  data,
  enabled = true,
  debounceMs = 2000,
  onRestore,
}: UseAutoSaveOptions<T>) {
  const { toast } = useToast();
  const [hasRestoredData, setHasRestoredData] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const storageKey = `autosave_${key}`;

  // Save data to localStorage
  const saveData = useCallback(() => {
    if (!enabled) return;
    
    try {
      const savePayload: SavedData<T> = {
        data,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(savePayload));
      setLastSaved(new Date());
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }, [data, storageKey, enabled]);

  // Debounced save
  useEffect(() => {
    if (!enabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveData();
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, saveData, debounceMs, enabled]);

  // Get saved data
  const getSavedData = useCallback((): SavedData<T> | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved) as SavedData<T>;
      }
    } catch (error) {
      console.error("Failed to get saved data:", error);
    }
    return null;
  }, [storageKey]);

  // Check for saved data on mount
  useEffect(() => {
    if (!enabled || hasRestoredData) return;

    const saved = getSavedData();
    if (saved && onRestore) {
      const savedDate = new Date(saved.timestamp);
      const now = new Date();
      const hoursDiff = (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60);

      // Only offer to restore if saved within last 24 hours
      if (hoursDiff < 24) {
        toast({
          title: "Draft Found",
          description: `You have unsaved changes from ${savedDate.toLocaleTimeString()}. Click to restore.`,
          duration: 10000,
        });
        
        // Auto-restore after showing notification
        setTimeout(() => {
          if (!hasRestoredData) {
            onRestore(saved.data);
            setHasRestoredData(true);
          }
        }, 500);
      }
    }
  }, [enabled, getSavedData, hasRestoredData, onRestore, toast]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setLastSaved(null);
    } catch (error) {
      console.error("Failed to clear saved data:", error);
    }
  }, [storageKey]);

  // Force save immediately
  const forceSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    saveData();
  }, [saveData]);

  return {
    lastSaved,
    hasRestoredData,
    clearSavedData,
    forceSave,
    getSavedData,
  };
}
