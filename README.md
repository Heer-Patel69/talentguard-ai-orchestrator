# HireMinds AI - Autonomous AI Hiring Platform

<div align="center">
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-3-blue?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Cloud-green?logo=supabase" alt="Supabase" />
</div>

## 🚀 Overview

HireMinds AI is an enterprise-grade, AI-powered hiring platform that automates the complete recruitment lifecycle. From candidate registration with identity verification to AI-conducted interviews and explainable decision-making.

### Key Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Interviews** | Real-time voice/video interviews with adaptive AI |
| 💻 **Code Editor** | Monaco-based editor for technical assessments |
| 🔒 **Fraud Detection** | Multi-layered proctoring and identity verification |
| ⚖️ **Fairness Monitoring** | Bias detection with statistical analysis |
| 📊 **Analytics** | Comprehensive hiring insights and trends |
| 🎓 **Continuous Learning** | AI improvement through feedback loops |

## 🏗️ Architecture

```
Frontend (React + Vite)
        ↓
Supabase Backend (Auth, DB, Storage, Edge Functions)
        ↓
Lovable AI Gateway (Gemini, GPT-5)
```

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed architecture documentation.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui, Framer Motion
- **State**: TanStack Query, React Context
- **Backend**: Supabase (Postgres, Auth, Storage)
- **AI**: Lovable AI Gateway
- **Editor**: Monaco Editor

## 📁 Project Structure

```
src/
├── components/         # React components
│   ├── auth/          # Authentication
│   ├── candidate/     # Candidate dashboard
│   ├── dashboard/     # Interviewer dashboard
│   ├── interview/     # AI interview room
│   ├── fairness/      # Bias monitoring
│   └── ui/            # Reusable UI components
├── contexts/          # React contexts
├── hooks/             # Custom hooks
├── pages/             # Route pages
└── integrations/      # Supabase client

supabase/
├── functions/         # Edge functions
└── migrations/        # Database migrations

docs/
├── ARCHITECTURE.md    # System architecture
└── ETHICAL_SAFEGUARDS.md  # AI ethics documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment

Environment variables are automatically configured via Lovable Cloud:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## 🔒 Security

- **Authentication**: Email verification, role-based access
- **Authorization**: Row-level security on all tables
- **Data Protection**: Encryption at rest, input sanitization
- **Proctoring**: Face verification, behavior analysis

## ⚖️ Ethical AI

See [docs/ETHICAL_SAFEGUARDS.md](./docs/ETHICAL_SAFEGUARDS.md) for our AI ethics policies including:
- Bias detection and mitigation
- Explainable AI decisions
- Human oversight requirements
- Data privacy practices

## 📊 Features by Role

### Recruiters/Interviewers
- Post and manage job listings
- Monitor hiring funnel in Command Center
- Review AI recommendations with override capability
- Access fairness and analytics dashboards
- Provide feedback for AI improvement

### Candidates
- Register with identity verification
- Browse and apply to jobs
- Take AI-powered interviews
- Receive detailed performance feedback
- Track application status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

Proprietary software. All rights reserved.

## 🔗 Links

- **Lovable Project**: [Open in Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID)
- **Documentation**: See `/docs` folder
- **Support**: Contact via in-app feedback

---

Built with ❤️ using [Lovable](https://lovable.dev)
