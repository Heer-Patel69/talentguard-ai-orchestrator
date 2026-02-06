import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  FileText,
  Calculator,
  CheckCircle,
  Eye,
  Clock,
  Filter,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AuditLog {
  id: string;
  action_type: string;
  action_description: string;
  decision_made: string | null;
  factors_considered: Record<string, any> | null;
  model_version: string;
  confidence_score: number | null;
  created_at: string;
}

interface AuditLogTableProps {
  logs: AuditLog[];
  onExportPDF?: () => void;
  onExportCSV?: () => void;
}

const actionTypeIcons: Record<string, any> = {
  score_calculated: Calculator,
  decision_made: CheckCircle,
  report_generated: FileText,
  export_requested: Download,
};

const actionTypeLabels: Record<string, string> = {
  score_calculated: "Score Calculated",
  decision_made: "Decision Made",
  report_generated: "Report Generated",
  export_requested: "Export Requested",
};

export function AuditLogTable({ logs, onExportPDF, onExportCSV }: AuditLogTableProps) {
  const [filter, setFilter] = useState<string | null>(null);

  const filteredLogs = filter
    ? logs.filter((log) => log.action_type === filter)
    : logs;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Audit Log
        </h3>

        <div className="flex items-center gap-2">
          {/* Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                {filter ? actionTypeLabels[filter] : "All Actions"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilter(null)}>
                All Actions
              </DropdownMenuItem>
              {Object.entries(actionTypeLabels).map(([key, label]) => (
                <DropdownMenuItem key={key} onClick={() => setFilter(key)}>
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onExportPDF}>
                <FileText className="mr-2 h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportCSV}>
                <FileText className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Decision</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Confidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No audit logs found
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log, index) => {
                const Icon = actionTypeIcons[log.action_type] || Eye;
                return (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-border last:border-0"
                  >
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(log.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="text-sm">
                          {actionTypeLabels[log.action_type] || log.action_type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm max-w-xs truncate">
                      {log.action_description}
                    </TableCell>
                    <TableCell>
                      {log.decision_made && (
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full capitalize",
                            log.decision_made === "shortlist" && "bg-success/10 text-success",
                            log.decision_made === "maybe" && "bg-warning/10 text-warning",
                            log.decision_made === "reject" && "bg-danger/10 text-danger"
                          )}
                        >
                          {log.decision_made}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.model_version}
                    </TableCell>
                    <TableCell>
                      {log.confidence_score !== null && (
                        <span className="text-sm font-medium">
                          {(log.confidence_score * 100).toFixed(0)}%
                        </span>
                      )}
                    </TableCell>
                  </motion.tr>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        All AI decisions are logged for compliance and auditing purposes.
      </p>
    </GlassCard>
  );
}
