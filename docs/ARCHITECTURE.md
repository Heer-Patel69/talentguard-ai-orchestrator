# HireMinds AI - Architecture Documentation

## System Overview

HireMinds AI is a multi-tenant, AI-powered hiring platform built on a modern serverless architecture. The system is designed for scalability, security, and real-time performance.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Client Layer                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     React SPA (Vite + TypeScript)                    │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │   Landing    │  │  Candidate   │  │ Interviewer  │               │    │
│  │  │    Pages     │  │  Dashboard   │  │  Dashboard   │               │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │    │
│  │                                                                      │    │
│  │  ┌──────────────────────────────────────────────────────────────┐   │    │
│  │  │                    Shared Components                          │   │    │
│  │  │  • UI Library (shadcn/ui)  • Forms  • Charts  • Animations   │   │    │
│  │  └──────────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            API Gateway Layer                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        Supabase Edge Functions                       │    │
│  │                                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │  Interview   │  │    Code      │  │  Candidate   │               │    │
│  │  │    Agent     │  │   Analyzer   │  │  Evaluator   │               │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │    │
│  │                                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │    Fraud     │  │   Fairness   │  │   Learning   │               │    │
│  │  │  Detection   │  │   Analyzer   │  │   Pipeline   │               │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Data Layer                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Supabase Backend                             │    │
│  │                                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │ PostgreSQL   │  │   Auth +     │  │   Storage    │               │    │
│  │  │   Database   │  │    RLS       │  │   Buckets    │               │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │    │
│  │                                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐                                 │    │
│  │  │   Realtime   │  │    Secrets   │                                 │    │
│  │  │   Channels   │  │   Manager    │                                 │    │
│  │  └──────────────┘  └──────────────┘                                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            AI Services Layer                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Lovable AI Gateway                              │    │
│  │                                                                      │    │
│  │  ┌──────────────────────────────────────────────────────────────┐   │    │
│  │  │  Supported Models:                                            │   │    │
│  │  │  • google/gemini-3-flash-preview (Primary Interview Agent)   │   │    │
│  │  │  • google/gemini-2.5-flash (Fast Operations)                 │   │    │
│  │  │  • openai/gpt-5 (Complex Reasoning)                          │   │    │
│  │  └──────────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Candidate Interview Flow

```
Candidate → Interview Room → WebRTC (Video/Audio)
                          ↓
               AI Interview Agent (Edge Function)
                          ↓
               Lovable AI Gateway (Gemini)
                          ↓
               Real-time Conversation
                          ↓
               Code Analysis (if technical)
                          ↓
               Evaluation Engine
                          ↓
               Database (Scores, Transcripts)
                          ↓
               Recruiter Dashboard
```

### 2. Fraud Detection Flow

```
Live Interview Session
        ↓
┌───────┴───────┐
│ Proctoring    │
│ Monitors:     │
│ • Face        │
│ • Audio       │
│ • Browser     │
│ • Behavior    │
└───────┬───────┘
        ↓
    Analysis Engine
        ↓
┌───────┴───────┐
│ Risk Scoring: │
│ • Trust Score │
│ • Anomalies   │
│ • Patterns    │
└───────┬───────┘
        ↓
    Alert System
```

## Database Schema

### Core Tables

```sql
-- User Management
profiles (user_id, full_name, email, avatar_url)
user_roles (user_id, role: interviewer|candidate)
interviewer_profiles (user_id, company_*, industry, ...)
candidate_profiles (user_id, phone, resume_url, aadhaar_*, verification_status)

-- Job Management
jobs (id, interviewer_id, title, description, requirements, status, ...)
job_interview_rounds (job_id, round_type, toughness_level, custom_questions)

-- Applications & Interviews
applications (id, job_id, candidate_id, status, ...)
interview_sessions (id, application_id, round_type, status, scores, ...)

-- AI Evaluation
candidate_evaluations (application_id, scores, recommendation, reasoning, ...)
proctoring_events (session_id, event_type, severity, ...)

-- Fairness & Learning
fairness_metrics (job_id, dimension, group, pass_rate, ...)
recruiter_feedback (application_id, accuracy, performance_rating, ...)
learning_outcomes (job_field, ai_score, actual_performance, ...)
```

## Security Architecture

### Authentication Flow

```
1. User Registration
   ├── Email/Password signup
   ├── Email verification required
   └── Role assignment (interviewer/candidate)

2. Session Management
   ├── JWT tokens via Supabase Auth
   ├── Automatic refresh
   └── Secure cookie storage

3. Authorization
   ├── Role-based route protection
   ├── Row-level security policies
   └── Function-level access control
```

### Row-Level Security

```sql
-- Example: Candidates can only view their own applications
CREATE POLICY "Candidates view own applications" 
ON applications FOR SELECT 
USING (candidate_id = auth.uid());

-- Example: Interviewers view applications for their jobs
CREATE POLICY "Interviewers view job applications" 
ON applications FOR SELECT 
USING (
  job_id IN (SELECT id FROM jobs WHERE interviewer_id = auth.uid())
);
```

## Performance Optimizations

### Frontend
- Lazy loading for all routes
- Code splitting per feature
- Image optimization (WebP)
- TanStack Query caching
- Optimistic UI updates

### Backend
- Edge functions for low latency
- Database indexes on foreign keys
- Query result caching
- Connection pooling

### AI
- Streaming responses
- Model selection based on task
- Response caching where applicable

## Monitoring & Observability

### Metrics Tracked
- Interview completion rates
- AI response latency
- Fraud detection accuracy
- User engagement metrics
- System error rates

### Alerting
- High fraud risk candidates
- System errors
- Fairness threshold violations
- Performance degradation

## Scalability Considerations

### Horizontal Scaling
- Stateless edge functions
- Database connection pooling
- CDN for static assets

### Vertical Scaling
- Database compute scaling
- AI model tier selection
- Storage auto-scaling

---

*Document Version: 1.0*
*Last Updated: February 2024*
