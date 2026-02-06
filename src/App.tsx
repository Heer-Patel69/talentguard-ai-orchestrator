import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

// Pages
import LandingPage from "./pages/LandingPage";
import RoleSelectionPage from "./pages/auth/RoleSelectionPage";
import InterviewerRegisterPage from "./pages/auth/InterviewerRegisterPage";
import CandidateRegisterPage from "./pages/auth/CandidateRegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import FaceVerificationPage from "./pages/auth/FaceVerificationPage";
import CandidateDashboardPage from "./pages/CandidateDashboardPage";
import InterviewPage from "./pages/InterviewPage";
import CandidateReportPage from "./pages/CandidateReportPage";
import NotFound from "./pages/NotFound";

// Dashboard Pages
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import PostJobPage from "./pages/dashboard/PostJobPage";
import ManageJobsPage from "./pages/dashboard/ManageJobsPage";
import CandidatesPage from "./pages/dashboard/CandidatesPage";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/register" element={<RoleSelectionPage />} />
              <Route path="/register/interviewer" element={<InterviewerRegisterPage />} />
              <Route path="/register/candidate" element={<CandidateRegisterPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Routes - Candidate */}
              <Route
                path="/verify-face"
                element={
                  <ProtectedRoute allowedRoles={["candidate"]}>
                    <FaceVerificationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["candidate"]}>
                    <CandidateDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes - Interviewer Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["interviewer"]}>
                    <DashboardLayout>
                      <DashboardOverview />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/jobs"
                element={
                  <ProtectedRoute allowedRoles={["interviewer"]}>
                    <DashboardLayout>
                      <ManageJobsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/jobs/new"
                element={
                  <ProtectedRoute allowedRoles={["interviewer"]}>
                    <DashboardLayout>
                      <PostJobPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/candidates"
                element={
                  <ProtectedRoute allowedRoles={["interviewer"]}>
                    <DashboardLayout>
                      <CandidatesPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/analytics"
                element={
                  <ProtectedRoute allowedRoles={["interviewer"]}>
                    <DashboardLayout>
                      <AnalyticsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/settings"
                element={
                  <ProtectedRoute allowedRoles={["interviewer"]}>
                    <DashboardLayout>
                      <SettingsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Interview & Report Pages */}
              <Route
                path="/interview"
                element={
                  <ProtectedRoute allowedRoles={["interviewer"]}>
                    <InterviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/interview/:id"
                element={
                  <ProtectedRoute allowedRoles={["interviewer"]}>
                    <InterviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/report/:id"
                element={
                  <ProtectedRoute allowedRoles={["interviewer"]}>
                    <CandidateReportPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
