import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  HelpCircle,
  Code,
  GripVertical,
  Save,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
}

interface CodingProblem {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  testCases: { input: string; output: string }[];
  timeLimit: number;
}

interface CustomQuestionsEditorProps {
  roundType: "mcq" | "coding";
  existingQuestions?: MCQQuestion[] | CodingProblem[];
  onSave: (questions: MCQQuestion[] | CodingProblem[]) => Promise<void>;
  className?: string;
}

export function CustomQuestionsEditor({
  roundType,
  existingQuestions = [],
  onSave,
  className,
}: CustomQuestionsEditorProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>(
    roundType === "mcq" ? (existingQuestions as MCQQuestion[]) : []
  );
  const [codingProblems, setCodingProblems] = useState<CodingProblem[]>(
    roundType === "coding" ? (existingQuestions as CodingProblem[]) : []
  );

  const addMCQQuestion = () => {
    const newQuestion: MCQQuestion = {
      id: crypto.randomUUID(),
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      difficulty: "medium",
      topic: "",
    };
    setMcqQuestions([...mcqQuestions, newQuestion]);
  };

  const updateMCQQuestion = (id: string, updates: Partial<MCQQuestion>) => {
    setMcqQuestions(mcqQuestions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeMCQQuestion = (id: string) => {
    setMcqQuestions(mcqQuestions.filter(q => q.id !== id));
  };

  const updateMCQOption = (questionId: string, optionIndex: number, value: string) => {
    setMcqQuestions(mcqQuestions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const addCodingProblem = () => {
    const newProblem: CodingProblem = {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      difficulty: "medium",
      testCases: [{ input: "", output: "" }],
      timeLimit: 30,
    };
    setCodingProblems([...codingProblems, newProblem]);
  };

  const updateCodingProblem = (id: string, updates: Partial<CodingProblem>) => {
    setCodingProblems(codingProblems.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const removeCodingProblem = (id: string) => {
    setCodingProblems(codingProblems.filter(p => p.id !== id));
  };

  const addTestCase = (problemId: string) => {
    setCodingProblems(codingProblems.map(p => {
      if (p.id === problemId) {
        return { ...p, testCases: [...p.testCases, { input: "", output: "" }] };
      }
      return p;
    }));
  };

  const updateTestCase = (problemId: string, index: number, field: "input" | "output", value: string) => {
    setCodingProblems(codingProblems.map(p => {
      if (p.id === problemId) {
        const newTestCases = [...p.testCases];
        newTestCases[index] = { ...newTestCases[index], [field]: value };
        return { ...p, testCases: newTestCases };
      }
      return p;
    }));
  };

  const removeTestCase = (problemId: string, index: number) => {
    setCodingProblems(codingProblems.map(p => {
      if (p.id === problemId && p.testCases.length > 1) {
        return { ...p, testCases: p.testCases.filter((_, i) => i !== index) };
      }
      return p;
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const questions = roundType === "mcq" ? mcqQuestions : codingProblems;
      
      // Validate
      if (roundType === "mcq") {
        for (const q of mcqQuestions) {
          if (!q.question.trim()) {
            throw new Error("All questions must have text");
          }
          if (q.options.some(o => !o.trim())) {
            throw new Error("All options must be filled");
          }
        }
      } else {
        for (const p of codingProblems) {
          if (!p.title.trim() || !p.description.trim()) {
            throw new Error("All problems must have title and description");
          }
        }
      }

      await onSave(questions);
      
      toast({
        title: "Questions saved!",
        description: `${questions.length} ${roundType === "mcq" ? "MCQ questions" : "coding problems"} saved successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error saving questions",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (roundType === "mcq") {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Custom MCQ Questions</h3>
            <Badge variant="secondary">{mcqQuestions.length} questions</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={addMCQQuestion}>
              <Plus className="h-4 w-4 mr-1" />
              Add Question
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving || mcqQuestions.length === 0}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Save
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {mcqQuestions.map((question, qIndex) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <GlassCard className="relative">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <Select
                    value={question.difficulty}
                    onValueChange={(v) => updateMCQQuestion(question.id, { difficulty: v as MCQQuestion["difficulty"] })}
                  >
                    <SelectTrigger className="w-24 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMCQQuestion(question.id)}
                    className="text-danger hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Question {qIndex + 1}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Question</Label>
                    <Textarea
                      value={question.question}
                      onChange={(e) => updateMCQQuestion(question.id, { question: e.target.value })}
                      placeholder="Enter your question..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Topic (optional)</Label>
                    <Input
                      value={question.topic}
                      onChange={(e) => updateMCQQuestion(question.id, { topic: e.target.value })}
                      placeholder="e.g., Arrays, Data Structures"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Options (select correct answer)</Label>
                    <div className="mt-2 space-y-2">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateMCQQuestion(question.id, { correctAnswer: oIndex })}
                            className={cn(
                              "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors",
                              question.correctAnswer === oIndex
                                ? "border-success bg-success text-success-foreground"
                                : "border-border hover:border-primary"
                            )}
                          >
                            {question.correctAnswer === oIndex && (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                          </button>
                          <Input
                            value={option}
                            onChange={(e) => updateMCQOption(question.id, oIndex, e.target.value)}
                            placeholder={`Option ${oIndex + 1}`}
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>

        {mcqQuestions.length === 0 && (
          <GlassCard className="text-center py-8">
            <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-3">No custom questions yet</p>
            <Button variant="outline" onClick={addMCQQuestion}>
              <Plus className="h-4 w-4 mr-1" />
              Add Your First Question
            </Button>
          </GlassCard>
        )}
      </div>
    );
  }

  // Coding problems editor
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-success" />
          <h3 className="text-lg font-semibold">Custom Coding Problems</h3>
          <Badge variant="secondary">{codingProblems.length} problems</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={addCodingProblem}>
            <Plus className="h-4 w-4 mr-1" />
            Add Problem
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving || codingProblems.length === 0}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Save
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {codingProblems.map((problem, pIndex) => (
          <motion.div
            key={problem.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <GlassCard className="relative">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <Select
                  value={problem.difficulty}
                  onValueChange={(v) => updateCodingProblem(problem.id, { difficulty: v as CodingProblem["difficulty"] })}
                >
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCodingProblem(problem.id)}
                  className="text-danger hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Problem {pIndex + 1}
                </span>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={problem.title}
                      onChange={(e) => updateCodingProblem(problem.id, { title: e.target.value })}
                      placeholder="Two Sum"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Time Limit (minutes)</Label>
                    <Input
                      type="number"
                      value={problem.timeLimit}
                      onChange={(e) => updateCodingProblem(problem.id, { timeLimit: parseInt(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Problem Description</Label>
                  <Textarea
                    value={problem.description}
                    onChange={(e) => updateCodingProblem(problem.id, { description: e.target.value })}
                    placeholder="Given an array of integers nums and an integer target..."
                    className="mt-1 min-h-[100px]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Test Cases</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addTestCase(problem.id)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {problem.testCases.map((tc, tcIndex) => (
                      <div key={tcIndex} className="flex items-center gap-2">
                        <Input
                          value={tc.input}
                          onChange={(e) => updateTestCase(problem.id, tcIndex, "input", e.target.value)}
                          placeholder="Input"
                          className="flex-1"
                        />
                        <span className="text-muted-foreground">→</span>
                        <Input
                          value={tc.output}
                          onChange={(e) => updateTestCase(problem.id, tcIndex, "output", e.target.value)}
                          placeholder="Expected Output"
                          className="flex-1"
                        />
                        {problem.testCases.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTestCase(problem.id, tcIndex)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </AnimatePresence>

      {codingProblems.length === 0 && (
        <GlassCard className="text-center py-8">
          <Code className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-3">No custom coding problems yet</p>
          <Button variant="outline" onClick={addCodingProblem}>
            <Plus className="h-4 w-4 mr-1" />
            Add Your First Problem
          </Button>
        </GlassCard>
      )}
    </div>
  );
}
