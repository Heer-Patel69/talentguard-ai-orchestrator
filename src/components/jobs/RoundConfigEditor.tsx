import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Clock,
  Sparkles,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Code,
  Layout,
  MessageSquare,
  Brain,
  AlertCircle,
  Settings2,
  FileText,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface RoundConfig {
  roundType: "mcq" | "coding" | "system_design" | "behavioral" | "live_ai_interview";
  durationMinutes: number;
  aiGenerateQuestions: boolean;
  customQuestions: string[];
  // MCQ-specific
  numQuestions?: number;
  passingScore?: number;
  negativeMarking?: boolean;
  // Coding-specific
  numProblems?: number;
  allowedLanguages?: string[];
  // System Design-specific
  numTopics?: number;
  // Behavioral-specific
  numScenarios?: number;
  // AI Interview-specific
  maxQuestions?: number;
  focusAreas?: string[];
}

interface RoundConfigEditorProps {
  index: number;
  config: RoundConfig;
  onChange: (config: RoundConfig) => void;
  onRemove?: () => void;
  showRemove?: boolean;
}

const roundTypes = [
  { value: "mcq", label: "MCQ", icon: HelpCircle, color: "text-blue-500" },
  { value: "coding", label: "Coding", icon: Code, color: "text-green-500" },
  { value: "system_design", label: "System Design", icon: Layout, color: "text-purple-500" },
  { value: "behavioral", label: "Behavioral", icon: MessageSquare, color: "text-orange-500" },
  { value: "live_ai_interview", label: "AI Interview", icon: Brain, color: "text-primary" },
];

const programmingLanguages = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "Ruby", "PHP"
];

