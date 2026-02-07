import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { TrustScoreBadge } from "@/components/ui/trust-indicators";
import { CodePlayback } from "@/components/report/CodePlayback";
import { InterviewTranscript } from "@/components/report/InterviewTranscript";
import { ProctorEvents } from "@/components/report/ProctorEvents";
import {
  CandidateScoreSummary,
  RoundScoreCard,
  QuestionScoreCard,
  AuditLogTable,
} from "@/components/scoring";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Download,
  Share2,
  Mail,
  Calendar,
  Clock,
  Briefcase,
  Github,
  Linkedin,
  Video,
  FileText,
  ChevronDown,
  Loader2,
  FileDown,
} from "lucide-react";
import { downloadCandidateReport } from "@/lib/pdf-generator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for development (will be replaced with real data)
const mockCodeSnapshots = [
  { timestamp: 0, code: "// Starting code...", event: "type" as const },
  { timestamp: 5, code: "function longestPalindrome(s) {", event: "type" as const },
  { timestamp: 12, code: "function longestPalindrome(s) {\n  if (s.length < 2) return s;", event: "type" as const },
  { timestamp: 20, code: "function longestPalindrome(s) {\n  if (s.length < 2) return s;\n  \n  let start = 0, maxLen = 1;", event: "type" as const },
  { timestamp: 35, code: "function longestPalindrome(s) {\n  if (s.length < 2) return s;\n  \n  let start = 0, maxLen = 1;\n  \n  function expandAroundCenter(left, right) {\n    while (left >= 0 && right < s.length && s[left] === s[right]) {\n      left--;\n      right++;\n    }\n    return right - left - 1;\n  }", event: "type" as const },
];

const mockProctorEvents = [
  { id: "1", type: "verified" as const, timestamp: "00:00:00", description: "Identity verified successfully", severity: "info" as const },
  { id: "2", type: "verified" as const, timestamp: "00:00:05", description: "Liveness check passed", severity: "info" as const },
  { id: "3", type: "gaze" as const, timestamp: "00:05:23", description: "Brief gaze deviation detected", severity: "low" as const },
  { id: "4", type: "gaze" as const, timestamp: "00:12:45", description: "Looking away from screen (2.3s)", severity: "medium" as const },
  { id: "5", type: "verified" as const, timestamp: "00:25:00", description: "Face continuously detected", severity: "info" as const },
];

const mockTranscript = [
  { id: "1", role: "ai" as const, content: "Hello! Welcome to your technical interview. Are you ready to begin?", timestamp: "00:00:15", round: "Introduction" },
  { id: "2", role: "user" as const, content: "Yes, I'm ready. Looking forward to it!", timestamp: "00:00:22", round: "Introduction" },
  { id: "3", role: "ai" as const, content: "Great! Here's your challenge: Implement a function that finds the longest palindromic substring.", timestamp: "00:00:30", round: "Technical Round" },
  { id: "4", role: "user" as const, content: "I'll use an expand-around-center approach for O(n²) time complexity.", timestamp: "00:01:15", round: "Technical Round" },
];

