import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  X,
  CheckSquare,
  Trash2,
  Pause,
  Play,
  Archive,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BulkActionsBarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onActionComplete: () => void;
  className?: string;
}

type BulkAction = "pause" | "activate" | "close" | "delete";

export function BulkActionsBar({
  selectedIds,
  onClearSelection,
  onActionComplete,
  className,
}: BulkActionsBarProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null);

  const handleBulkAction = async (action: BulkAction) => {
    setIsLoading(true);

    try {
      if (action === "delete") {
        const { error } = await supabase
          .from("jobs")
          .delete()
          .in("id", selectedIds);

        if (error) throw error;

        toast({
          title: "Jobs Deleted",
          description: `${selectedIds.length} job(s) have been deleted`,
        });
      } else {
        const statusMap: Record<string, "active" | "paused" | "closed"> = {
          pause: "paused",
          activate: "active",
          close: "closed",
        };

        const { error } = await supabase
          .from("jobs")
          .update({ status: statusMap[action] })
          .in("id", selectedIds);

        if (error) throw error;

        toast({
          title: "Jobs Updated",
          description: `${selectedIds.length} job(s) have been ${statusMap[action]}`,
        });
      }

      onActionComplete();
      onClearSelection();
    } catch (error: any) {
      console.error("Bulk action failed:", error);
      toast({
        title: "Action Failed",
        description: error.message || "Failed to perform bulk action",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setConfirmAction(null);
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
            "flex items-center gap-3 px-4 py-3 rounded-xl",
            "bg-background/95 backdrop-blur-xl border shadow-xl",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-primary" />
            <Badge variant="secondary">{selectedIds.length} selected</Badge>
          </div>

          <div className="h-6 w-px bg-border" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                Actions
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={() => handleBulkAction("activate")}>
                <Play className="mr-2 h-4 w-4 text-success" />
                Activate All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction("pause")}>
                <Pause className="mr-2 h-4 w-4 text-warning" />
                Pause All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction("close")}>
                <Archive className="mr-2 h-4 w-4 text-muted-foreground" />
                Close All
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setConfirmAction("delete")}
                className="text-danger focus:text-danger"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClearSelection}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmAction === "delete"}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title="Delete Selected Jobs?"
        description={`This will permanently delete ${selectedIds.length} job(s) and all associated applications. This action cannot be undone.`}
        onConfirm={() => handleBulkAction("delete")}
        confirmText="Delete Jobs"
        variant="destructive"
        isLoading={isLoading}
      />
    </>
  );
}
