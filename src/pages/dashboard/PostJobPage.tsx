import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Briefcase,
  FileText,
  Settings,
  Plus,
  Trash2,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Clock,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Brain,
  Code,
  MessageSquare,
  Layout,
  HelpCircle,
  X,
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
  rounds: z.array(z.object({
    roundType: z.enum(["mcq", "coding", "system_design", "behavioral", "live_ai_interview"]),
    durationMinutes: z.number().min(5).max(180),
    aiGenerateQuestions: z.boolean(),
    customQuestions: z.array(z.string()),
  })),
});

type FormData = z.infer<typeof formSchema>;

const steps = ["Basic Info", "Requirements", "Interview Rounds", "Review"];

export default function PostJobPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
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
      rounds: [
        { roundType: "mcq", durationMinutes: 30, aiGenerateQuestions: true, customQuestions: [] },
        { roundType: "coding", durationMinutes: 60, aiGenerateQuestions: true, customQuestions: [] },
        { roundType: "behavioral", durationMinutes: 30, aiGenerateQuestions: true, customQuestions: [] },
      ],
    },
  });

  const { fields: roundFields, append: appendRound, remove: removeRound } = useFieldArray({
    control: form.control,
    name: "rounds",
  });

  const watchNumRounds = form.watch("numRounds");
  const watchRounds = form.watch("rounds");

  // Sync rounds array with numRounds
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

  const toughnessLabels = { easy: "Easy", medium: "Medium", hard: "Hard", expert: "Expert" };
  const toughnessValue = { easy: 0, medium: 33, hard: 66, expert: 100 };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Create job
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .insert({
          interviewer_id: user?.id,
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
          status: "active",
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Create rounds
      const roundsToInsert = data.rounds.map((round, idx) => ({
        job_id: jobData.id,
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

      toast({
        title: "Job posted successfully!",
        description: "Your job is now live and accepting applications.",
      });

      navigate("/dashboard/jobs");
    } catch (error: any) {
      console.error("Error posting job:", error);
      toast({
        title: "Failed to post job",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    let isValid = true;
    
    if (currentStep === 0) {
      isValid = await form.trigger(["title", "description", "field"]);
    } else if (currentStep === 1) {
      isValid = await form.trigger(["experienceLevel", "requiredSkills", "locationType"]);
    } else if (currentStep === 2) {
      isValid = await form.trigger(["rounds"]);
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/dashboard/jobs")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>
        <h1 className="text-2xl font-bold">Post a New Job</h1>
        <p className="text-muted-foreground">
          Create a job listing with AI-powered interview configuration
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{
                  scale: index === currentStep ? 1.1 : 1,
                  backgroundColor:
                    index < currentStep
                      ? "hsl(var(--success))"
                      : index === currentStep
                      ? "hsl(var(--primary))"
                      : "hsl(var(--secondary))",
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium text-primary-foreground"
              >
                {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
              </motion.div>
              <span className="mt-2 text-xs font-medium text-muted-foreground">
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`mx-3 h-0.5 w-16 ${index < currentStep ? "bg-success" : "bg-secondary"}`} />
            )}
          </div>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <GlassCard>
            {/* Step 1: Basic Info */}
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Basic Information
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Senior Frontend Developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the role, responsibilities, and what you're looking for..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum 50 characters. Be specific about requirements.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="field"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field/Domain</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              </motion.div>
            )}

            {/* Step 2: Requirements */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <FileText className="h-5 w-5 text-primary" />
                  Requirements & Details
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="experienceLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                {/* Skills Input */}
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
                  {form.formState.errors.requiredSkills && (
                    <p className="mt-1 text-sm text-danger">
                      {form.formState.errors.requiredSkills.message}
                    </p>
                  )}
                </div>

                {/* Salary Range */}
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              </motion.div>
            )}

            {/* Step 3: Interview Rounds */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Settings className="h-5 w-5 text-primary" />
                  Interview Configuration
                </div>

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
                        variant={watchNumRounds === num ? "default" : "outline"}
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
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              </motion.div>
            )}

            {/* Step 4: Review */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Check className="h-5 w-5 text-success" />
                  Review & Publish
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <h3 className="font-semibold">{form.watch("title") || "Job Title"}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {form.watch("field")} • {form.watch("experienceLevel")} • {form.watch("locationType")}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-border p-4">
                      <h4 className="text-sm font-medium text-muted-foreground">Required Skills</h4>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {form.watch("requiredSkills").map((skill) => (
                          <span key={skill} className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border border-border p-4">
                      <h4 className="text-sm font-medium text-muted-foreground">Interview Setup</h4>
                      <p className="mt-1">
                        {form.watch("numRounds")} rounds • {toughnessLabels[form.watch("toughnessLevel")]} difficulty
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border p-4">
                    <h4 className="mb-3 text-sm font-medium text-muted-foreground">Interview Rounds</h4>
                    <div className="space-y-2">
                      {form.watch("rounds").map((round, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded bg-secondary/50 p-2">
                          <span className="text-sm">
                            Round {idx + 1}: {roundTypes.find(t => t.value === round.roundType)?.label}
                          </span>
                          <span className="text-sm text-muted-foreground">{round.durationMinutes} min</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
              {currentStep > 0 ? (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              ) : (
                <div />
              )}

              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" variant="hero" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      Publish Job
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </GlassCard>
        </form>
      </Form>
    </div>
  );
}