// Generate mock scores for development
const generateMockData = () => ({
  candidateScore: {
    id: "mock-1",
    final_score: 78,
    percentile_rank: 75,
    technical_score: 82,
    communication_score: 88,
    problem_solving_score: 72,
    recommendation: "shortlist" as const,
    recommendation_reason: "Candidate demonstrated strong technical skills with a score of 82/100. Excellent communication clarity (88/100) and solid problem-solving approach. Minor improvements needed in time management. Recommended for next round interview.",
    recommendation_confidence: 0.87,
    overall_summary: "Strong candidate with excellent communication skills. Demonstrated deep understanding of algorithmic concepts and clean coding practices. Showed ability to think through problems methodically and explain solutions clearly.",
    strengths: [
      "Strong algorithmic problem-solving skills",
      "Clear and concise communication",
      "Good understanding of time/space complexity",
      "Asked relevant clarifying questions",
      "Clean, readable code structure",
    ],
    weaknesses: [
      "Initial hesitation on approach selection",
      "Could add more inline comments",
      "Slightly over time budget on first problem",
    ],
    improvement_suggestions: [
      "Practice more medium-difficulty dynamic programming problems",
      "Work on reducing initial thinking time",
      "Add more comments to explain complex logic",
    ],
    risk_flags: null,
    risk_explanations: null,
    rank_among_applicants: 3,
    total_applicants: 15,
  },
  roundScores: [
    {
      id: "round-1",
      round_number: 1,
      base_score: 75,
      clarifying_questions_bonus: 5,
      optimization_bonus: 10,
      edge_cases_bonus: 5,
      fraud_penalty: 0,
      hints_penalty: 5,
      final_score: 90,
      weight: 1.0,
      strengths: ["Excellent algorithm choice", "Clear explanation of approach"],
      weaknesses: ["Used one hint for edge case"],
      improvement_suggestions: ["Practice more edge case identification"],
    },
    {
      id: "round-2",
      round_number: 2,
      base_score: 68,
      clarifying_questions_bonus: 5,
      optimization_bonus: 0,
      edge_cases_bonus: 0,
      fraud_penalty: 0,
      hints_penalty: 0,
      final_score: 73,
      weight: 1.0,
      strengths: ["Good system design fundamentals"],
      weaknesses: ["Could improve scalability analysis"],
      improvement_suggestions: ["Study distributed systems patterns"],
    },
  ],
  questionScores: [
    {
      id: "q-1",
      question_number: 1,
      question_text: "Implement a function to find the longest palindromic substring in a given string.",
      candidate_answer: "function longestPalindrome(s) {\n  if (s.length < 2) return s;\n  let start = 0, maxLen = 1;\n  // ... expand around center approach\n}",
      technical_accuracy: 90,
      code_quality: 85,
      communication_clarity: 92,
      problem_solving: 88,
      time_efficiency: 70,
      weighted_score: 85,
      ai_evaluation: "Candidate implemented an efficient O(n²) solution using the expand-around-center technique. The approach is correct and handles both odd and even length palindromes.",
      ai_reasoning: "The solution demonstrates strong understanding of string manipulation and optimization. The candidate correctly identified that brute force would be O(n³) and optimized to O(n²).",
      score_justification: "High marks for technical accuracy and communication. Slight deduction for time efficiency as the initial approach consideration took longer than expected.",
      time_taken_seconds: 720,
      hints_used: 1,
    },
    {
      id: "q-2",
      question_number: 2,
      question_text: "How would you design a real-time collaborative code editor like Google Docs?",
      candidate_answer: "I would use Operational Transformation or CRDTs for conflict resolution. The architecture would include WebSocket connections for real-time sync, a central server for coordination, and optimistic updates on the client side.",
      technical_accuracy: 75,
      code_quality: 0,
      communication_clarity: 88,
      problem_solving: 72,
      time_efficiency: 80,
      weighted_score: 73,
      ai_evaluation: "Candidate showed good foundational knowledge of real-time collaboration systems. Mentioned key concepts like OT and CRDTs but could have gone deeper into implementation details.",
      ai_reasoning: "The high-level architecture is solid, but more depth was expected on scalability concerns and specific technology choices.",
      score_justification: "Good communication and reasonable approach. Lower technical score due to missing depth on distributed systems aspects.",
      time_taken_seconds: 600,
      hints_used: 0,
    },
  ],
  auditLogs: [
    {
      id: "log-1",
      action_type: "score_calculated",
      action_description: "Question 1 scores calculated using AI evaluation model",
      decision_made: null,
      factors_considered: { technical: 90, communication: 92 },
      model_version: "v1.0",
      confidence_score: 0.92,
      created_at: new Date().toISOString(),
    },
    {
      id: "log-2",
      action_type: "score_calculated",
      action_description: "Question 2 scores calculated using AI evaluation model",
      decision_made: null,
      factors_considered: { technical: 75, communication: 88 },
      model_version: "v1.0",
      confidence_score: 0.88,
      created_at: new Date().toISOString(),
    },
    {
      id: "log-3",
      action_type: "decision_made",
      action_description: "Final recommendation generated based on overall performance",
      decision_made: "shortlist",
      factors_considered: { final_score: 78, fraud_flags: 0, threshold: 70 },
      model_version: "v1.0",
      confidence_score: 0.87,
      created_at: new Date().toISOString(),
    },
    {
      id: "log-4",
      action_type: "report_generated",
      action_description: "Comprehensive candidate report generated",
      decision_made: null,
      factors_considered: null,
      model_version: "v1.0",
      confidence_score: null,
      created_at: new Date().toISOString(),
    },
  ],
});

