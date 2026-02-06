import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { TrustScoreBadge, RiskMeter } from "@/components/ui/trust-indicators";
import {
  Users,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Play,
  Eye,
  MoreVertical,
  ArrowUpRight,
  Target,
  Shield,
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
} from "recharts";

// Mock data
const stats = [
  { 
    icon: Briefcase, 
    label: "Jobs Posted", 
    value: "12", 
    change: "+3",
    trend: "up",
    color: "text-primary"
  },
  { 
    icon: Users, 
    label: "Total Candidates", 
    value: "248", 
    change: "+42",
    trend: "up",
    color: "text-success"
  },
  { 
    icon: CheckCircle2, 
    label: "Interviews Completed", 
    value: "156", 
    change: "+28",
    trend: "up",
    color: "text-info"
  },
  { 
    icon: Target, 
    label: "Avg AI Confidence", 
    value: "87%", 
    change: "+5%",
    trend: "up",
    color: "text-warning"
  },
  { 
    icon: AlertTriangle, 
    label: "Fraud Alerts", 
    value: "7", 
    change: "-2",
    trend: "down",
    color: "text-danger"
  },
  { 
    icon: Shield, 
    label: "Verified Candidates", 
    value: "189", 
    change: "+15",
    trend: "up",
    color: "text-success"
  },
];

const funnelData = [
  { stage: "Applied", count: 248, fill: "hsl(var(--primary))" },
  { stage: "Screening", count: 180, fill: "hsl(var(--primary) / 0.8)" },
  { stage: "Technical", count: 95, fill: "hsl(var(--primary) / 0.6)" },
  { stage: "Final", count: 42, fill: "hsl(var(--primary) / 0.4)" },
  { stage: "Hired", count: 18, fill: "hsl(var(--success))" },
];

const passFailData = [
  { name: "Passed", value: 156, color: "hsl(var(--success))" },
  { name: "Failed", value: 72, color: "hsl(var(--danger))" },
  { name: "Pending", value: 20, color: "hsl(var(--warning))" },
];

const fieldDistribution = [
  { field: "Frontend", candidates: 45 },
  { field: "Backend", candidates: 38 },
  { field: "Full Stack", candidates: 52 },
  { field: "DevOps", candidates: 28 },
  { field: "AI/ML", candidates: 35 },
  { field: "Data Science", candidates: 30 },
];

const weeklyTrend = [
  { day: "Mon", interviews: 12, hires: 2 },
  { day: "Tue", interviews: 18, hires: 3 },
  { day: "Wed", interviews: 15, hires: 2 },
  { day: "Thu", interviews: 22, hires: 4 },
  { day: "Fri", interviews: 28, hires: 5 },
  { day: "Sat", interviews: 8, hires: 1 },
  { day: "Sun", interviews: 5, hires: 1 },
];

const liveInterviews = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Senior Frontend Developer",
    stage: "Technical Round",
    trustScore: 94,
    timeElapsed: "23:45",
  },
  {
    id: 2,
    name: "Michael Park",
    role: "Backend Engineer",
    stage: "System Design",
    trustScore: 87,
    timeElapsed: "45:12",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Full Stack Developer",
    stage: "Behavioral",
    trustScore: 56,
    timeElapsed: "18:30",
  },
];

const recentActivity = [
  { type: "hired", name: "John Smith", role: "DevOps Engineer", time: "2h ago" },
  { type: "interview", name: "Lisa Wang", role: "Data Scientist", time: "3h ago" },
  { type: "applied", name: "Alex Johnson", role: "ML Engineer", time: "4h ago" },
  { type: "flagged", name: "Unknown", role: "Backend Developer", time: "5h ago" },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Monitor your hiring pipeline and interview performance
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/dashboard/analytics">
              View Analytics
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="hero" asChild>
            <Link to="/dashboard/jobs/new">Post New Job</Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <GlassCard className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className={cn("rounded-lg bg-secondary p-2", stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  stat.trend === "up" ? "text-success" : "text-danger"
                )}>
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hiring Funnel */}
        <GlassCard className="lg:col-span-1">
          <h3 className="mb-4 text-lg font-semibold">Hiring Funnel</h3>
          <div className="space-y-3">
            {funnelData.map((stage, idx) => (
              <div key={stage.stage}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{stage.stage}</span>
                  <span className="font-medium">{stage.count}</span>
                </div>
                <div className="h-8 overflow-hidden rounded-lg bg-secondary">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stage.count / funnelData[0].count) * 100}%` }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className="h-full rounded-lg"
                    style={{ backgroundColor: stage.fill }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Pass/Fail Ratio */}
        <GlassCard className="lg:col-span-1">
          <h3 className="mb-4 text-lg font-semibold">Interview Results</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={passFailData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {passFailData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex justify-center gap-4">
            {passFailData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="h-3 w-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Field Distribution */}
        <GlassCard className="lg:col-span-1">
          <h3 className="mb-4 text-lg font-semibold">Field Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={fieldDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis 
                type="category" 
                dataKey="field" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                width={80}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Bar dataKey="candidates" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Weekly Trend & Live Interviews */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Trend */}
        <GlassCard>
          <h3 className="mb-4 text-lg font-semibold">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={weeklyTrend}>
              <defs>
                <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="interviews" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorInterviews)" 
              />
              <Area 
                type="monotone" 
                dataKey="hires" 
                stroke="hsl(var(--success))" 
                fillOpacity={1} 
                fill="url(#colorHires)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Live Interviews */}
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
              <h3 className="text-lg font-semibold">Live Interviews</h3>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/candidates">View All</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {liveInterviews.map((interview) => (
              <div
                key={interview.id}
                className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold">
                    {interview.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-medium">{interview.name}</p>
                    <p className="text-sm text-muted-foreground">{interview.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrustScoreBadge score={interview.trustScore} size="sm" />
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {interview.timeElapsed}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/interview/${interview.id}`}>
                      <Eye className="mr-1 h-3 w-3" />
                      Watch
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Recent Activity */}
      <GlassCard>
        <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
        <div className="divide-y divide-border">
          {recentActivity.map((activity, idx) => (
            <div key={idx} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  activity.type === "hired" && "bg-success/20 text-success",
                  activity.type === "interview" && "bg-primary/20 text-primary",
                  activity.type === "applied" && "bg-info/20 text-info",
                  activity.type === "flagged" && "bg-danger/20 text-danger"
                )}>
                  {activity.type === "hired" && <CheckCircle2 className="h-4 w-4" />}
                  {activity.type === "interview" && <Play className="h-4 w-4" />}
                  {activity.type === "applied" && <Users className="h-4 w-4" />}
                  {activity.type === "flagged" && <AlertTriangle className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {activity.type === "hired" && `${activity.name} was hired`}
                    {activity.type === "interview" && `${activity.name} completed interview`}
                    {activity.type === "applied" && `${activity.name} applied`}
                    {activity.type === "flagged" && "Fraud alert detected"}
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.role}</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
