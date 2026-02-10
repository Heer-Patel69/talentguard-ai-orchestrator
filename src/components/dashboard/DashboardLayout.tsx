import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Brain,
  LayoutDashboard,
  Briefcase,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Plus,
  ChevronDown,
  Building2,
  Bell,
  Search,
  Scale,
  Target,
  GraduationCap,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const sidebarLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/command-center", label: "Command Center", icon: Target },
  { href: "/dashboard/jobs", label: "Manage Jobs", icon: Briefcase },
  { href: "/dashboard/candidates", label: "Candidates", icon: Users },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/fairness", label: "Fairness", icon: Scale },
  { href: "/dashboard/learning", label: "AI Learning", icon: GraduationCap },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen border-r border-border/50 bg-card/95 backdrop-blur-xl transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
              <Brain className="h-5 w-5 text-white" />
            </div>
            {sidebarOpen && (
              <span className="text-lg font-bold font-display tracking-tight">
                Hire<span className="gradient-text">Minds</span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:block"
          >
            <ChevronDown
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform",
                !sidebarOpen && "rotate-90"
              )}
            />
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Post Job Button */}
        <div className="p-4">
          <Button
            variant="hero"
            className={cn("w-full", !sidebarOpen && "px-0")}
            onClick={() => navigate("/dashboard/jobs/new")}
          >
            <Plus className="h-4 w-4" />
            {sidebarOpen && <span className="ml-2">Post a Job</span>}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 px-3">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.href || 
              (link.href !== "/dashboard" && location.pathname.startsWith(link.href));
            
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm shadow-primary/10"
                    : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
                  !sidebarOpen && "justify-center"
                )}
              >
                <link.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border/50 p-4">
          <div className={cn("flex items-center gap-3", !sidebarOpen && "justify-center")}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">Company</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            )}
            {sidebarOpen && (
              <button
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "min-h-screen transition-all duration-300",
          sidebarOpen ? "lg:pl-64" : "lg:pl-20"
        )}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search jobs, candidates..."
                className="h-9 w-64 rounded-xl border border-border/50 bg-secondary/50 pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="relative rounded-lg p-2 hover:bg-secondary">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