export default function InterviewerCandidateReportPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [candidateInfo, setCandidateInfo] = useState<{
    name: string;
    email: string;
    role: string;
    experience: string;
    appliedDate: string;
    interviewDate: string;
    duration: string;
    linkedIn: string | null;
    github: string | null;
  } | null>(null);

  // For now, use mock data for scores (will be populated by agents later)
  const mockData = generateMockData();
  const [candidateScore] = useState(mockData.candidateScore);
  const [roundScores] = useState(mockData.roundScores);
  const [questionScores] = useState(mockData.questionScores);
  const [auditLogs] = useState(mockData.auditLogs);

  useEffect(() => {
    if (id) {
      fetchCandidateData();
    }
  }, [id]);

  const fetchCandidateData = async () => {
    try {
      // Fetch application with related data
      const { data: application, error } = await supabase
        .from("applications")
        .select(`
          id,
          status,
          current_round,
          applied_at,
          candidate_id,
          job:jobs(id, title, field)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;

      if (!application) {
        toast({
          title: "Not Found",
          description: "Application not found",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Fetch candidate profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", application.candidate_id)
        .maybeSingle();

      const { data: candidateProfile } = await supabase
        .from("candidate_profiles")
        .select("github_url, linkedin_url, experience_years")
        .eq("user_id", application.candidate_id)
        .maybeSingle();

      const jobData = application.job as any;

      setCandidateInfo({
        name: profile?.full_name || "Unknown Candidate",
        email: profile?.email || "",
        role: jobData?.title || "Unknown Position",
        experience: candidateProfile?.experience_years 
          ? `${candidateProfile.experience_years} years` 
          : "N/A",
        appliedDate: application.applied_at 
          ? new Date(application.applied_at).toLocaleDateString() 
          : "N/A",
        interviewDate: "Pending",
        duration: "N/A",
        linkedIn: candidateProfile?.linkedin_url || null,
        github: candidateProfile?.github_url || null,
      });
    } catch (error) {
      console.error("Error fetching candidate data:", error);
      toast({
        title: "Error",
        description: "Failed to load candidate data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!candidateInfo) return;

    downloadCandidateReport({
      candidateName: candidateInfo.name,
      email: candidateInfo.email,
      role: candidateInfo.role,
      appliedDate: candidateInfo.appliedDate,
      interviewDate: candidateInfo.interviewDate,
      experience: candidateInfo.experience,
      finalScore: candidateScore.final_score,
      technicalScore: candidateScore.technical_score,
      communicationScore: candidateScore.communication_score,
      problemSolvingScore: candidateScore.problem_solving_score,
      recommendation: candidateScore.recommendation,
      recommendationReason: candidateScore.recommendation_reason,
      strengths: candidateScore.strengths,
      weaknesses: candidateScore.weaknesses,
      improvements: candidateScore.improvement_suggestions,
      roundScores: roundScores.map((r) => ({
        roundNumber: r.round_number,
        roundType: r.round_number === 1 ? "Technical" : "System Design",
        score: r.final_score,
        strengths: r.strengths || [],
        weaknesses: r.weaknesses || [],
      })),
      questionScores: questionScores.map((q) => ({
        questionNumber: q.question_number,
        questionText: q.question_text,
        score: q.weighted_score,
        aiEvaluation: q.ai_evaluation,
      })),
    });

    toast({
      title: "PDF Downloaded!",
      description: "The candidate report has been saved.",
    });
  };

  const handleExportCSV = () => {
    toast({
      title: "Exporting CSV...",
      description: "Your audit log will be downloaded shortly.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!candidateInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Candidate Not Found</h2>
        <p className="text-muted-foreground">The requested application could not be found.</p>
        <Button asChild>
          <Link to="/dashboard/candidates">Back to Candidates</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Link
            to="/dashboard/candidates"
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Candidates
          </Link>

          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-xl font-bold text-white">
              {candidateInfo.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{candidateInfo.name}</h1>
              <p className="text-muted-foreground">{candidateInfo.role}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {candidateInfo.experience}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Applied: {candidateInfo.appliedDate}
                </span>
                {candidateInfo.duration !== "N/A" && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {candidateInfo.duration}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {candidateInfo.linkedIn && (
            <Button variant="outline" size="sm" asChild>
              <a href={candidateInfo.linkedIn} target="_blank" rel="noopener noreferrer">
                <Linkedin className="mr-2 h-4 w-4" />
                LinkedIn
              </a>
            </Button>
          )}
          {candidateInfo.github && (
            <Button variant="outline" size="sm" asChild>
              <a href={candidateInfo.github} target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Video className="mr-2 h-4 w-4" />
            Recording
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rounds">Round Scores</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <CandidateScoreSummary
                score={candidateScore}
                candidateName={candidateInfo.name}
              />
            </div>
            <div className="space-y-6">
              <ProctorEvents events={mockProctorEvents} />
            </div>
          </div>
        </TabsContent>

        {/* Round Scores Tab */}
        <TabsContent value="rounds" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {roundScores.map((round) => (
              <RoundScoreCard
                key={round.id}
                score={round}
                roundType={round.round_number === 1 ? "coding" : "system_design"}
                onClick={() => setSelectedRound(round.round_number)}
              />
            ))}
          </div>

          {selectedRound && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <GlassCard>
                <h3 className="text-lg font-semibold mb-4">
                  Round {selectedRound} - Question Details
                </h3>
                <div className="space-y-4">
                  {questionScores
                    .filter((q) => q.question_number <= selectedRound)
                    .map((q, i) => (
                      <QuestionScoreCard key={q.id} score={q} index={i} />
                    ))}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="mt-6">
          <div className="space-y-4">
            {questionScores.map((q, i) => (
              <QuestionScoreCard key={q.id} score={q} index={i} />
            ))}
          </div>
        </TabsContent>

        {/* Transcript Tab */}
        <TabsContent value="transcript" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <InterviewTranscript messages={mockTranscript} />
            <CodePlayback snapshots={mockCodeSnapshots} />
          </div>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="mt-6">
          <AuditLogTable
            logs={auditLogs}
            onExportPDF={handleExportPDF}
            onExportCSV={handleExportCSV}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
