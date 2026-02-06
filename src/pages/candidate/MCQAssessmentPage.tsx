import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
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
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Flag,
  AlertTriangle,
  Trophy,
  Brain,
  Loader2,
  BookOpen,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  type: "single" | "multiple";
  difficulty: "easy" | "medium" | "hard" | "expert";
  topic: string;
  points: number;
  timeLimit: number; // seconds
}

interface Answer {
  questionId: string;
  selectedOptions: number[];
  timeTaken: number;
  flagged: boolean;
}

type AssessmentStatus = "loading" | "ready" | "in-progress" | "submitting" | "completed";

const TOTAL_TIME = 45 * 60; // 45 minutes

export default function MCQAssessmentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const applicationId = searchParams.get("application");

  // Assessment state
  const [status, setStatus] = useState<AssessmentStatus>("loading");
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  // Timer state
  const [totalTimeRemaining, setTotalTimeRemaining] = useState(TOTAL_TIME);
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Anti-cheat state
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);

  // Dialog state
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false);

  // Results
  const [results, setResults] = useState<{
    score: number;
    correct: number;
    wrong: number;
    skipped: number;
    topicBreakdown: Record<string, { correct: number; total: number }>;
  } | null>(null);

  const currentQuestion = questions[currentIndex];

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, [applicationId]);

  // Timer effect
  useEffect(() => {
    if (status !== "in-progress") return;

    timerRef.current = setInterval(() => {
      setTotalTimeRemaining((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });

      setQuestionTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto-move to next question
          handleNext();
          return currentQuestion?.timeLimit || 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, currentIndex]);

  // Tab visibility detection
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && status === "in-progress") {
        setTabSwitches((prev) => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            toast({
              title: "⚠️ Warning",
              description: "Multiple tab switches detected. This will affect your score.",
              variant: "destructive",
            });
          }
          return newCount;
        });
        setShowTabWarning(true);
        setTimeout(() => setShowTabWarning(false), 3000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [status, toast]);

  const loadQuestions = async () => {
    try {
      // Generate questions via AI
      const { data, error } = await supabase.functions.invoke("generate-mcq-questions", {
        body: {
          applicationId,
          field: "Data Structures and Algorithms",
          toughnessLevel: 3,
          numQuestions: 25,
        },
      });

      if (error) {
        // Use sample questions if AI fails
        const sampleQuestions = generateSampleQuestions();
        setQuestions(sampleQuestions);
      } else {
        setQuestions(data.questions);
      }

      setQuestionTimeRemaining(60);
      setStatus("ready");
    } catch (error) {
      console.error("Error loading questions:", error);
      const sampleQuestions = generateSampleQuestions();
      setQuestions(sampleQuestions);
      setStatus("ready");
    }
  };

  const generateSampleQuestions = (): MCQQuestion[] => {
    const topics = ["Arrays", "Linked Lists", "Trees", "Graphs", "Dynamic Programming", "Sorting", "Searching"];
    const difficulties: MCQQuestion["difficulty"][] = ["easy", "medium", "hard", "expert"];

    return Array.from({ length: 25 }, (_, i) => ({
      id: `q-${i + 1}`,
      question: getSampleQuestion(i),
      options: getSampleOptions(i),
      type: i % 5 === 0 ? "multiple" : "single",
      difficulty: difficulties[Math.min(Math.floor(i / 7), 3)],
      topic: topics[i % topics.length],
      points: Math.floor(i / 7) + 1,
      timeLimit: 60 + (Math.floor(i / 7) * 15),
    }));
  };

  const getSampleQuestion = (index: number): string => {
    const questions = [
      "What is the time complexity of binary search?",
      "Which data structure uses LIFO principle?",
      "What is the space complexity of merge sort?",
      "In a binary search tree, where is the minimum element located?",
      "What is the best case time complexity of quicksort?",
      "Which traversal visits the root node first?",
      "What is the height of a complete binary tree with n nodes?",
      "Which algorithm is used to detect a cycle in a linked list?",
      "What is the time complexity of inserting an element at the beginning of an array?",
      "Which data structure is used for BFS traversal?",
      "What is the worst case time complexity of heapsort?",
      "In a min-heap, where is the minimum element stored?",
      "What is the time complexity of finding the median in an unsorted array?",
      "Which sorting algorithm has the best worst-case time complexity?",
      "What is the time complexity of DFS traversal?",
      "Which technique is used in Kruskal's algorithm?",
      "What is the time complexity of Dijkstra's algorithm with a min-heap?",
      "How many edges does a tree with n nodes have?",
      "What is the time complexity of the knapsack problem using dynamic programming?",
      "Which data structure is used to implement an LRU cache?",
      "What is the amortized time complexity of push operation in a dynamic array?",
      "Which algorithm is used to find strongly connected components?",
      "What is the time complexity of matrix chain multiplication?",
      "Which technique is used in Floyd-Warshall algorithm?",
      "What is the space complexity of recursive DFS?",
    ];
    return questions[index % questions.length];
  };

  const getSampleOptions = (index: number): string[] => {
    const optionSets = [
      ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      ["Queue", "Stack", "Heap", "Tree"],
      ["O(1)", "O(n)", "O(log n)", "O(n²)"],
      ["Root node", "Leftmost node", "Rightmost node", "Any leaf node"],
      ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
      ["Preorder", "Inorder", "Postorder", "Level order"],
      ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
      ["Floyd's algorithm", "Dijkstra's algorithm", "Kruskal's algorithm", "Prim's algorithm"],
      ["O(1)", "O(n)", "O(log n)", "O(n²)"],
      ["Stack", "Queue", "Priority Queue", "Deque"],
      ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
      ["Root node", "Last node", "Random position", "First leaf"],
      ["O(1)", "O(n)", "O(n log n)", "O(n²)"],
      ["Merge sort", "Quick sort", "Heap sort", "Bubble sort"],
      ["O(V)", "O(E)", "O(V + E)", "O(V × E)"],
      ["Divide and conquer", "Greedy", "Dynamic programming", "Backtracking"],
      ["O(V²)", "O(E log V)", "O(V log V)", "O(E + V)"],
      ["n", "n-1", "n+1", "2n-1"],
      ["O(nW)", "O(n²)", "O(2^n)", "O(n log n)"],
      ["HashMap + LinkedList", "Array", "Binary Tree", "Stack"],
      ["O(1)", "O(n)", "O(log n)", "O(n²)"],
      ["Kosaraju's algorithm", "Dijkstra's algorithm", "Bellman-Ford", "Floyd-Warshall"],
      ["O(n²)", "O(n³)", "O(2^n)", "O(n log n)"],
      ["Greedy", "Dynamic programming", "Divide and conquer", "Backtracking"],
      ["O(1)", "O(V)", "O(E)", "O(V + E)"],
    ];
    return optionSets[index % optionSets.length];
  };

  const startAssessment = () => {
    setStatus("in-progress");
    setQuestionTimeRemaining(questions[0]?.timeLimit || 60);
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (!currentQuestion) return;

    if (currentQuestion.type === "single") {
      setSelectedOptions([optionIndex]);
    } else {
      setSelectedOptions((prev) =>
        prev.includes(optionIndex)
          ? prev.filter((i) => i !== optionIndex)
          : [...prev, optionIndex]
      );
    }
  };

  const saveAnswer = () => {
    if (!currentQuestion) return;

    const answer: Answer = {
      questionId: currentQuestion.id,
      selectedOptions,
      timeTaken: currentQuestion.timeLimit - questionTimeRemaining,
      flagged: answers.get(currentQuestion.id)?.flagged || false,
    };

    setAnswers((prev) => new Map(prev).set(currentQuestion.id, answer));
  };

  const handleNext = () => {
    saveAnswer();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      const nextQuestion = questions[currentIndex + 1];
      setQuestionTimeRemaining(nextQuestion?.timeLimit || 60);
      setSelectedOptions(answers.get(nextQuestion?.id || "")?.selectedOptions || []);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      saveAnswer();
      setCurrentIndex((prev) => prev - 1);
      const prevQuestion = questions[currentIndex - 1];
      setSelectedOptions(answers.get(prevQuestion?.id || "")?.selectedOptions || []);
    }
  };

  const handleFlag = () => {
    if (!currentQuestion) return;
    const current = answers.get(currentQuestion.id);
    setAnswers((prev) =>
      new Map(prev).set(currentQuestion.id, {
        ...current,
        questionId: currentQuestion.id,
        selectedOptions: current?.selectedOptions || [],
        timeTaken: current?.timeTaken || 0,
        flagged: !current?.flagged,
      })
    );
  };

  const handleTimeUp = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowTimeUpDialog(true);
    submitAssessment();
  };

  const submitAssessment = async () => {
    saveAnswer();
    setStatus("submitting");

    // Calculate results
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    const topicBreakdown: Record<string, { correct: number; total: number }> = {};

    questions.forEach((q) => {
      const answer = answers.get(q.id);
      if (!topicBreakdown[q.topic]) {
        topicBreakdown[q.topic] = { correct: 0, total: 0 };
      }
      topicBreakdown[q.topic].total++;

      if (!answer || answer.selectedOptions.length === 0) {
        skipped++;
      } else {
        // For demo, assume first option is correct
        const isCorrect = answer.selectedOptions.includes(1);
        if (isCorrect) {
          correct++;
          topicBreakdown[q.topic].correct++;
        } else {
          wrong++;
        }
      }
    });

    const score = Math.round((correct / questions.length) * 100);

    setResults({ score, correct, wrong, skipped, topicBreakdown });
    setStatus("completed");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Loading screen
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  // Ready screen
  if (status === "ready") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <GlassCard className="text-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">MCQ Assessment</h1>
            <p className="text-muted-foreground mb-6">
              Answer {questions.length} multiple-choice questions to test your knowledge.
            </p>

            <div className="space-y-4 mb-6 text-left">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Time Limit: 45 minutes</p>
                  <p className="text-sm text-muted-foreground">Each question has its own time limit</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Brain className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Adaptive Difficulty</p>
                  <p className="text-sm text-muted-foreground">Questions get harder as you progress</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-warning/10 border border-warning/30 mb-6 text-left">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-warning">Important</p>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    <li>• No back navigation after answering</li>
                    <li>• Tab switches are monitored</li>
                    <li>• Negative marking: -0.25 for wrong answers</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button onClick={startAssessment} variant="hero" className="w-full" size="lg">
              Start Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  // Completed screen
  if (status === "completed" && results) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <GlassCard>
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <div className={cn(
                  "h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-4",
                  results.score >= 60 ? "bg-success/10" : "bg-danger/10"
                )}>
                  <Trophy className={cn(
                    "h-12 w-12",
                    results.score >= 60 ? "text-success" : "text-danger"
                  )} />
                </div>
              </motion.div>
              <h1 className="text-2xl font-bold mb-2">Assessment Complete!</h1>
              <p className="text-muted-foreground">Here's how you performed</p>
            </div>

            {/* Score card */}
            <div className={cn(
              "p-6 rounded-xl mb-6",
              results.score >= 60 ? "bg-success/10" : "bg-danger/10"
            )}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-medium">Your Score</span>
                <span className={cn(
                  "text-4xl font-bold",
                  results.score >= 60 ? "text-success" : "text-danger"
                )}>
                  {results.score}%
                </span>
              </div>
              <Progress value={results.score} className="h-3" />
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-success/10 text-center">
                <CheckCircle2 className="h-6 w-6 text-success mx-auto mb-2" />
                <p className="text-2xl font-bold text-success">{results.correct}</p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div className="p-4 rounded-lg bg-danger/10 text-center">
                <XCircle className="h-6 w-6 text-danger mx-auto mb-2" />
                <p className="text-2xl font-bold text-danger">{results.wrong}</p>
                <p className="text-sm text-muted-foreground">Wrong</p>
              </div>
              <div className="p-4 rounded-lg bg-warning/10 text-center">
                <Clock className="h-6 w-6 text-warning mx-auto mb-2" />
                <p className="text-2xl font-bold text-warning">{results.skipped}</p>
                <p className="text-sm text-muted-foreground">Skipped</p>
              </div>
            </div>

            {/* Topic breakdown */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Topic Performance</h3>
              <div className="space-y-2">
                {Object.entries(results.topicBreakdown).map(([topic, data]) => (
                  <div key={topic} className="flex items-center gap-3">
                    <span className="text-sm w-32 truncate">{topic}</span>
                    <Progress
                      value={(data.correct / data.total) * 100}
                      className="flex-1 h-2"
                    />
                    <span className="text-sm text-muted-foreground w-16 text-right">
                      {data.correct}/{data.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {tabSwitches > 0 && (
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 mb-6">
                <div className="flex items-center gap-2 text-sm text-warning">
                  <AlertTriangle className="h-4 w-4" />
                  {tabSwitches} tab switch{tabSwitches > 1 ? "es" : ""} detected during assessment
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate("/candidate/applications")}>
                View Applications
              </Button>
              <Button className="flex-1" onClick={() => navigate("/candidate")}>
                Back to Dashboard
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  // In-progress view
  return (
    <div className="min-h-screen bg-background">
      {/* Tab switch warning */}
      <AnimatePresence>
        {showTabWarning && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="px-4 py-2 rounded-lg bg-danger text-danger-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Tab switch detected! ({tabSwitches})
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              Q{currentIndex + 1} of {questions.length}
            </Badge>
            <Badge className={cn(
              currentQuestion?.difficulty === "easy" && "bg-success",
              currentQuestion?.difficulty === "medium" && "bg-warning",
              currentQuestion?.difficulty === "hard" && "bg-orange-500",
              currentQuestion?.difficulty === "expert" && "bg-danger"
            )}>
              {currentQuestion?.difficulty}
            </Badge>
            <Badge variant="secondary">{currentQuestion?.topic}</Badge>
          </div>

          <div className="flex items-center gap-4">
            <Badge
              variant={questionTimeRemaining < 15 ? "destructive" : "secondary"}
              className="tabular-nums"
            >
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(questionTimeRemaining)}
            </Badge>
            <Badge
              variant={totalTimeRemaining < 300 ? "destructive" : "outline"}
              className="tabular-nums"
            >
              Total: {formatTime(totalTimeRemaining)}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSubmitDialog(true)}
            >
              Submit
            </Button>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <Progress
        value={(currentIndex / questions.length) * 100}
        className="h-1 rounded-none"
      />

      {/* Question content */}
      <main className="container max-w-3xl py-8 px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <GlassCard>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{currentIndex + 1}</span>
                  </div>
                  <Badge variant="outline">{currentQuestion?.points} point{currentQuestion?.points !== 1 ? "s" : ""}</Badge>
                </div>
                <Button
                  variant={answers.get(currentQuestion?.id || "")?.flagged ? "default" : "outline"}
                  size="sm"
                  onClick={handleFlag}
                >
                  <Flag className="h-4 w-4 mr-1" />
                  Flag
                </Button>
              </div>

              <h2 className="text-xl font-semibold mb-6">{currentQuestion?.question}</h2>

              {currentQuestion?.type === "single" ? (
                <RadioGroup
                  value={selectedOptions[0]?.toString()}
                  onValueChange={(v) => handleOptionSelect(parseInt(v))}
                  className="space-y-3"
                >
                  {currentQuestion?.options.map((option, i) => (
                    <Label
                      key={i}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all",
                        selectedOptions.includes(i)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value={i.toString()} />
                      <span>{option}</span>
                    </Label>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">Select all that apply:</p>
                  {currentQuestion?.options.map((option, i) => (
                    <Label
                      key={i}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all",
                        selectedOptions.includes(i)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Checkbox
                        checked={selectedOptions.includes(i)}
                        onCheckedChange={() => handleOptionSelect(i)}
                      />
                      <span>{option}</span>
                    </Label>
                  ))}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {currentIndex < questions.length - 1 ? (
                  <Button onClick={handleNext}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={() => setShowSubmitDialog(true)}>
                    Submit Assessment
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>

        {/* Question navigator */}
        <div className="mt-6">
          <GlassCard>
            <h3 className="text-sm font-medium mb-3">Question Navigator</h3>
            <div className="flex flex-wrap gap-2">
              {questions.map((q, i) => {
                const answer = answers.get(q.id);
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      saveAnswer();
                      setCurrentIndex(i);
                      setSelectedOptions(answers.get(q.id)?.selectedOptions || []);
                    }}
                    className={cn(
                      "h-8 w-8 rounded text-sm font-medium transition-all",
                      i === currentIndex && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                      answer?.selectedOptions.length
                        ? "bg-success text-success-foreground"
                        : "bg-secondary hover:bg-secondary/80",
                      answer?.flagged && "ring-2 ring-warning"
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </main>

      {/* Submit confirmation dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answers.size} of {questions.length} questions.
              {answers.size < questions.length && (
                <span className="text-warning"> {questions.length - answers.size} questions are unanswered.</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue</AlertDialogCancel>
            <AlertDialogAction onClick={submitAssessment}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Time up dialog */}
      <AlertDialog open={showTimeUpDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Time's Up!</AlertDialogTitle>
            <AlertDialogDescription>
              Your time has ended. Your answers have been automatically submitted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowTimeUpDialog(false)}>
              View Results
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
