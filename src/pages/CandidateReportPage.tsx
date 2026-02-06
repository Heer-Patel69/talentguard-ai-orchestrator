import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { TrustScoreBadge } from "@/components/ui/trust-indicators";
import { PageBackground, Container } from "@/components/ui/layout";
import { Navbar } from "@/components/layout/Navbar";
import { CodePlayback } from "@/components/report/CodePlayback";
import { DecisionReasoning } from "@/components/report/DecisionReasoning";
import { InterviewTranscript } from "@/components/report/InterviewTranscript";
import { ProctorEvents } from "@/components/report/ProctorEvents";
import {
  ArrowLeft,
  Download,
  Share2,
  Mail,
  Calendar,
  Clock,
  Briefcase,
  GraduationCap,
  Github,
  Linkedin,
  Video,
} from "lucide-react";

// Mock data
const mockCandidate = {
  id: "1",
  name: "Sarah Chen",
  email: "sarah.chen@email.com",
  role: "Senior Frontend Developer",
  experience: "5 years",
  appliedDate: "Jan 15, 2024",
  interviewDate: "Jan 18, 2024",
  duration: "58:22",
  trustScore: 94,
  linkedIn: "https://linkedin.com/in/sarahchen",
  github: "https://github.com/sarahchen",
};

const mockCodeSnapshots = [
  { timestamp: 0, code: "// Starting code...", event: "type" as const },
  { timestamp: 5, code: "function longestPalindrome(s) {", event: "type" as const },
  { timestamp: 12, code: "function longestPalindrome(s) {\n  if (s.length < 2) return s;", event: "type" as const },
  { timestamp: 20, code: "function longestPalindrome(s) {\n  if (s.length < 2) return s;\n  \n  let start = 0, maxLen = 1;", event: "type" as const },
  { timestamp: 35, code: "function longestPalindrome(s) {\n  if (s.length < 2) return s;\n  \n  let start = 0, maxLen = 1;\n  \n  function expandAroundCenter(left, right) {\n    while (left >= 0 && right < s.length && s[left] === s[right]) {\n      left--;\n      right++;\n    }\n    return right - left - 1;\n  }", event: "type" as const },
  { timestamp: 45, code: "function longestPalindrome(s) {\n  if (s.length < 2) return s;\n  \n  let start = 0, maxLen = 1;\n  \n  function expandAroundCenter(left, right) {\n    while (left >= 0 && right < s.length && s[left] === s[right]) {\n      left--;\n      right++;\n    }\n    return right - left - 1;\n  }\n  \n  for (let i = 0; i < s.length; i++) {\n    const len1 = expandAroundCenter(i, i);\n    const len2 = expandAroundCenter(i, i + 1);\n    const len = Math.max(len1, len2);\n    \n    if (len > maxLen) {\n      maxLen = len;\n      start = i - Math.floor((len - 1) / 2);\n    }\n  }", event: "type" as const },
  { timestamp: 55, code: "function longestPalindrome(s) {\n  if (s.length < 2) return s;\n  \n  let start = 0, maxLen = 1;\n  \n  function expandAroundCenter(left, right) {\n    while (left >= 0 && right < s.length && s[left] === s[right]) {\n      left--;\n      right++;\n    }\n    return right - left - 1;\n  }\n  \n  for (let i = 0; i < s.length; i++) {\n    const len1 = expandAroundCenter(i, i);\n    const len2 = expandAroundCenter(i, i + 1);\n    const len = Math.max(len1, len2);\n    \n    if (len > maxLen) {\n      maxLen = len;\n      start = i - Math.floor((len - 1) / 2);\n    }\n  }\n  \n  return s.substring(start, start + maxLen);\n}", event: "type" as const },
];

const mockCriteria = [
  {
    name: "Problem Solving",
    score: 9,
    maxScore: 10,
    trend: "up" as const,
    feedback: "Excellent approach to breaking down the problem. Used expand-around-center technique efficiently.",
  },
  {
    name: "Code Quality",
    score: 8,
    maxScore: 10,
    trend: "neutral" as const,
    feedback: "Clean, readable code with good variable naming. Could improve with more comments.",
  },
  {
    name: "Communication",
    score: 9,
    maxScore: 10,
    trend: "up" as const,
    feedback: "Clearly explained thought process throughout. Asked clarifying questions when needed.",
  },
  {
    name: "Time Management",
    score: 7,
    maxScore: 10,
    trend: "down" as const,
    feedback: "Completed within time limit but took longer on initial approach before pivoting.",
  },
  {
    name: "Technical Knowledge",
    score: 9,
    maxScore: 10,
    trend: "up" as const,
    feedback: "Strong understanding of string algorithms and time complexity analysis.",
  },
];

