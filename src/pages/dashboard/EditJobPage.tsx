import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useJobValidation } from "@/hooks/useJobValidation";
import { ValidationIndicator, CompletenessScore } from "@/components/jobs/ValidationIndicator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Briefcase,
  FileText,
  Settings,
  Plus,
  Loader2,
  ArrowLeft,
  Save,
  Clock,
  MapPin,
  DollarSign,
  Calendar,
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  Code,
  MessageSquare,
  Layout,
  HelpCircle,
  Brain,
} from "lucide-react";

const fields = [
  "DSA",
  "Software Engineering",
  "AI/ML",
  "Data Science",
  "DevOps",
  "Cybersecurity",
  "Frontend",
  "Backend",
  "Full Stack",
  "Mobile Development",
  "Cloud Computing",
  "Blockchain",
  "QA/Testing",
  "Product Management",
];

const roundTypes = [
  { value: "mcq", label: "MCQ", icon: HelpCircle, description: "Multiple choice questions" },
  { value: "coding", label: "Coding", icon: Code, description: "Live coding challenge" },
  { value: "system_design", label: "System Design", icon: Layout, description: "Architecture discussion" },
  { value: "behavioral", label: "Behavioral", icon: MessageSquare, description: "Soft skills assessment" },
  { value: "live_ai_interview", label: "Live AI Interview", icon: Brain, description: "AI-powered conversation" },
];

