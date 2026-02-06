import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { TrustScoreBadge } from "@/components/ui/trust-indicators";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDashboardStats,
  useHiringFunnel,
  useLiveInterviews,
  useRecentActivity,
  useFieldDistribution,
  useWeeklyActivity,
} from "@/hooks/useDashboardStats";
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

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function DashboardOverview() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: funnelData, isLoading: funnelLoading } = useHiringFunnel();
  const { data: liveInterviews, isLoading: interviewsLoading } = useLiveInterviews();
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity();
  const { data: fieldDistribution, isLoading: fieldLoading } = useFieldDistribution();
  const { data: weeklyTrend, isLoading: weeklyLoading } = useWeeklyActivity();

  const statsConfig = [
    { 
      icon: Briefcase, 
      label: "Jobs Posted", 
      value: stats?.jobsPosted?.toString() || "0", 
      change: "+0",
      trend: "up",
      color: "text-primary"
    },
    { 
      icon: Users, 
      label: "Total Candidates", 
      value: stats?.totalCandidates?.toString() || "0", 
      change: "+0",
      trend: "up",
      color: "text-success"
    },
    { 
      icon: CheckCircle2, 
      label: "Interviews Completed", 
      value: stats?.interviewsCompleted?.toString() || "0", 
      change: "+0",
      trend: "up",
      color: "text-info"
    },
    { 
      icon: Target, 
      label: "Avg AI Confidence", 
      value: `${stats?.avgAIConfidence || 0}%`, 
      change: "+0%",
      trend: "up",
      color: "text-warning"
    },
    { 
      icon: AlertTriangle, 
      label: "Fraud Alerts", 
      value: stats?.fraudAlerts?.toString() || "0", 
      change: "0",
      trend: "down",
      color: "text-danger"
    },
    { 
      icon: Shield, 
      label: "Verified Candidates", 
      value: stats?.verifiedCandidates?.toString() || "0", 
      change: "+0",
      trend: "up",
      color: "text-success"
    },
  ];

  const passFailData = [
    { name: "Completed", value: stats?.interviewsCompleted || 0, color: "hsl(var(--success))" },
    { name: "In Progress", value: (stats?.totalCandidates || 0) - (stats?.interviewsCompleted || 0), color: "hsl(var(--warning))" },
    { name: "Fraud Flagged", value: stats?.fraudAlerts || 0, color: "hsl(var(--danger))" },
  ];

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
        {statsLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <GlassCard key={i} className="relative overflow-hidden">
              <Skeleton className="h-5 w-10 mb-3" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-24" />
            </GlassCard>
          ))
        ) : (
          statsConfig.map((stat, index) => (
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
          ))
        )}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hiring Funnel */}
        <GlassCard className="lg:col-span-1">
          <h3 className="mb-4 text-lg font-semibold">Hiring Funnel</h3>
          {funnelLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(funnelData || []).map((stage, idx) => {
                const maxCount = funnelData?.[0]?.count || 1;
                return (
                  <div key={stage.stage}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{stage.stage}</span>
                      <span className="font-medium">{stage.count}</span>
                    </div>
                    <div className="h-8 overflow-hidden rounded-lg bg-secondary">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(stage.count / maxCount) * 100}%` }}
                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                        className="h-full rounded-lg bg-primary"
                        style={{ 
                          opacity: 1 - (idx * 0.15),
                          backgroundColor: idx === 4 ? "hsl(var(--success))" : undefined 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
          {fieldLoading ? (
            <div className="h-[220px] flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          ) : (fieldDistribution?.length || 0) > 0 ? (
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
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground">
              No field data available
            </div>
          )}
        </GlassCard>
      </div>

      {/* Weekly Trend & Live Interviews */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Trend */}
        <GlassCard>
          <h3 className="mb-4 text-lg font-semibold">Weekly Activity</h3>
          {weeklyLoading ? (
            <div className="h-[250px] flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={weeklyTrend || []}>
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
          )}
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
          {interviewsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (liveInterviews?.length || 0) > 0 ? (
            <div className="space-y-3">
              {liveInterviews?.map((interview) => (
                <div
                  key={interview.id}
                  className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold">
                      {interview.candidateName.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium">{interview.candidateName}</p>
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
          ) : (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              No active interviews at the moment
            </div>
          )}
        </GlassCard>
      </div>

      {/* Recent Activity */}
      <GlassCard>
        <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
        {activityLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (recentActivity?.length || 0) > 0 ? (
          <div className="divide-y divide-border">
            {recentActivity?.map((activity, idx) => (
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
                      {activity.type === "interview" && `${activity.name} is interviewing`}
                      {activity.type === "applied" && `${activity.name} applied`}
                      {activity.type === "flagged" && `${activity.name} was flagged`}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.role}</p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-24 items-center justify-center text-muted-foreground">
            No recent activity
          </div>
        )}
      </GlassCard>
    </div>
  );
}
