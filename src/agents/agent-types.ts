// =============================================
// HIREMINDS AI: AGENT TYPE DEFINITIONS
// =============================================

// Common types used across all agents
export interface AgentResult {
  agent_number: number;
  agent_name: string;
  score: number;
  detailed_scores: Record<string, number>;
  decision: 'pass' | 'reject' | 'borderline' | 'strong_pass' | 'pending';
  reasoning: string;
  raw_data: Record<string, any>;
}

export interface CandidateData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  github_url?: string;
  linkedin_url?: string;
  resume_url?: string;
  skills?: string[];
  experience_years?: number;
  education?: Education[];
  profile_score?: number;
  github_score?: number;
}

export interface Education {
  degree: string;
  institution: string;
  year: number;
  field?: string;
}

export interface JobData {
  id: string;
  title: string;
  description: string;
  field: string;
  experience_level: string;
  toughness_level: number;
  requirements?: string[];
  skills_required?: string[];
  round_config: RoundConfig;
  score_weights: ScoreWeights;
  custom_questions?: string[];
}

export interface RoundConfig {
  mcq: MCQConfig;
  coding: CodingConfig;
  behavioral: BehavioralConfig;
  interview: InterviewConfig;
}

export interface MCQConfig {
  enabled: boolean;
  num_questions: number;
  passing_score: number;
  time_limit_minutes: number;
}

export interface CodingConfig {
  enabled: boolean;
  num_problems: number;
  passing_score: number;
  time_limit_minutes: number;
}

export interface BehavioralConfig {
  enabled: boolean;
  num_questions: number;
  passing_score: number;
}

export interface InterviewConfig {
  enabled: boolean;
  duration_minutes: number;
  passing_score: number;
}

export interface ScoreWeights {
  resume: number;
  mcq: number;
  coding: number;
  behavioral: number;
  interview: number;
  fraud_adjustment: number;
}

// =============================================
// AGENT 1: GATEKEEPER TYPES
// =============================================

export interface GatekeeperInput {
  application_id: string;
  candidate: CandidateData;
  job: JobData;
}

