import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { TrustScoreBadge, RiskMeter, ProctorStatusBadge } from "@/components/ui/trust-indicators";
import { PageBackground, Container } from "@/components/ui/layout";
import { Navbar } from "@/components/layout/Navbar";
import {
  Users,
  Briefcase,
  Play,
  Settings,
  BarChart3,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  Search,
  MoreVertical,
  Video,
} from "lucide-react";
import { Input } from "@/components/ui/input";

// Mock data for candidates
const mockCandidates = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Senior Frontend Developer",
    stage: "Technical Round",
    trustScore: 94,
    status: "in-progress",
    flags: 0,
    timeElapsed: "23:45",
  },
  {
    id: 2,
    name: "Michael Park",
    role: "Backend Engineer",
    stage: "System Design",
    trustScore: 87,
    status: "in-progress",
    flags: 1,
    timeElapsed: "45:12",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Full Stack Developer",
    stage: "Behavioral",
    trustScore: 56,
    status: "flagged",
    flags: 3,
    timeElapsed: "18:30",
  },
  {
    id: 4,
    name: "James Wilson",
    role: "DevOps Engineer",
    stage: "Screening",
    trustScore: 98,
    status: "in-progress",
    flags: 0,
    timeElapsed: "12:05",
  },
  {
    id: 5,
    name: "Priya Sharma",
    role: "Data Scientist",
    stage: "Technical Round",
    trustScore: 91,
    status: "completed",
    flags: 0,
    timeElapsed: "58:22",
  },
  {
    id: 6,
    name: "David Kim",
    role: "ML Engineer",
    stage: "Screening",
    trustScore: 42,
    status: "terminated",
    flags: 5,
    timeElapsed: "08:15",
  },
];

const stats = [
  { icon: Users, label: "Active Interviews", value: "24", change: "+8 today" },
  { icon: CheckCircle2, label: "Completed", value: "156", change: "This week" },
  { icon: AlertTriangle, label: "Flagged", value: "7", change: "Needs review" },
  { icon: Clock, label: "Avg. Duration", value: "42m", change: "-12% faster" },
];

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCandidates = mockCandidates.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <PageBackground pattern="dots" />
      <Navbar />

      <Container className="pt-28 pb-12">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Command Center</h1>
            <p className="text-muted-foreground">
              Monitor live interviews and manage your hiring pipeline
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button variant="hero">
              <Plus className="mr-2 h-4 w-4" />
              New Job
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Live Feed Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-3 w-3 items-center justify-center">
              <div className="h-3 w-3 animate-pulse rounded-full bg-success" />
            </div>
            <h2 className="text-xl font-semibold">Live Interviews</h2>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Candidates Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCandidates.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard
                hover
                glow={
                  candidate.status === "flagged" || candidate.status === "terminated"
                    ? "danger"
                    : undefined
                }
                className={
                  candidate.status === "terminated" ? "opacity-60" : ""
                }
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold">
                      {candidate.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <h3 className="font-semibold">{candidate.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {candidate.role}
                      </p>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <ProctorStatusBadge
                    status={
                      candidate.status === "terminated"
                        ? "alert"
                        : candidate.flags > 2
                        ? "warning"
                        : "active"
                    }
                    label={candidate.stage}
                  />
                  <TrustScoreBadge score={candidate.trustScore} size="sm" />
                </div>

                <div className="mb-4">
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-muted-foreground">Risk Level</span>
                    <span>{candidate.flags} flags</span>
                  </div>
                  <RiskMeter value={100 - candidate.trustScore} />
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {candidate.timeElapsed}
                  </div>
                  <div className="flex gap-2">
                    {candidate.status === "in-progress" && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/interview/${candidate.id}`}>
                          <Eye className="mr-1 h-3 w-3" />
                          Watch
                        </Link>
                      </Button>
                    )}
                    {candidate.status === "completed" && (
                      <Button variant="outline" size="sm">
                        <Video className="mr-1 h-3 w-3" />
                        Playback
                      </Button>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Job Setup Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <GlassCard elevated className="gradient-border">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="mb-2 text-xl font-semibold">Quick Job Setup</h3>
                <p className="text-muted-foreground">
                  Create a new hiring pipeline in minutes with customizable rounds
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {["Screening", "Coding", "System Design", "Behavioral"].map(
                  (round) => (
                    <span
                      key={round}
                      className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-sm"
                    >
                      {round}
                    </span>
                  )
                )}
              </div>
              <Button variant="hero">
                <Plus className="mr-2 h-4 w-4" />
                Configure
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </Container>
    </div>
  );
}
