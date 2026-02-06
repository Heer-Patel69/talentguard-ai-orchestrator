import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import { StepIndicator } from "@/components/ui/step-indicator";
import { PageBackground, Container } from "@/components/ui/layout";
import { Navbar } from "@/components/layout/Navbar";
import {
  Upload,
  Camera,
  Mic,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Linkedin,
  Github,
  User,
  Phone,
  Briefcase,
} from "lucide-react";

const steps = ["Personal Info", "Professional", "Identity Check", "Complete"];

interface FormData {
  fullName: string;
  mobile: string;
  email: string;
  linkedinUrl: string;
  githubUrl: string;
  experience: string;
  resume: File | null;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    mobile: "",
    email: "",
    linkedinUrl: "",
    githubUrl: "",
    experience: "",
    resume: null,
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [livenessChecked, setLivenessChecked] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSendOtp = () => {
    // Simulate OTP sending
    setOtpSent(true);
  };

  const requestCameraPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermission(true);
    } catch {
      setCameraPermission(false);
    }
  };

  const requestMicPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission(true);
    } catch {
      setMicPermission(false);
    }
  };

  const handleLivenessCheck = () => {
    // Simulate liveness check
    setTimeout(() => setLivenessChecked(true), 2000);
  };

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      handleInputChange("resume", file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleInputChange("resume", file);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    navigate("/interview");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Full Name
              </Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@company.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Mobile Number
              </Label>
              <div className="flex gap-2">
                <Input
                  id="mobile"
                  placeholder="+1 (555) 123-4567"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange("mobile", e.target.value)}
                  className="h-12 flex-1"
                />
                <Button
                  variant={otpSent ? "success" : "default"}
                  onClick={handleSendOtp}
                  disabled={!formData.mobile || otpSent}
                  className="h-12 px-6"
                >
                  {otpSent ? "Sent" : "Send OTP"}
                </Button>
              </div>
            </div>

            {otpSent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="h-12 text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </motion.div>
            )}
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-muted-foreground" />
                LinkedIn Profile URL
              </Label>
              <Input
                id="linkedin"
                placeholder="https://linkedin.com/in/johndoe"
                value={formData.linkedinUrl}
                onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="github" className="flex items-center gap-2">
                <Github className="h-4 w-4 text-muted-foreground" />
                GitHub Repository URL
              </Label>
              <Input
                id="github"
                placeholder="https://github.com/johndoe"
                value={formData.githubUrl}
                onChange={(e) => handleInputChange("githubUrl", e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                Total Experience (Years)
              </Label>
              <Input
                id="experience"
                type="number"
                placeholder="5"
                value={formData.experience}
                onChange={(e) => handleInputChange("experience", e.target.value)}
                className="h-12"
                min="0"
                max="50"
              />
            </div>

            <div className="space-y-2">
              <Label>Resume (PDF only)</Label>
              <div
                onDrop={handleFileDrop}
                onDragOver={(e) => e.preventDefault()}
                className="group relative cursor-pointer rounded-xl border-2 border-dashed border-border bg-secondary/30 p-8 text-center transition-colors hover:border-primary/50 hover:bg-secondary/50"
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                {formData.resume ? (
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-success" />
                    <div className="text-left">
                      <p className="font-medium">{formData.resume.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(formData.resume.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground transition-colors group-hover:text-primary" />
                    <p className="mt-4 font-medium">
                      Drag & drop your resume here
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      or click to browse (PDF only)
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="mb-2 text-xl font-semibold">Identity Verification</h3>
              <p className="text-muted-foreground">
                Please grant camera and microphone access for the proctored interview
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <GlassCard
                className={`cursor-pointer text-center ${
                  cameraPermission === true ? "border-success/50" : ""
                }`}
                onClick={requestCameraPermission}
              >
                <div
                  className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                    cameraPermission === true
                      ? "bg-success/20"
                      : cameraPermission === false
                      ? "bg-danger/20"
                      : "bg-secondary"
                  }`}
                >
                  <Camera
                    className={`h-8 w-8 ${
                      cameraPermission === true
                        ? "text-success"
                        : cameraPermission === false
                        ? "text-danger"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
                <p className="font-medium">Camera Access</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {cameraPermission === true
                    ? "Access granted"
                    : cameraPermission === false
                    ? "Access denied"
                    : "Click to enable"}
                </p>
              </GlassCard>

              <GlassCard
                className={`cursor-pointer text-center ${
                  micPermission === true ? "border-success/50" : ""
                }`}
                onClick={requestMicPermission}
              >
                <div
                  className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                    micPermission === true
                      ? "bg-success/20"
                      : micPermission === false
                      ? "bg-danger/20"
                      : "bg-secondary"
                  }`}
                >
                  <Mic
                    className={`h-8 w-8 ${
                      micPermission === true
                        ? "text-success"
                        : micPermission === false
                        ? "text-danger"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
                <p className="font-medium">Microphone Access</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {micPermission === true
                    ? "Access granted"
                    : micPermission === false
                    ? "Access denied"
                    : "Click to enable"}
                </p>
              </GlassCard>
            </div>

            {cameraPermission && micPermission && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-secondary/50 p-6"
              >
                <h4 className="mb-4 text-center font-semibold">Liveness Check</h4>
                {!livenessChecked ? (
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-secondary">
                      <div className="h-24 w-24 rounded-full bg-gradient-primary opacity-50" />
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Move your head slowly left and right to verify you're human
                    </p>
                    <Button onClick={handleLivenessCheck}>Start Liveness Check</Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3 text-success">
                    <CheckCircle2 className="h-6 w-6" />
                    <span className="font-medium">Liveness verified!</span>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/20">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h3 className="mb-2 text-2xl font-bold">Registration Complete!</h3>
            <p className="mb-8 text-muted-foreground">
              You're all set for your AI-powered interview. Click below to begin.
            </p>
            <Button variant="hero" size="xl" onClick={handleComplete}>
              Start Interview
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.fullName && formData.email && formData.mobile && otp.length === 6;
      case 1:
        return formData.linkedinUrl && formData.experience && formData.resume;
      case 2:
        return cameraPermission && micPermission && livenessChecked;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen">
      <PageBackground pattern="dots" />
      <Navbar />

      <Container className="pt-32">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <h1 className="mb-2 text-3xl font-bold">Candidate Registration</h1>
            <p className="text-muted-foreground">
              Complete your profile to begin the AI interview process
            </p>
          </motion.div>

          <StepIndicator steps={steps} currentStep={currentStep} className="mb-8" />

          <GlassCard elevated className="min-h-[400px]">
            <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>

            {currentStep < 3 && (
              <div className="mt-8 flex justify-between border-t border-border pt-6">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  variant="hero"
                  onClick={nextStep}
                  disabled={!canProceed()}
                >
                  {currentStep === 2 ? "Complete" : "Continue"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </GlassCard>
        </div>
      </Container>
    </div>
  );
}
