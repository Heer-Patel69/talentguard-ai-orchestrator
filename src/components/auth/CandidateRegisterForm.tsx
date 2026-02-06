import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import { PasswordStrength } from "./PasswordStrength";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  User,
  Mail,
  Lock,
  Phone,
  Github,
  Linkedin,
  FileText,
  CreditCard,
  Upload,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Invalid phone number").max(15),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  githubUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  aadhaarNumber: z.string().length(12, "Aadhaar number must be 12 digits").regex(/^\d+$/, "Only numbers allowed"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

const steps = ["Account", "Professional", "Verification"];

export function CandidateRegisterForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [aadhaarFront, setAadhaarFront] = useState<File | null>(null);
  const [aadhaarBack, setAadhaarBack] = useState<File | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      githubUrl: "",
      linkedinUrl: "",
      aadhaarNumber: "",
    },
  });

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "resume" | "aadhaar-front" | "aadhaar-back"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    if (type === "resume" && file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    switch (type) {
      case "resume":
        setResumeFile(file);
        break;
      case "aadhaar-front":
        setAadhaarFront(file);
        break;
      case "aadhaar-back":
        setAadhaarBack(file);
        break;
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!resumeFile) {
      toast({
        title: "Resume required",
        description: "Please upload your resume",
        variant: "destructive",
      });
      return;
    }

    if (!aadhaarFront || !aadhaarBack) {
      toast({
        title: "Aadhaar required",
        description: "Please upload both front and back of your Aadhaar card",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      const userId = authData.user.id;

      // 2. Create user role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "candidate" });

      if (roleError) throw roleError;

      // 3. Create base profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: userId,
          full_name: data.fullName,
          email: data.email,
        });

      if (profileError) throw profileError;

      // 4. Upload files
      const resumeExt = resumeFile.name.split(".").pop();
      const { error: resumeError } = await supabase.storage
        .from("resumes")
        .upload(`${userId}/resume.${resumeExt}`, resumeFile);
      if (resumeError) throw resumeError;

      const frontExt = aadhaarFront.name.split(".").pop();
      const { error: frontError } = await supabase.storage
        .from("aadhaar-documents")
        .upload(`${userId}/front.${frontExt}`, aadhaarFront);
      if (frontError) throw frontError;

      const backExt = aadhaarBack.name.split(".").pop();
      const { error: backError } = await supabase.storage
        .from("aadhaar-documents")
        .upload(`${userId}/back.${backExt}`, aadhaarBack);
      if (backError) throw backError;

      // 5. Get file URLs
      const { data: resumeUrl } = supabase.storage
        .from("resumes")
        .getPublicUrl(`${userId}/resume.${resumeExt}`);

      // 6. Create candidate profile
      const { error: candidateError } = await supabase
        .from("candidate_profiles")
        .insert({
          user_id: userId,
          phone_number: data.phoneNumber,
          github_url: data.githubUrl || null,
          linkedin_url: data.linkedinUrl || null,
          resume_url: `${userId}/resume.${resumeExt}`,
          aadhaar_number: data.aadhaarNumber,
          aadhaar_front_url: `${userId}/front.${frontExt}`,
          aadhaar_back_url: `${userId}/back.${backExt}`,
          verification_status: "pending",
        });

      if (candidateError) throw candidateError;

      toast({
        title: "Registration successful!",
        description: "Please check your email to verify your account. After verification, complete the face verification process.",
      });

      navigate("/login");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = currentStep === 0 
      ? ["fullName", "phoneNumber", "email", "password", "confirmPassword"] as const
      : currentStep === 1 
      ? ["githubUrl", "linkedinUrl"] as const
      : [];

    const result = await form.trigger(fieldsToValidate);
    if (result) setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  return (
    <GlassCard className="w-full max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
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
                      ? "hsl(var(--success))"
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
              <div className={`mx-3 h-0.5 w-12 ${index < currentStep ? "bg-success" : "bg-secondary"}`} />
            )}
          </div>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Account Details */}
          {currentStep === 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-success" />
                Personal Details
              </h2>

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Rahul Sharma" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="+91 9876543210" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="rahul@email.com" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="password" placeholder="••••••••" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <PasswordStrength password={field.value} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="password" placeholder="••••••••" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          )}

          {/* Step 2: Professional Info */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-success" />
                Professional Information
              </h2>

              <FormField
                control={form.control}
                name="githubUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub Profile URL</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Github className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="https://github.com/username" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkedinUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn Profile URL</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="https://linkedin.com/in/username" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <Label>Resume (PDF only, max 5MB)</Label>
                <div className="mt-2">
                  <label className="cursor-pointer block">
                    <div className={`flex items-center justify-center gap-3 p-6 rounded-lg border-2 border-dashed transition-colors ${resumeFile ? "border-success bg-success/10" : "border-border hover:border-primary hover:bg-secondary/50"}`}>
                      {resumeFile ? (
                        <>
                          <Check className="h-5 w-5 text-success" />
                          <span className="text-sm">{resumeFile.name}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Click to upload resume</span>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "resume")}
                    />
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Aadhaar Verification */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-success" />
                Identity Verification
              </h2>

              <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-warning">Important</p>
                    <p className="text-sm text-muted-foreground">
                      After registration, you'll need to complete a face verification to match with your Aadhaar photo.
                    </p>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="aadhaarNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aadhaar Card Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="123456789012" maxLength={12} className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>12-digit Aadhaar number</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Aadhaar Card Front</Label>
                  <div className="mt-2">
                    <label className="cursor-pointer block">
                      <div className={`flex items-center justify-center gap-3 p-6 rounded-lg border-2 border-dashed transition-colors ${aadhaarFront ? "border-success bg-success/10" : "border-border hover:border-primary hover:bg-secondary/50"}`}>
                        {aadhaarFront ? (
                          <>
                            <Check className="h-5 w-5 text-success" />
                            <span className="text-xs truncate max-w-[100px]">{aadhaarFront.name}</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Front side</span>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, "aadhaar-front")}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Aadhaar Card Back</Label>
                  <div className="mt-2">
                    <label className="cursor-pointer block">
                      <div className={`flex items-center justify-center gap-3 p-6 rounded-lg border-2 border-dashed transition-colors ${aadhaarBack ? "border-success bg-success/10" : "border-border hover:border-primary hover:bg-secondary/50"}`}>
                        {aadhaarBack ? (
                          <>
                            <Check className="h-5 w-5 text-success" />
                            <span className="text-xs truncate max-w-[100px]">{aadhaarBack.name}</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Back side</span>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, "aadhaar-back")}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4">
            {currentStep > 0 ? (
              <Button type="button" variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            ) : (
              <Button type="button" variant="ghost" asChild>
                <Link to="/register">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
              </Button>
            )}

            {currentStep < steps.length - 1 ? (
              <Button type="button" onClick={nextStep} className="bg-success hover:bg-success/90">
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" variant="hero" disabled={isLoading} className="bg-success hover:bg-success/90">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>

      <p className="text-center mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </GlassCard>
  );
}
