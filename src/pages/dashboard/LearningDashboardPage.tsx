import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RecruiterFeedbackForm,
  LearningInsightsDashboard,
  QuestionEffectivenessChart,
  CrossRolePatterns,
  ReinforcementLearningPanel,
} from "@/components/feedback";
import {
  Brain,
  MessageSquare,
  BarChart3,
  Shuffle,
  Zap,
  Download,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for demonstration
const mockLearningMetrics = [
  { name: "Recommendation Accuracy", value: 87.3, previousValue: 84.1, unit: "%", target: 95 },
  { name: "False Positive Rate", value: 4.2, previousValue: 5.8, unit: "%", target: 2 },
  { name: "Candidate Satisfaction", value: 4.6, previousValue: 4.4, unit: "/5", target: 4.8 },
  { name: "Time to Decision", value: 2.3, previousValue: 2.8, unit: " days", target: 1.5 },
];

const mockQuestions = [
  {
    id: "1",
    questionText: "Explain the difference between a stack and a queue. When would you use each?",
    questionType: "DSA",
    jobField: "Software Engineering",
    differentiationScore: 92,
    predictionAccuracy: 89,
    avgTimeSpent: 180,
    timesAsked: 1250,
  },
  {
    id: "2",
    questionText: "Design a URL shortening service like bit.ly. What are the key components?",
    questionType: "System Design",
    jobField: "Software Engineering",
    differentiationScore: 88,
    predictionAccuracy: 85,
    avgTimeSpent: 420,
    timesAsked: 890,
  },
  {
    id: "3",
    questionText: "Tell me about a time you had to deal with a difficult team member.",
    questionType: "Behavioral",
    jobField: "General",
    differentiationScore: 76,
    predictionAccuracy: 72,
    avgTimeSpent: 240,
    timesAsked: 2100,
  },
  {
    id: "4",
    questionText: "What is the time complexity of searching in a balanced BST?",
    questionType: "DSA",
    jobField: "Software Engineering",
    differentiationScore: 45,
    predictionAccuracy: 68,
    avgTimeSpent: 60,
    timesAsked: 1800,
  },
  {
    id: "5",
    questionText: "Explain gradient descent and its variants.",
    questionType: "ML/AI",
    jobField: "Machine Learning",
    differentiationScore: 94,
    predictionAccuracy: 91,
    avgTimeSpent: 300,
    timesAsked: 560,
  },
];

const mockPatterns = [
  {
    id: "1",
    sourceRole: "Frontend Developer",
    targetRole: "Full Stack Developer",
    transferableSkills: ["JavaScript", "React", "API Integration", "UI/UX"],
    successRate: 87,
    sampleSize: 234,
    confidenceLevel: 92,
  },
  {
    id: "2",
    sourceRole: "Data Analyst",
    targetRole: "Data Scientist",
    transferableSkills: ["SQL", "Python", "Statistics", "Visualization"],
    successRate: 76,
    sampleSize: 156,
    confidenceLevel: 85,
  },
  {
    id: "3",
    sourceRole: "Backend Developer",
    targetRole: "DevOps Engineer",
    transferableSkills: ["Linux", "Scripting", "Databases", "Cloud Services"],
    successRate: 72,
    sampleSize: 189,
    confidenceLevel: 88,
  },
  {
    id: "4",
    sourceRole: "QA Engineer",
    targetRole: "SDET",
    transferableSkills: ["Testing", "Automation", "Python/Java", "CI/CD"],
    successRate: 91,
    sampleSize: 98,
    confidenceLevel: 79,
  },
];

const mockSuggestions = [
  {
    id: "1",
    candidateName: "Priya Sharma",
    candidateId: "c1",
    originalRole: "Junior Developer",
    suggestedRole: "QA Automation Engineer",
    matchScore: 89,
    matchingSkills: ["Selenium", "Python", "Detail-oriented", "Testing mindset"],
    reason: "Strong testing skills demonstrated during coding challenges. Caught multiple edge cases that developers typically miss.",
  },
  {
    id: "2",
    candidateName: "Rahul Verma",
    candidateId: "c2",
    originalRole: "Data Analyst",
    suggestedRole: "Business Intelligence Developer",
    matchScore: 85,
    matchingSkills: ["SQL", "Tableau", "Business acumen", "Stakeholder communication"],
    reason: "Excellent at translating technical insights to business value. Strong presentation skills.",
  },
];

const mockRLMetrics = [
  {
    id: "1",
    name: "Follow-up Effectiveness",
    description: "How well follow-up questions reveal candidate capabilities",
    currentValue: 84,
    previousValue: 78,
    target: 90,
    unit: "%",
    category: "strategy" as const,
  },
  {
    id: "2",
    name: "Question Sequencing",
    description: "Optimal ordering of questions based on candidate responses",
    currentValue: 79,
    previousValue: 72,
    target: 85,
    unit: "%",
    category: "strategy" as const,
  },
  {
    id: "3",
    name: "Time Allocation",
    description: "Efficient distribution of time across interview sections",
    currentValue: 88,
    previousValue: 85,
    target: 92,
    unit: "%",
    category: "timing" as const,
  },
  {
    id: "4",
    name: "Question Timeout Handling",
    description: "Graceful transitions when candidates struggle",
    currentValue: 91,
    previousValue: 87,
    target: 95,
    unit: "%",
    category: "timing" as const,
  },
  {
    id: "5",
    name: "Fraud Pattern Detection",
    description: "Identification of cheating or impersonation",
    currentValue: 97.3,
    previousValue: 94.8,
    target: 99,
    unit: "%",
    category: "fraud" as const,
  },
  {
    id: "6",
    name: "New Fraud Adaptation",
    description: "Speed of learning new cheating patterns",
    currentValue: 72,
    previousValue: 65,
    target: 85,
    unit: "%",
    category: "fraud" as const,
  },
  {
    id: "7",
    name: "Question Differentiation",
    description: "How well questions separate strong from weak candidates",
    currentValue: 86,
    previousValue: 82,
    target: 90,
    unit: "%",
    category: "quality" as const,
  },
];

export default function LearningDashboardPage() {
  const [activeTab, setActiveTab] = useState("insights");
  const { toast } = useToast();

  const handleFeedbackSubmit = async (feedback: any) => {
    console.log("Feedback submitted:", feedback);
    // In real implementation, this would save to the database
  };

  const handleExportReport = () => {
    toast({
      title: "Report exported",
      description: "Learning metrics report has been downloaded",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Learning & Feedback</h1>
          <p className="text-muted-foreground">
            AI model training insights and recruiter feedback
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1">
            <Brain className="h-3 w-3" />
            Model v3.2.1
          </Badge>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="insights" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Feedback
          </TabsTrigger>
          <TabsTrigger value="questions" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Questions
          </TabsTrigger>
          <TabsTrigger value="patterns" className="gap-2">
            <Shuffle className="h-4 w-4" />
            Patterns
          </TabsTrigger>
          <TabsTrigger value="reinforcement" className="gap-2">
            <Zap className="h-4 w-4" />
            RL Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="mt-6">
          <LearningInsightsDashboard
            metrics={mockLearningMetrics}
            totalFeedback={12847}
            modelVersion="v3.2.1"
            lastTrainingDate="2 days ago"
            improvementRate={3.8}
          />
        </TabsContent>

        <TabsContent value="feedback" className="mt-6">
          <div className="max-w-2xl mx-auto">
            <RecruiterFeedbackForm
              applicationId="app-123"
              candidateName="Amit Kumar"
              jobTitle="Senior Software Engineer"
              aiRecommendation="shortlist"
              aiConfidence={87}
              onSubmit={handleFeedbackSubmit}
            />
          </div>
        </TabsContent>

        <TabsContent value="questions" className="mt-6">
          <QuestionEffectivenessChart questions={mockQuestions} />
        </TabsContent>

        <TabsContent value="patterns" className="mt-6">
          <CrossRolePatterns
            patterns={mockPatterns}
            suggestions={mockSuggestions}
          />
        </TabsContent>

        <TabsContent value="reinforcement" className="mt-6">
          <ReinforcementLearningPanel
            metrics={mockRLMetrics}
            lastUpdateTime="3 hours ago"
            totalIterations={1247892}
            convergenceRate={94.7}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
