import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Search,
  Briefcase,
  MapPin,
  Clock,
  Building2,
  Filter,
  X,
  ChevronRight,
  Zap,
  Calendar,
  Star,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Job {
  id: string;
  title: string;
  description: string | null;
  field: string;
  experience_level: string;
  location_type: string;
  location_city: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  toughness_level: string;
  num_rounds: number;
  application_deadline: string | null;
  required_skills: string[];
  created_at: string;
  match_score?: number;
  matching_skills?: string[];
  is_favorited?: boolean;
  priority_level?: number;
}

const fields = [
  "All Fields",
  "DSA",
  "Software Engineering",
  "AI/ML",
  "Data Science",
  "DevOps",
  "Cybersecurity",
  "Frontend",
  "Backend",
  "Full Stack",
  "Mobile Development",
];

const experienceLevels = [
  { value: "all", label: "All Levels" },
  { value: "fresher", label: "Fresher" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-Level" },
  { value: "senior", label: "Senior" },
  { value: "architect", label: "Architect" },
];

const locationTypes = [
  { value: "all", label: "All Locations" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

export default function BrowseJobsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("match");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedField, setSelectedField] = useState("All Fields");
  const [selectedExperience, setSelectedExperience] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [salaryRange, setSalaryRange] = useState([0, 5000000]);

  useEffect(() => {
    fetchJobs();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [jobs, searchQuery, selectedField, selectedExperience, selectedLocation, salaryRange, sortBy]);

  const fetchJobs = async () => {
    try {
      // Fetch all active jobs
      const { data: jobsData, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;

      let enrichedJobs = jobsData || [];

      // If user is logged in, fetch job priorities
      if (user) {
        const { data: priorities } = await supabase
          .from("job_priorities")
          .select("job_id, match_score, matching_skills, is_favorited, priority_level")
          .eq("candidate_id", user.id);

        const priorityMap = new Map((priorities || []).map(p => [p.job_id, p]));

        enrichedJobs = enrichedJobs.map(job => {
          const priority = priorityMap.get(job.id);
          return {
            ...job,
            match_score: priority?.match_score || 0,
            matching_skills: priority?.matching_skills || [],
            is_favorited: priority?.is_favorited || false,
            priority_level: priority?.priority_level || 0,
          };
        });
      }

      setJobs(enrichedJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.field.toLowerCase().includes(query) ||
          job.description?.toLowerCase().includes(query) ||
          job.required_skills?.some((skill) => skill.toLowerCase().includes(query))
      );
    }

    // Field filter
    if (selectedField !== "All Fields") {
      filtered = filtered.filter((job) => job.field === selectedField);
    }

    // Experience filter
    if (selectedExperience !== "all") {
      filtered = filtered.filter((job) => job.experience_level === selectedExperience);
    }

    // Location filter
    if (selectedLocation !== "all") {
      filtered = filtered.filter((job) => job.location_type === selectedLocation);
    }

    // Salary filter
    filtered = filtered.filter((job) => {
      const minSalary = job.salary_min || 0;
      return minSalary >= salaryRange[0] && minSalary <= salaryRange[1];
    });

    // Sort
    if (sortBy === "match") {
      filtered.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
    } else if (sortBy === "salary") {
      filtered.sort((a, b) => (b.salary_min || 0) - (a.salary_min || 0));
    } else if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setFilteredJobs(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedField("All Fields");
    setSelectedExperience("all");
    setSelectedLocation("all");
    setSalaryRange([0, 5000000]);
  };

  const formatSalary = (min: number | null, max: number | null, currency: string) => {
    if (!min && !max) return "Not disclosed";
    const formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
    });
    if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`;
    if (min) return `${formatter.format(min)}+`;
    return `Up to ${formatter.format(max!)}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntilDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const days = Math.ceil(
      (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-success border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Browse Jobs</h1>
        <p className="text-muted-foreground">
          Find your next opportunity from {jobs.length} active positions
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search jobs, skills, companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="match">Best Match</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="salary">Highest Salary</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="md:w-auto"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {(selectedField !== "All Fields" ||
              selectedExperience !== "all" ||
              selectedLocation !== "all") && (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-success text-xs text-white">
                !
              </span>
            )}
          </Button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-1 h-3 w-3" />
                  Clear All
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Field</label>
                  <Select value={selectedField} onValueChange={setSelectedField}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fields.map((field) => (
                        <SelectItem key={field} value={field}>
                          {field}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Experience</label>
                  <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Location</label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Salary Range (₹{(salaryRange[0] / 100000).toFixed(0)}L - ₹{(salaryRange[1] / 100000).toFixed(0)}L)
                  </label>
                  <Slider
                    value={salaryRange}
                    onValueChange={setSalaryRange}
                    min={0}
                    max={5000000}
                    step={100000}
                    className="mt-3"
                  />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredJobs.length} of {jobs.length} jobs
      </p>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <GlassCard className="py-12 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No jobs found</h3>
          <p className="mt-1 text-muted-foreground">
            Try adjusting your search or filters
          </p>
          <Button variant="outline" className="mt-4" onClick={clearFilters}>
            Clear Filters
          </Button>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job, index) => {
            const daysLeft = getDaysUntilDeadline(job.application_deadline);

            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <GlassCard hover className="h-full flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      {job.match_score && job.match_score > 0 && (
                        <span className="text-xs font-medium bg-success/10 text-success px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {job.match_score}%
                        </span>
                      )}
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                          job.toughness_level === "easy" && "bg-success/10 text-success",
                          job.toughness_level === "medium" && "bg-warning/10 text-warning",
                          job.toughness_level === "hard" && "bg-danger/10 text-danger",
                          job.toughness_level === "expert" && "bg-primary/10 text-primary"
                        )}
                      >
                        <Zap className="mr-1 inline h-3 w-3" />
                        {job.toughness_level}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold line-clamp-1">{job.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{job.field}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {job.location_type === "remote"
                        ? "Remote"
                        : job.location_city || job.location_type}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground capitalize">
                      <Briefcase className="h-3 w-3" />
                      {job.experience_level}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {job.num_rounds} rounds
                    </span>
                  </div>

                  {/* Show matching skills if available, otherwise required skills */}
                  {job.matching_skills && job.matching_skills.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {job.matching_skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-success/10 text-success px-2 py-0.5 text-xs font-medium"
                        >
                          ✓ {skill}
                        </span>
                      ))}
                      {job.matching_skills.length > 3 && (
                        <span className="rounded-full bg-success/10 text-success px-2 py-0.5 text-xs">
                          +{job.matching_skills.length - 3} matched
                        </span>
                      )}
                    </div>
                  ) : job.required_skills && job.required_skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {job.required_skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-secondary px-2 py-0.5 text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.required_skills.length > 3 && (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                          +{job.required_skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-border">
                    <div>
                      <p className="text-sm font-semibold text-success">
                        {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                      </p>
                      {daysLeft !== null && daysLeft > 0 && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {daysLeft} days left
                        </p>
                      )}
                    </div>
                    <Button size="sm" className="bg-success hover:bg-success/90" asChild>
                      <Link to={`/candidate/jobs/${job.id}`}>
                        Apply
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
