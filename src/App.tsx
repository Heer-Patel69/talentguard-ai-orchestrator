import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CandidateDashboardLayout } from "@/components/candidate/CandidateDashboardLayout";

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

// Dashboard Pages (Interviewer)
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import PostJobPage from "./pages/dashboard/PostJobPage";
import ManageJobsPage from "./pages/dashboard/ManageJobsPage";
import CandidatesPage from "./pages/dashboard/CandidatesPage";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import InterviewerCandidateReportPage from "./pages/dashboard/CandidateReportPage";
import FairnessDashboardPage from "./pages/dashboard/FairnessDashboardPage";
import CommandCenterPage from "./pages/dashboard/CommandCenterPage";
import LearningDashboardPage from "./pages/dashboard/LearningDashboardPage";

// Candidate Dashboard Pages
import CandidateOverviewPage from "./pages/candidate/CandidateOverviewPage";
import BrowseJobsPage from "./pages/candidate/BrowseJobsPage";
import JobDetailsPage from "./pages/candidate/JobDetailsPage";
import MyApplicationsPage from "./pages/candidate/MyApplicationsPage";
import CandidateProfilePage from "./pages/candidate/CandidateProfilePage";
import InterviewRoomPage from "./pages/candidate/InterviewRoomPage";
import AIInterviewRoomPage from "./pages/candidate/AIInterviewRoomPage";

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

              {/* Candidate Dashboard Routes */}
              <Route
                path="/candidate"
                element={
                  <ProtectedRoute allowedRoles={["candidate"]}>
                    <CandidateDashboardLayout>
                      <CandidateOverviewPage />
                    </CandidateDashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/jobs"
                element={
                  <ProtectedRoute allowedRoles={["candidate"]}>
                    <CandidateDashboardLayout>
                      <BrowseJobsPage />
                    </CandidateDashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/jobs/:id"
                element={
                  <ProtectedRoute allowedRoles={["candidate"]}>
                    <CandidateDashboardLayout>
                      <JobDetailsPage />
                    </CandidateDashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/applications"
                element={
                  <ProtectedRoute allowedRoles={["candidate"]}>
                    <CandidateDashboardLayout>
                      <MyApplicationsPage />
                    </CandidateDashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/profile"
                element={
                  <ProtectedRoute allowedRoles={["candidate"]}>
                    <CandidateDashboardLayout>
                      <CandidateProfilePage />
                    </CandidateDashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/interview"
                element={
                  <ProtectedRoute allowedRoles={["candidate"]}>
                    <CandidateDashboardLayout>
                      <InterviewRoomPage />
                    </CandidateDashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/interview/live"
                element={
                  <ProtectedRoute allowedRoles={["candidate"]}>
                    <AIInterviewRoomPage />
                  </ProtectedRoute>
                }
              />

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
              <Route
                path="/dashboard/fairness"
                element={
                  <ProtectedRoute allowedRoles={["interviewer"]}>
                    <DashboardLayout>
                      <FairnessDashboardPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/command-center"
                element={
                  <ProtectedRoute allowedRoles={["interviewer"]}>
                    <DashboardLayout>
                      <CommandCenterPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/learning"
                element={
                  <ProtectedRoute allowedRoles={["interviewer"]}>
                    <DashboardLayout>
                      <LearningDashboardPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/candidates/:id"
                element={
                  <ProtectedRoute allowedRoles={["interviewer"]}>
                    <DashboardLayout>
                      <InterviewerCandidateReportPage />
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
