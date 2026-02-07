import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Plus,
  Save,
  Trash2,
  Copy,
  MoreVertical,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface JobTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  field: string;
  experience_level: string;
  required_skills: string[];
  toughness_level: string;
  num_rounds: number;
  location_type: string;
  created_at: string;
}

interface JobTemplatesProps {
  onSelectTemplate: (template: JobTemplate) => void;
  currentJobData?: Partial<JobTemplate>;
  className?: string;
}

export function JobTemplates({
  onSelectTemplate,
  currentJobData,
  className,
}: JobTemplatesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");

  // Fetch templates from localStorage (could be moved to Supabase)
  useEffect(() => {
    const fetchTemplates = () => {
      try {
        const saved = localStorage.getItem(`job_templates_${user?.id}`);
        if (saved) {
          setTemplates(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Failed to load templates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchTemplates();
    }
  }, [user]);

  // Save templates to localStorage
  const saveTemplates = (newTemplates: JobTemplate[]) => {
    try {
      localStorage.setItem(
        `job_templates_${user?.id}`,
        JSON.stringify(newTemplates)
      );
      setTemplates(newTemplates);
    } catch (error) {
      console.error("Failed to save templates:", error);
    }
  };

  // Save current job as template
  const handleSaveAsTemplate = () => {
    if (!templateName.trim() || !currentJobData) {
      toast({
        title: "Template name required",
        description: "Please enter a name for your template",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    const newTemplate: JobTemplate = {
      id: crypto.randomUUID(),
      name: templateName.trim(),
      title: currentJobData.title || "",
      description: currentJobData.description || "",
      field: currentJobData.field || "",
      experience_level: currentJobData.experience_level || "mid",
      required_skills: currentJobData.required_skills || [],
      toughness_level: currentJobData.toughness_level || "medium",
      num_rounds: currentJobData.num_rounds || 3,
      location_type: currentJobData.location_type || "remote",
      created_at: new Date().toISOString(),
    };

    saveTemplates([...templates, newTemplate]);

    toast({
      title: "Template Saved",
      description: `"${templateName}" has been saved as a template`,
    });

    setTemplateName("");
    setShowSaveDialog(false);
    setIsSaving(false);
  };

  // Delete template
  const handleDeleteTemplate = (id: string) => {
    const updated = templates.filter((t) => t.id !== id);
    saveTemplates(updated);
    toast({
      title: "Template Deleted",
      description: "The template has been removed",
    });
  };

  // Use template
  const handleUseTemplate = (template: JobTemplate) => {
    onSelectTemplate(template);
    toast({
      title: "Template Applied",
      description: `"${template.name}" has been loaded`,
    });
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Job Templates
        </h3>
        
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={!currentJobData?.title}>
              <Save className="mr-2 h-4 w-4" />
              Save as Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save as Template</DialogTitle>
              <DialogDescription>
                Save this job configuration as a reusable template
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Template name..."
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveAsTemplate} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : templates.length === 0 ? (
        <GlassCard className="text-center py-6">
          <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No templates yet. Save your first job as a template!
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <AnimatePresence>
            {templates.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <GlassCard
                  hover
                  className="cursor-pointer"
                  onClick={() => handleUseTemplate(template)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {template.title || "Untitled Job"}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {template.field}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {template.experience_level}
                        </Badge>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUseTemplate(template);
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Use Template
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(template.id);
                          }}
                          className="text-danger focus:text-danger"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