const formSchema = z.object({
  title: z.string().min(3, "Job title must be at least 3 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  field: z.string().min(1, "Please select a field"),
  experienceLevel: z.enum(["fresher", "junior", "mid", "senior", "architect"]),
  requiredSkills: z.array(z.string()).min(1, "Add at least one skill"),
  toughnessLevel: z.enum(["easy", "medium", "hard", "expert"]),
  numRounds: z.number().min(1).max(5),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  salaryCurrency: z.enum(["INR", "USD"]),
  locationType: z.enum(["remote", "hybrid", "onsite"]),
  locationCity: z.string().optional(),
  applicationDeadline: z.string().optional(),
  autoShortlistEnabled: z.boolean(),
  autoShortlistCount: z.number().min(1).max(100),
  status: z.enum(["active", "draft", "paused", "closed"]),
  rounds: z.array(z.object({
    id: z.string().optional(),
    roundType: z.enum(["mcq", "coding", "system_design", "behavioral", "live_ai_interview"]),
    durationMinutes: z.number().min(5).max(180),
    aiGenerateQuestions: z.boolean(),
    customQuestions: z.array(z.string()),
  })),
});

type FormData = z.infer<typeof formSchema>;

export default function EditJobPage() {
  const { id: jobId } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [existingJobs, setExistingJobs] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      field: "",
      experienceLevel: "mid",
      requiredSkills: [],
      toughnessLevel: "medium",
      numRounds: 3,
      salaryMin: "",
      salaryMax: "",
      salaryCurrency: "INR",
      locationType: "remote",
      locationCity: "",
      applicationDeadline: "",
      autoShortlistEnabled: false,
      autoShortlistCount: 10,
      status: "active",
      rounds: [],
    },
  });

  const { fields: roundFields, append: appendRound, remove: removeRound, replace: replaceRounds } = useFieldArray({
    control: form.control,
    name: "rounds",
  });

  // AI Validation hook
  const {
    overallScore,
    validateField,
    getFieldStatus,
    getSuggestions,
    hasErrors,
  } = useJobValidation({
    existingJobs,
    jobField: form.watch("field"),
    experienceLevel: form.watch("experienceLevel"),
  });

  // Track form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Fetch existing jobs for duplicate detection
  useEffect(() => {
    async function fetchExistingJobs() {
      if (!user) return;
      const { data } = await supabase
        .from("jobs")
        .select("title")
        .eq("interviewer_id", user.id)
        .neq("id", jobId);
      
      if (data) {
        setExistingJobs(data.map((j) => j.title));
      }
    }
    fetchExistingJobs();
  }, [user, jobId]);

  // Fetch job data
  useEffect(() => {
    async function fetchJob() {
      if (!jobId) {
        navigate("/dashboard/jobs");
        return;
      }

      try {
        const { data: job, error: jobError } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", jobId)
          .single();

        if (jobError) throw jobError;

        if (job.interviewer_id !== user?.id) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to edit this job",
            variant: "destructive",
          });
          navigate("/dashboard/jobs");
          return;
        }

        // Fetch rounds
        const { data: rounds, error: roundsError } = await supabase
          .from("job_rounds")
          .select("*")
          .eq("job_id", jobId)
          .order("round_number");

        if (roundsError) throw roundsError;

        // Populate form
        form.reset({
          title: job.title,
          description: job.description,
          field: job.field,
          experienceLevel: job.experience_level as "fresher" | "junior" | "mid" | "senior" | "architect",
          requiredSkills: job.required_skills || [],
          toughnessLevel: job.toughness_level as "easy" | "medium" | "hard" | "expert",
          numRounds: job.num_rounds,
          salaryMin: job.salary_min?.toString() || "",
          salaryMax: job.salary_max?.toString() || "",
          salaryCurrency: (job.salary_currency as "INR" | "USD") || "INR",
          locationType: job.location_type as "remote" | "hybrid" | "onsite",
          locationCity: job.location_city || "",
          applicationDeadline: job.application_deadline || "",
          autoShortlistEnabled: job.auto_shortlist_enabled || false,
          autoShortlistCount: job.auto_shortlist_count || 10,
          status: job.status as "active" | "draft" | "paused" | "closed",
          rounds: rounds.map((r) => ({
            id: r.id,
            roundType: r.round_type as "mcq" | "coding" | "system_design" | "behavioral" | "live_ai_interview",
            durationMinutes: r.duration_minutes,
            aiGenerateQuestions: r.ai_generate_questions,
            customQuestions: Array.isArray(r.custom_questions) ? r.custom_questions as string[] : [],
          })),
        });

        setHasUnsavedChanges(false);
      } catch (error) {
        console.error("Error fetching job:", error);
        toast({
          title: "Error",
          description: "Failed to load job details",
          variant: "destructive",
        });
        navigate("/dashboard/jobs");
      } finally {
        setIsLoading(false);
      }
    }

    fetchJob();
  }, [jobId, user, navigate, toast, form]);

  // Validate on field change
  const handleTitleChange = useCallback(
    (value: string) => {
      validateField("title", value);
    },
    [validateField]
  );

  const handleDescriptionChange = useCallback(
    (value: string) => {
      validateField("description", value);
    },
    [validateField]
  );

  const addSkill = () => {
    if (skillInput.trim()) {
      const currentSkills = form.getValues("requiredSkills");
      if (!currentSkills.includes(skillInput.trim())) {
        form.setValue("requiredSkills", [...currentSkills, skillInput.trim()]);
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    const currentSkills = form.getValues("requiredSkills");
    form.setValue("requiredSkills", currentSkills.filter(s => s !== skill));
  };

  const handleNumRoundsChange = (value: number) => {
    form.setValue("numRounds", value);
    const currentRounds = form.getValues("rounds");
    
    if (value > currentRounds.length) {
      for (let i = currentRounds.length; i < value; i++) {
        appendRound({ 
          roundType: "coding", 
          durationMinutes: 30, 
          aiGenerateQuestions: true, 
          customQuestions: [] 
        });
      }
    } else if (value < currentRounds.length) {
      for (let i = currentRounds.length - 1; i >= value; i--) {
        removeRound(i);
      }
    }
  };

  const onSubmit = async (data: FormData) => {
    // Check for validation errors
    if (hasErrors("title") || hasErrors("description")) {
      toast({
        title: "Validation Errors",
        description: "Please fix the highlighted issues before saving",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Update job
      const { error: jobError } = await supabase
        .from("jobs")
        .update({
          title: data.title,
          description: data.description,
          field: data.field,
          experience_level: data.experienceLevel,
          required_skills: data.requiredSkills,
          toughness_level: data.toughnessLevel,
          num_rounds: data.numRounds,
          salary_min: data.salaryMin ? parseFloat(data.salaryMin) : null,
          salary_max: data.salaryMax ? parseFloat(data.salaryMax) : null,
          salary_currency: data.salaryCurrency,
          location_type: data.locationType,
          location_city: data.locationCity || null,
          application_deadline: data.applicationDeadline || null,
          auto_shortlist_enabled: data.autoShortlistEnabled,
          auto_shortlist_count: data.autoShortlistCount,
          status: data.status,
        })
        .eq("id", jobId);

      if (jobError) throw jobError;

      // Delete existing rounds and re-create
      await supabase.from("job_rounds").delete().eq("job_id", jobId);

      const roundsToInsert = data.rounds.map((round, idx) => ({
        job_id: jobId,
        round_number: idx + 1,
        round_type: round.roundType,
        duration_minutes: round.durationMinutes,
        ai_generate_questions: round.aiGenerateQuestions,
        custom_questions: round.customQuestions,
      }));

      const { error: roundsError } = await supabase
        .from("job_rounds")
        .insert(roundsToInsert);

      if (roundsError) throw roundsError;

      setHasUnsavedChanges(false);
      toast({
        title: "Job Updated!",
        description: "Your changes have been saved successfully",
      });

      navigate("/dashboard/jobs");
    } catch (error: any) {
      console.error("Error updating job:", error);
      toast({
        title: "Failed to update job",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setShowDiscardDialog(true);
    } else {
      navigate("/dashboard/jobs");
    }
  };

  const toughnessLabels = { easy: "Easy", medium: "Medium", hard: "Hard", expert: "Expert" };
  const toughnessValue = { easy: 0, medium: 33, hard: 66, expert: 100 };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
          <h1 className="text-2xl font-bold">Edit Job</h1>
          <p className="text-muted-foreground">
            Update your job listing with AI-powered validation
          </p>
        </div>
        <CompletenessScore score={overallScore} />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <GlassCard>
            <div className="flex items-center gap-2 text-lg font-semibold mb-6">
              <Briefcase className="h-5 w-5 text-primary" />
              Basic Information
            </div>

            <div className="space-y-6">
              {/* Title with validation */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Job Title</FormLabel>
                      <ValidationIndicator
                        status={getFieldStatus("title")}
                        suggestions={getSuggestions("title")}
                        compact
                      />
                    </div>
                    <FormControl>
                      <Input
                        placeholder="Senior Frontend Developer"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleTitleChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <ValidationIndicator
                      status={getFieldStatus("title")}
                      suggestions={getSuggestions("title")}
                      showScore={false}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description with validation */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Job Description</FormLabel>
                      <ValidationIndicator
                        status={getFieldStatus("description")}
                        suggestions={getSuggestions("description")}
                        compact
                      />
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the role, responsibilities, and what you're looking for..."
                        className="min-h-[150px]"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleDescriptionChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum 50 characters. Be specific about requirements.
                    </FormDescription>
                    <ValidationIndicator
                      status={getFieldStatus("description")}
                      suggestions={getSuggestions("description")}
                      showScore={false}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="field"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field/Domain</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a field" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fields.map((f) => (
                            <SelectItem key={f} value={f}>{f}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </GlassCard>

          {/* Requirements */}
          <GlassCard>
            <div className="flex items-center gap-2 text-lg font-semibold mb-6">
              <FileText className="h-5 w-5 text-primary" />
              Requirements & Details
            </div>

            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="experienceLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fresher">Fresher (0-1 years)</SelectItem>
                          <SelectItem value="junior">Junior (1-3 years)</SelectItem>
                          <SelectItem value="mid">Mid-Level (3-5 years)</SelectItem>
                          <SelectItem value="senior">Senior (5-8 years)</SelectItem>
                          <SelectItem value="architect">Architect (8+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="locationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Location</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                          <SelectItem value="onsite">On-site</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("locationType") !== "remote" && (
                <FormField
                  control={form.control}
                  name="locationCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input placeholder="Mumbai" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Skills */}
              <div>
                <Label>Required Skills</Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    placeholder="Add a skill (e.g., React, TypeScript)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {form.watch("requiredSkills").map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                    >
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Salary */}
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="salaryMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Salary</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input type="number" placeholder="500000" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salaryMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Salary</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1500000" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salaryCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="applicationDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Deadline (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="date" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </GlassCard>

          {/* Interview Configuration */}
          <GlassCard>
            <div className="flex items-center gap-2 text-lg font-semibold mb-6">
              <Settings className="h-5 w-5 text-primary" />
              Interview Configuration
            </div>

            <div className="space-y-6">
              {/* Toughness Level */}
              <div>
                <Label>Interview Toughness Level</Label>
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="toughnessLevel"
                    render={({ field }) => (
                      <div>
                        <Slider
                          value={[toughnessValue[field.value]]}
                          onValueChange={([v]) => {
                            if (v <= 15) field.onChange("easy");
                            else if (v <= 50) field.onChange("medium");
                            else if (v <= 80) field.onChange("hard");
                            else field.onChange("expert");
                          }}
                          max={100}
                          step={1}
                        />
                        <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                          <span>Easy</span>
                          <span>Medium</span>
                          <span>Hard</span>
                          <span>Expert</span>
                        </div>
                      </div>
                    )}
                  />
                </div>
              </div>

              {/* Number of Rounds */}
              <div>
                <Label>Number of Interview Rounds</Label>
                <div className="mt-2 flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <Button
                      key={num}
                      type="button"
                      variant={form.watch("numRounds") === num ? "default" : "outline"}
                      onClick={() => handleNumRoundsChange(num)}
                      className="h-12 w-12"
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Round Configuration */}
              <div className="space-y-4">
                <Label>Round Configuration</Label>
                {roundFields.map((roundField, index) => (
                  <motion.div
                    key={roundField.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-border p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className="font-medium">Round {index + 1}</span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`rounds.${index}.roundType`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Round Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {roundTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    <div className="flex items-center gap-2">
                                      <type.icon className="h-4 w-4" />
                                      {type.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`rounds.${index}.durationMinutes`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  type="number"
                                  className="pl-10"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm">AI Auto-generate Questions</span>
                      </div>
                      <FormField
                        control={form.control}
                        name={`rounds.${index}.aiGenerateQuestions`}
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Auto-shortlist */}
              <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                <div>
                  <Label>Auto-shortlist Top Candidates</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically shortlist top performers based on AI scores
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <FormField
                    control={form.control}
                    name="autoShortlistEnabled"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  {form.watch("autoShortlistEnabled") && (
                    <FormField
                      control={form.control}
                      name="autoShortlistCount"
                      render={({ field }) => (
                        <Input
                          type="number"
                          className="w-20"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      )}
                    />
                  )}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" onClick={handleBack}>
              Cancel
            </Button>
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <span className="text-sm text-warning flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  Unsaved changes
                </span>
              )}
              <Button type="submit" variant="hero" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {/* Discard Changes Dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => navigate("/dashboard/jobs")}
              className="bg-danger hover:bg-danger/90"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