const mockTranscript = [
  { id: "1", role: "ai" as const, content: "Hello Sarah! Welcome to your technical interview. Today we'll work through a coding challenge. Are you ready to begin?", timestamp: "00:00:15", round: "Introduction" },
  { id: "2", role: "user" as const, content: "Yes, I'm ready. Looking forward to it!", timestamp: "00:00:22", round: "Introduction" },
  { id: "3", role: "ai" as const, content: "Great! Here's your challenge: Implement a function that finds the longest palindromic substring in a given string. Take a moment to think about your approach before coding.", timestamp: "00:00:30", round: "Technical Round" },
  { id: "4", role: "user" as const, content: "So I need to find the longest substring that reads the same forwards and backwards. Let me think about this... I could use a brute force approach checking all substrings, but that would be O(n³). A better approach would be to expand around each character as a potential center.", timestamp: "00:01:15", round: "Technical Round" },
  { id: "5", role: "ai" as const, content: "That's a great observation about the time complexity. Can you elaborate on the expand-around-center approach?", timestamp: "00:01:45", round: "Technical Round" },
  { id: "6", role: "user" as const, content: "Sure! For each character, I treat it as the center of a potential palindrome and expand outwards while the characters match. I need to handle both odd-length palindromes (single center) and even-length ones (double center).", timestamp: "00:02:30", round: "Technical Round", flagged: true, flagReason: "Brief pause detected" },
  { id: "7", role: "ai" as const, content: "Excellent explanation! Please go ahead and implement your solution.", timestamp: "00:03:00", round: "Technical Round" },
  { id: "8", role: "user" as const, content: "I'll start with the base case for empty or single character strings, then implement the expandAroundCenter helper function...", timestamp: "00:03:30", round: "Technical Round" },
  { id: "9", role: "ai" as const, content: "I see you've completed the implementation. Can you walk me through your solution and explain the time and space complexity?", timestamp: "00:15:00", round: "Technical Round" },
  { id: "10", role: "user" as const, content: "The time complexity is O(n²) because for each of the n characters, we potentially expand up to n times. Space complexity is O(1) since we only use a few variables regardless of input size.", timestamp: "00:16:00", round: "Technical Round" },
  { id: "11", role: "ai" as const, content: "Perfect analysis! Now let's move on to discuss a system design question. How would you design a real-time collaborative code editor?", timestamp: "00:20:00", round: "System Design" },
  { id: "12", role: "user" as const, content: "I'd start by considering the key challenges: real-time synchronization, conflict resolution, and scalability. For sync, I'd use Operational Transformation or CRDTs...", timestamp: "00:20:45", round: "System Design" },
];

const mockProctorEvents = [
  { id: "1", type: "verified" as const, timestamp: "00:00:00", description: "Identity verified successfully", severity: "info" as const },
  { id: "2", type: "verified" as const, timestamp: "00:00:05", description: "Liveness check passed", severity: "info" as const },
  { id: "3", type: "gaze" as const, timestamp: "00:05:23", description: "Brief gaze deviation detected", severity: "low" as const },
  { id: "4", type: "gaze" as const, timestamp: "00:12:45", description: "Looking away from screen (2.3s)", severity: "medium" as const },
  { id: "5", type: "verified" as const, timestamp: "00:25:00", description: "Face continuously detected", severity: "info" as const },
  { id: "6", type: "verified" as const, timestamp: "00:58:22", description: "Session completed normally", severity: "info" as const },
];

export default function CandidateReportPage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen pb-12">
      <PageBackground pattern="dots" />
      <Navbar />

      <Container className="pt-28">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/dashboard"
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-xl font-bold">
                SC
              </div>
              <div>
                <h1 className="text-2xl font-bold">{mockCandidate.name}</h1>
                <p className="text-muted-foreground">{mockCandidate.role}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {mockCandidate.experience}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {mockCandidate.interviewDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {mockCandidate.duration}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <TrustScoreBadge score={mockCandidate.trustScore} size="lg" />
              <div className="flex gap-2">
                <Button variant="outline" size="icon" asChild>
                  <a href={mockCandidate.linkedIn} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a href={mockCandidate.github} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline">
                  <Video className="mr-2 h-4 w-4" />
                  Watch Recording
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
                <Button variant="hero">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Report
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Decision & Proctoring */}
          <div className="space-y-6 lg:col-span-1">
            <DecisionReasoning
              decision="hire"
              confidence={92}
              overallScore={mockCandidate.trustScore}
              criteria={mockCriteria}
              summary="Sarah demonstrated exceptional problem-solving skills and clear communication throughout the interview. Her approach to the palindrome problem showed strong algorithmic thinking, and she effectively explained trade-offs in the system design discussion. Minor improvement areas include time management during initial problem exploration."
              strengths={[
                "Strong algorithmic problem-solving",
                "Clear and concise communication",
                "Good understanding of time/space complexity",
                "Asked relevant clarifying questions",
              ]}
              weaknesses={[
                "Initial hesitation on approach selection",
                "Could add more inline comments",
                "Slightly over time budget on first problem",
              ]}
            />

            <ProctorEvents events={mockProctorEvents} />
          </div>

          {/* Right Column - Code Playback & Transcript */}
          <div className="space-y-6 lg:col-span-2">
            <CodePlayback snapshots={mockCodeSnapshots} />
            <InterviewTranscript messages={mockTranscript} />
          </div>
        </div>
      </Container>
    </div>
  );
}