export function RoundConfigEditor({
  index,
  config,
  onChange,
  onRemove,
  showRemove = true,
}: RoundConfigEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newFocusArea, setNewFocusArea] = useState("");

  const roundType = roundTypes.find(r => r.value === config.roundType);
  const Icon = roundType?.icon || HelpCircle;

  const updateConfig = (updates: Partial<RoundConfig>) => {
    onChange({ ...config, ...updates });
  };

  const addCustomQuestion = () => {
    if (newQuestion.trim()) {
      updateConfig({
        customQuestions: [...(config.customQuestions || []), newQuestion.trim()],
      });
      setNewQuestion("");
    }
  };

  const removeCustomQuestion = (idx: number) => {
    updateConfig({
      customQuestions: config.customQuestions.filter((_, i) => i !== idx),
    });
  };

  const addFocusArea = () => {
    if (newFocusArea.trim()) {
      updateConfig({
        focusAreas: [...(config.focusAreas || []), newFocusArea.trim()],
      });
      setNewFocusArea("");
    }
  };

  const removeFocusArea = (idx: number) => {
    updateConfig({
      focusAreas: (config.focusAreas || []).filter((_, i) => i !== idx),
    });
  };

  const toggleLanguage = (lang: string) => {
    const current = config.allowedLanguages || [];
    if (current.includes(lang)) {
      updateConfig({ allowedLanguages: current.filter(l => l !== lang) });
    } else {
      updateConfig({ allowedLanguages: [...current, lang] });
    }
  };

  // Get minimum values based on round type
  const getMinValue = (field: string): number => {
    return 1; // All fields require minimum of 1
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-secondary/30">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg bg-background", roundType?.color)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <span className="font-medium">Round {index + 1}</span>
            <p className="text-xs text-muted-foreground">{roundType?.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {config.durationMinutes} min
          </Badge>
          {showRemove && onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="h-8 w-8 text-danger hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Config */}
      <div className="p-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Round Type */}
          <div>
            <Label>Round Type</Label>
            <Select
              value={config.roundType}
              onValueChange={(v: RoundConfig["roundType"]) => updateConfig({ roundType: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roundTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className={cn("h-4 w-4", type.color)} />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div>
            <Label>Duration (minutes)</Label>
            <div className="relative mt-1">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="number"
                min={1}
                className="pl-10"
                value={config.durationMinutes}
                onChange={(e) => updateConfig({ 
                  durationMinutes: Math.max(1, parseInt(e.target.value) || 1) 
                })}
              />
            </div>
            {config.durationMinutes < 1 && (
              <p className="text-xs text-danger mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Minimum 1 minute required
              </p>
            )}
          </div>
        </div>

        {/* MCQ-specific fields */}
        {config.roundType === "mcq" && (
          <div className="grid gap-4 md:grid-cols-3 p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
            <div>
              <Label className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-blue-500" />
                Number of Questions
              </Label>
              <Input
                type="number"
                min={1}
                max={100}
                className="mt-1"
                value={config.numQuestions || 10}
                onChange={(e) => updateConfig({ 
                  numQuestions: Math.max(1, parseInt(e.target.value) || 1) 
                })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                How many questions to show (1-100)
              </p>
            </div>
            <div>
              <Label>Passing Score (%)</Label>
              <Input
                type="number"
                min={1}
                max={100}
                className="mt-1"
                value={config.passingScore || 60}
                onChange={(e) => updateConfig({ 
                  passingScore: Math.min(100, Math.max(1, parseInt(e.target.value) || 60)) 
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Negative Marking</Label>
                <p className="text-xs text-muted-foreground">Deduct for wrong answers</p>
              </div>
              <Switch
                checked={config.negativeMarking ?? true}
                onCheckedChange={(v) => updateConfig({ negativeMarking: v })}
              />
            </div>
          </div>
        )}

        {/* Coding-specific fields */}
        {config.roundType === "coding" && (
          <div className="space-y-4 p-4 bg-green-500/5 rounded-lg border border-green-500/20">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-green-500" />
                  Number of Problems
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  className="mt-1"
                  value={config.numProblems || 2}
                  onChange={(e) => updateConfig({ 
                    numProblems: Math.max(1, parseInt(e.target.value) || 1) 
                  })}
                />
              </div>
            </div>
            <div>
              <Label>Allowed Languages</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {programmingLanguages.map((lang) => (
                  <Badge
                    key={lang}
                    variant={(config.allowedLanguages || []).includes(lang) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleLanguage(lang)}
                  >
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* System Design-specific fields */}
        {config.roundType === "system_design" && (
          <div className="p-4 bg-purple-500/5 rounded-lg border border-purple-500/20">
            <div>
              <Label className="flex items-center gap-2">
                <Layout className="h-4 w-4 text-purple-500" />
                Number of Design Topics
              </Label>
              <Input
                type="number"
                min={1}
                max={5}
                className="mt-1 max-w-[200px]"
                value={config.numTopics || 1}
                onChange={(e) => updateConfig({ 
                  numTopics: Math.max(1, parseInt(e.target.value) || 1) 
                })}
              />
            </div>
          </div>
        )}

        {/* Behavioral-specific fields */}
        {config.roundType === "behavioral" && (
          <div className="p-4 bg-orange-500/5 rounded-lg border border-orange-500/20">
            <div>
              <Label className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-orange-500" />
                Number of Scenarios
              </Label>
              <Input
                type="number"
                min={1}
                max={10}
                className="mt-1 max-w-[200px]"
                value={config.numScenarios || 3}
                onChange={(e) => updateConfig({ 
                  numScenarios: Math.max(1, parseInt(e.target.value) || 1) 
                })}
              />
            </div>
          </div>
        )}

        {/* AI Interview-specific fields */}
        {config.roundType === "live_ai_interview" && (
          <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div>
              <Label className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Maximum Questions
              </Label>
              <Input
                type="number"
                min={1}
                max={20}
                className="mt-1 max-w-[200px]"
                value={config.maxQuestions || 5}
                onChange={(e) => updateConfig({ 
                  maxQuestions: Math.max(1, parseInt(e.target.value) || 1) 
                })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                AI will adapt based on candidate responses
              </p>
            </div>
            <div>
              <Label>Focus Areas</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add focus area (e.g., React, System Design)"
                  value={newFocusArea}
                  onChange={(e) => setNewFocusArea(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFocusArea())}
                />
                <Button type="button" variant="outline" onClick={addFocusArea}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(config.focusAreas || []).map((area, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    {area}
                    <button type="button" onClick={() => removeFocusArea(idx)}>
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Toggle */}
        <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm">AI Auto-generate Questions</span>
          </div>
          <Switch
            checked={config.aiGenerateQuestions}
            onCheckedChange={(v) => updateConfig({ aiGenerateQuestions: v })}
          />
        </div>

        {/* Custom Questions Section */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Custom Questions ({config.customQuestions?.length || 0})
              </span>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-3">
            <div className="flex gap-2">
              <Textarea
                placeholder={getQuestionPlaceholder(config.roundType)}
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="min-h-[80px]"
              />
              <Button type="button" variant="outline" onClick={addCustomQuestion}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <AnimatePresence>
              {config.customQuestions?.map((q, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 p-3 rounded-lg bg-secondary/50"
                >
                  <FileText className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                  <p className="text-sm flex-1">{q}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-danger"
                    onClick={() => removeCustomQuestion(idx)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
            {!config.aiGenerateQuestions && config.customQuestions?.length === 0 && (
              <p className="text-xs text-amber-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                AI generation is off. Add at least 1 custom question.
              </p>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </motion.div>
  );
}

function getQuestionPlaceholder(roundType: string): string {
  switch (roundType) {
    case "mcq":
      return "Enter MCQ question with options:\nQ: What is the time complexity of binary search?\nA) O(1)\nB) O(log n) ✓\nC) O(n)\nD) O(n²)";
    case "coding":
      return "Enter coding problem:\nTitle: Two Sum\nDescription: Given an array of integers, return indices of two numbers that add up to target.\nExample: nums = [2,7,11,15], target = 9 → [0,1]";
    case "system_design":
      return "Enter system design topic:\nDesign a URL shortening service like bit.ly\n- Consider scalability, availability, and data storage";
    case "behavioral":
      return "Enter behavioral scenario:\nDescribe a time when you had to deal with a difficult team member. How did you handle it?";
    case "live_ai_interview":
      return "Enter specific question for AI to ask:\nWalk me through your experience with microservices architecture.";
    default:
      return "Enter your custom question...";
  }
}
