import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  Target,
  Shield,
  Brain,
  Download,
  Calendar,
  Filter,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from "recharts";
import { cn } from "@/lib/utils";

// Mock data
const biasData = [
  { category: "Gender", male: 52, female: 45, other: 3, ideal: 50 },
  { category: "Region", north: 28, south: 32, east: 18, west: 22 },
  { category: "Institution", tier1: 35, tier2: 40, tier3: 25 },
];

const genderDistribution = [
  { name: "Male", value: 52, color: "hsl(var(--primary))" },
  { name: "Female", value: 45, color: "hsl(var(--success))" },
  { name: "Other", value: 3, color: "hsl(var(--warning))" },
];

const regionDistribution = [
  { region: "North", candidates: 28, hired: 8 },
  { region: "South", candidates: 32, hired: 10 },
  { region: "East", candidates: 18, hired: 5 },
  { region: "West", candidates: 22, hired: 7 },
];

const confidenceDistribution = [
  { range: "0-20%", count: 5 },
  { range: "20-40%", count: 12 },
  { range: "40-60%", count: 28 },
  { range: "60-80%", count: 45 },
  { range: "80-100%", count: 66 },
];

const fraudSummary = [
  { type: "Tab Switching", count: 23, severity: "medium" },
  { type: "Gaze Deviation", count: 45, severity: "low" },
  { type: "Multiple Faces", count: 8, severity: "high" },
  { type: "Audio Anomaly", count: 12, severity: "medium" },
  { type: "Identity Mismatch", count: 3, severity: "critical" },
];

const funnelHealth = [
  { stage: "Applied", current: 248, target: 300, rate: 82 },
  { stage: "Screening", current: 180, target: 200, rate: 90 },
  { stage: "Technical", current: 95, target: 120, rate: 79 },
  { stage: "Final", current: 42, target: 50, rate: 84 },
  { stage: "Hired", current: 18, target: 25, rate: 72 },
];

const weeklyTrend = [
  { week: "Week 1", interviews: 45, passRate: 68 },
  { week: "Week 2", interviews: 52, passRate: 72 },
  { week: "Week 3", interviews: 48, passRate: 65 },
  { week: "Week 4", interviews: 61, passRate: 78 },
];

const performanceMetrics = [
  { subject: "Problem Solving", A: 85, fullMark: 100 },
  { subject: "Communication", A: 78, fullMark: 100 },
  { subject: "Technical Skills", A: 82, fullMark: 100 },
  { subject: "Code Quality", A: 75, fullMark: 100 },
  { subject: "System Design", A: 70, fullMark: 100 },
  { subject: "Time Management", A: 88, fullMark: 100 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor hiring metrics, bias indicators, and AI performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Bias Monitoring Section */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Shield className="h-5 w-5 text-primary" />
          Bias Monitoring Dashboard
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Gender Distribution */}
          <GlassCard>
            <h3 className="mb-4 font-semibold">Gender Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={genderDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {genderDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex justify-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-primary" />
                Balanced
              </span>
            </div>
          </GlassCard>

          {/* Region Distribution */}
          <GlassCard>
            <h3 className="mb-4 font-semibold">Regional Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={regionDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="region" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="candidates" fill="hsl(var(--primary))" name="Applied" />
                <Bar dataKey="hired" fill="hsl(var(--success))" name="Hired" />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Bias Alerts */}
          <GlassCard>
            <h3 className="mb-4 font-semibold">Bias Alerts</h3>
            <div className="space-y-3">
              <div className="rounded-lg bg-success/10 p-3">
                <div className="flex items-center gap-2 text-success">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Gender Balance</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Near equal representation (52/45/3)
                </p>
              </div>
              <div className="rounded-lg bg-warning/10 p-3">
                <div className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Institution Bias</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  35% from Tier-1 institutions - consider diversifying
                </p>
              </div>
              <div className="rounded-lg bg-info/10 p-3">
                <div className="flex items-center gap-2 text-info">
                  <Target className="h-4 w-4" />
                  <span className="text-sm font-medium">Age Distribution</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Healthy mix across experience levels
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* AI Confidence & Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Confidence Distribution */}
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold">
              <Brain className="h-5 w-5 text-primary" />
              AI Confidence Distribution
            </h3>
            <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">
              Avg: 74%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={confidenceDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {confidenceDistribution.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      index < 2 ? "hsl(var(--danger))" :
                      index === 2 ? "hsl(var(--warning))" :
                      "hsl(var(--success))"
                    } 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Average Performance Radar */}
        <GlassCard>
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Target className="h-5 w-5 text-primary" />
            Average Candidate Performance
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={performanceMetrics}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              />
              <Radar
                name="Score"
                dataKey="A"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Fraud Detection Summary */}
      <GlassCard>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-5 w-5 text-danger" />
            Fraud Detection Summary
          </h3>
          <span className="text-sm text-muted-foreground">
            Total incidents: {fraudSummary.reduce((acc, f) => acc + f.count, 0)}
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {fraudSummary.map((fraud) => (
            <div
              key={fraud.type}
              className={cn(
                "rounded-lg border p-4",
                fraud.severity === "critical" && "border-danger/50 bg-danger/5",
                fraud.severity === "high" && "border-danger/30 bg-danger/5",
                fraud.severity === "medium" && "border-warning/30 bg-warning/5",
                fraud.severity === "low" && "border-info/30 bg-info/5"
              )}
            >
              <div className="text-2xl font-bold">{fraud.count}</div>
              <div className="text-sm">{fraud.type}</div>
              <div className={cn(
                "mt-1 text-xs capitalize",
                fraud.severity === "critical" && "text-danger",
                fraud.severity === "high" && "text-danger",
                fraud.severity === "medium" && "text-warning",
                fraud.severity === "low" && "text-info"
              )}>
                {fraud.severity} severity
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Hiring Funnel Health */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <BarChart3 className="h-5 w-5 text-primary" />
            Hiring Funnel Health
          </h3>
          <div className="space-y-4">
            {funnelHealth.map((stage) => (
              <div key={stage.stage}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{stage.stage}</span>
                  <span className="text-muted-foreground">
                    {stage.current}/{stage.target} ({stage.rate}%)
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      stage.rate >= 80 ? "bg-success" :
                      stage.rate >= 60 ? "bg-warning" :
                      "bg-danger"
                    )}
                    style={{ width: `${stage.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <TrendingUp className="h-5 w-5 text-primary" />
            Weekly Interview Trend
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="interviews"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="passRate"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--success))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  );
}
