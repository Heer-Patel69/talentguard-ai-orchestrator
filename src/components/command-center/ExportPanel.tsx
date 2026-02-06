import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Film,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportPanelProps {
  jobId?: string;
  candidateIds?: string[];
  className?: string;
}

type ExportFormat = "pdf" | "csv" | "excel";

interface ExportOption {
  id: string;
  label: string;
  description: string;
  formats: ExportFormat[];
}

const exportOptions: ExportOption[] = [
  {
    id: "candidate_reports",
    label: "Candidate Reports",
    description: "Detailed AI evaluation reports for each candidate",
    formats: ["pdf"],
  },
  {
    id: "scoring_data",
    label: "Scoring Data",
    description: "All scores, metrics, and rankings",
    formats: ["csv", "excel"],
  },
  {
    id: "audit_logs",
    label: "Audit Logs",
    description: "Complete audit trail for compliance",
    formats: ["pdf", "csv", "excel"],
  },
  {
    id: "interview_transcripts",
    label: "Interview Transcripts",
    description: "Full transcripts of all interviews",
    formats: ["pdf"],
  },
  {
    id: "fairness_report",
    label: "Fairness Report",
    description: "Bias monitoring and fairness metrics",
    formats: ["pdf", "csv"],
  },
];

export function ExportPanel({ jobId, candidateIds, className }: ExportPanelProps) {
  const [open, setOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<"idle" | "exporting" | "success" | "error">("idle");
  const { toast } = useToast();

  const toggleOption = (optionId: string) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  const getAvailableFormats = (): ExportFormat[] => {
    if (selectedOptions.length === 0) return ["pdf", "csv", "excel"];
    
    const formatSets = selectedOptions.map(
      (id) => exportOptions.find((o) => o.id === id)?.formats || []
    );
    
    // Find common formats across all selected options
    return ["pdf", "csv", "excel"].filter((f) =>
      formatSets.every((set) => set.includes(f as ExportFormat))
    ) as ExportFormat[];
  };

  const availableFormats = getAvailableFormats();

  const handleExport = async () => {
    if (selectedOptions.length === 0) {
      toast({
        title: "No options selected",
        description: "Please select at least one export option.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setExportStatus("exporting");
    setExportProgress(0);

    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setExportProgress(i);
      }

      // In a real implementation, this would call an API to generate the export
      // const response = await fetch('/api/export', {
      //   method: 'POST',
      //   body: JSON.stringify({ options: selectedOptions, format, jobId, candidateIds })
      // });

      setExportStatus("success");
      toast({
        title: "Export complete",
        description: `Your ${format.toUpperCase()} file is ready for download.`,
      });

      // Trigger download (mock)
      const link = document.createElement("a");
      link.href = "#";
      link.download = `export_${Date.now()}.${format}`;
      // link.click();

      setTimeout(() => {
        setOpen(false);
        setExportStatus("idle");
        setSelectedOptions([]);
        setExportProgress(0);
      }, 1500);
    } catch (error) {
      setExportStatus("error");
      toast({
        title: "Export failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (f: ExportFormat) => {
    switch (f) {
      case "pdf": return FileText;
      case "csv": return FileSpreadsheet;
      case "excel": return FileSpreadsheet;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Download className="h-4 w-4 mr-2" />
          Export Reports
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Reports</DialogTitle>
          <DialogDescription>
            Select the data you want to export and choose your preferred format.
          </DialogDescription>
        </DialogHeader>

        {exportStatus === "idle" && (
          <div className="space-y-6 py-4">
            {/* Export Options */}
            <div className="space-y-3">
              <Label className="text-base">What to export</Label>
              {exportOptions.map((option) => (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer",
                    selectedOptions.includes(option.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-secondary"
                  )}
                  onClick={() => toggleOption(option.id)}
                >
                  <Checkbox
                    checked={selectedOptions.includes(option.id)}
                    onCheckedChange={() => toggleOption(option.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                    <div className="flex gap-1 mt-1">
                      {option.formats.map((f) => {
                        const Icon = getFormatIcon(f);
                        return (
                          <span
                            key={f}
                            className="text-xs text-muted-foreground flex items-center gap-0.5"
                          >
                            <Icon className="h-3 w-3" />
                            {f.toUpperCase()}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Format Selection */}
            <div>
              <Label className="text-base mb-3 block">Export format</Label>
              <RadioGroup
                value={format}
                onValueChange={(v) => setFormat(v as ExportFormat)}
                className="flex gap-3"
              >
                {(["pdf", "csv", "excel"] as ExportFormat[]).map((f) => {
                  const Icon = getFormatIcon(f);
                  const isAvailable = availableFormats.includes(f);
                  
                  return (
                    <Label
                      key={f}
                      className={cn(
                        "flex-1 flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all",
                        !isAvailable && "opacity-50 cursor-not-allowed",
                        format === f && isAvailable
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-secondary"
                      )}
                    >
                      <RadioGroupItem
                        value={f}
                        className="sr-only"
                        disabled={!isAvailable}
                      />
                      <Icon className="h-6 w-6 mb-2" />
                      <span className="font-medium">{f.toUpperCase()}</span>
                    </Label>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Recording Downloads */}
            <div className="p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Interview recordings can be downloaded individually from candidate reports.
                </span>
              </div>
            </div>
          </div>
        )}

        {exportStatus === "exporting" && (
          <div className="py-8 text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <h4 className="font-semibold mb-2">Generating Export...</h4>
            <Progress value={exportProgress} className="w-full mb-2" />
            <p className="text-sm text-muted-foreground">{exportProgress}% complete</p>
          </div>
        )}

        {exportStatus === "success" && (
          <div className="py-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
            </motion.div>
            <h4 className="font-semibold mb-2">Export Complete!</h4>
            <p className="text-sm text-muted-foreground">Your download will start automatically.</p>
          </div>
        )}

        {exportStatus === "error" && (
          <div className="py-8 text-center">
            <AlertCircle className="h-16 w-16 text-danger mx-auto mb-4" />
            <h4 className="font-semibold mb-2">Export Failed</h4>
            <p className="text-sm text-muted-foreground">Please try again later.</p>
            <Button className="mt-4" onClick={() => setExportStatus("idle")}>
              Try Again
            </Button>
          </div>
        )}

        {exportStatus === "idle" && (
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={selectedOptions.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