export interface GatekeeperOutput extends AgentResult {
  extracted_data: {
    skills: string[];
    experience_years: number;
    education: Education[];
    projects: Project[];
    certifications: string[];
  };
  resume_match_score: number;
  github_score: number;
  linkedin_validated: boolean;
  identity_verified: boolean;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

// =============================================
// AGENT 2: QUIZMASTER TYPES
// =============================================

export interface QuizmasterInput {
  application_id: string;
  candidate: CandidateData;
  job: JobData;
  gatekeeper_result: GatekeeperOutput;
}

export interface MCQQuestion {
  id: string;
  question_text: string;
  question_type: 'single' | 'multiple' | 'true_false' | 'fill_blank';
  options: string[];
  correct_answers: number[];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  topic: string;
  points: number;
  time_limit_seconds: number;
  explanation?: string;
}

export interface MCQResponse {
  question_id: string;
  selected_answers: number[];
  is_correct: boolean;
  time_taken_seconds: number;
}

export interface QuizmasterOutput extends AgentResult {
  total_questions: number;
  correct: number;
  wrong: number;
  skipped: number;
  topic_breakdown: Record<string, number>;
  difficulty_reached: string;
  avg_time_per_question: number;
  tab_switches: number;
  adaptive_path: string[];
}

// =============================================
// AGENT 3: CODE JUDGE TYPES
// =============================================

export interface CodeJudgeInput {
  application_id: string;
  candidate: CandidateData;
  job: JobData;
  quizmaster_result: QuizmasterOutput;
}

export interface CodingProblem {
  id: string;
  title: string;
  description: string;
  input_format: string;
  output_format: string;
  constraints: string;
  examples: Example[];
  test_cases: TestCase[];
  hidden_test_cases: TestCase[];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  expected_time_complexity: string;
  expected_space_complexity: string;
  hints: string[];
  time_limit_minutes: number;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  input: string;
  expected_output: string;
  is_hidden?: boolean;
}

export interface CodeSubmission {
  problem_id: string;
  code: string;
  language: string;
  tests_passed: number;
  tests_total: number;
  execution_time_ms: number;
  memory_used_kb: number;
  time_complexity: string;
  space_complexity: string;
  code_quality_score: number;
  ai_review: AICodeReview;
  paste_events: number;
  time_taken_minutes: number;
}

export interface AICodeReview {
  correctness: number;
  efficiency: number;
  readability: number;
  edge_case_handling: number;
  best_practices: number;
  suggestions: string[];
  issues: string[];
}

export interface CodeJudgeOutput extends AgentResult {
  problems: CodeSubmission[];
  overall_coding_score: number;
  typing_pattern_analysis: 'natural' | 'suspicious';
  total_paste_events: number;
  languages_used: string[];
}

// =============================================
// AGENT 4: PERSONA TYPES
// =============================================

export interface PersonaInput {
  application_id: string;
  candidate: CandidateData;
  job: JobData;
  code_judge_result: CodeJudgeOutput;
}

export interface BehavioralQuestion {
  id: string;
  question: string;
  type: 'star' | 'scenario' | 'ethical' | 'leadership' | 'conflict';
  follow_ups: string[];
}

export interface BehavioralResponse {
  question: string;
  response_text: string;
  response_audio_url?: string;
  ai_evaluation: BehavioralEvaluation;
}

export interface BehavioralEvaluation {
  communication_clarity: number;
  depth_of_response: number;
  self_awareness: number;
  teamwork: number;
  problem_solving: number;
  cultural_fit: number;
  emotional_intelligence: number;
  confidence: number;
}

export interface PersonaOutput extends AgentResult {
  questions_asked: number;
  evaluation: BehavioralEvaluation;
  transcript: TranscriptEntry[];
  voice_analysis?: VoiceAnalysis;
}

export interface TranscriptEntry {
  role: 'ai' | 'candidate';
  text: string;
  timestamp: number;
  audio_url?: string;
}

export interface VoiceAnalysis {
  pace: 'slow' | 'normal' | 'fast';
  filler_words_count: number;
  confidence_level: number;
  tone: 'nervous' | 'confident' | 'calm' | 'enthusiastic';
}

// =============================================
// AGENT 5: INTERVIEWER TYPES
// =============================================

export interface InterviewerInput {
  application_id: string;
  candidate: CandidateData;
  job: JobData;
  persona_result: PersonaOutput;
  all_previous_results: AgentResult[];
}

export interface InterviewPhase {
  name: 'warmup' | 'technical' | 'scenario' | 'candidate_questions' | 'closing';
  duration_minutes: number;
  questions: string[];
}

export interface InterviewerOutput extends AgentResult {
  interview_duration_minutes: number;
  phases_completed: string[];
  technical_score: number;
  communication_score: number;
  problem_solving_score: number;
  code_quality_score: number;
  pressure_handling_score: number;
  depth_score: number;
  fraud_risk_score: number;
  fraud_flags: string[];
  full_transcript: TranscriptEntry[];
  audio_recording_url?: string;
  video_recording_url?: string;
  code_submissions: CodeSubmission[];
}

// =============================================
// AGENT 6: VERDICT TYPES
// =============================================

export interface VerdictInput {
  job_id: string;
  job: JobData;
  all_applications: ApplicationWithResults[];
}

export interface ApplicationWithResults {
  application_id: string;
  candidate: CandidateData;
  agent_results: AgentResult[];
  completed_all_rounds: boolean;
}

export interface CandidateRanking {
  rank: number;
  application_id: string;
  candidate: CandidateData;
  final_score: number;
  round_scores: {
    screening: RoundScore;
    mcq: RoundScore;
    coding: RoundScore;
    behavioral: RoundScore;
    interview: RoundScore;
  };
  strengths: string[];
  weaknesses: string[];
  fraud_status: 'clean' | 'flagged' | 'high_risk';
  ai_recommendation: string;
  hire_status: 'pending' | 'shortlisted' | 'hired' | 'rejected' | 'waitlisted';
}

export interface RoundScore {
  score: number;
  highlights: string[];
}

export interface JobSummaryReport {
  job_id: string;
  job_title: string;
  total_applicants: number;
  completed_all_rounds: number;
  rejected_at_each_stage: Record<string, number>;
  average_scores: Record<string, number>;
  top_score: number;
  lowest_passing_score: number;
  fraud_incidents: number;
  bias_analysis: string;
  pipeline_duration_avg_days: number;
  ai_confidence: number;
}

export interface VerdictOutput {
  job_summary: JobSummaryReport;
  top_candidates: CandidateRanking[];
  all_rankings: CandidateRanking[];
  rejected_summary: RejectedSummary;
}

export interface RejectedSummary {
  total_rejected: number;
  by_stage: Record<string, number>;
  common_rejection_reasons: string[];
}

// =============================================
// FRAUD DETECTION TYPES
// =============================================

export interface FraudSignal {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: Record<string, any>;
  timestamp: number;
  agent_number: number;
}

export interface FraudAnalysis {
  risk_score: number;
  signals: FraudSignal[];
  recommendation: 'proceed' | 'review' | 'reject';
}

// =============================================
// PIPELINE TYPES
// =============================================

export interface PipelineState {
  application_id: string;
  current_agent: number;
  started_at: Date;
  results: AgentResult[];
  fraud_signals: FraudSignal[];
  status: 'in_progress' | 'completed' | 'rejected' | 'error';
}

export interface AgentTransition {
  from_agent: number;
  to_agent: number;
  decision: string;
  timestamp: Date;
}
