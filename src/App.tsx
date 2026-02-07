import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CandidateDashboardLayout } from "@/components/candidate/CandidateDashboardLayout";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { RouteLoader } from "@/components/ui/loading-spinner";

// Lazy loaded pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const RoleSelectionPage = lazy(() => import("./pages/auth/RoleSelectionPage"));
const InterviewerRegisterPage = lazy(() => import("./pages/auth/InterviewerRegisterPage"));
const CandidateRegisterPage = lazy(() => import("./pages/auth/CandidateRegisterPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const FaceVerificationPage = lazy(() => import("./pages/auth/FaceVerificationPage"));
const CandidateDashboardPage = lazy(() => import("./pages/CandidateDashboardPage"));
const InterviewPage = lazy(() => import("./pages/InterviewPage"));
const CandidateReportPage = lazy(() => import("./pages/CandidateReportPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ForCompaniesPage = lazy(() => import("./pages/ForCompaniesPage"));
const ForCandidatesPage = lazy(() => import("./pages/ForCandidatesPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));

// Dashboard Pages (Interviewer)
const DashboardOverview = lazy(() => import("./pages/dashboard/DashboardOverview"));
const PostJobPage = lazy(() => import("./pages/dashboard/PostJobPage"));
const ManageJobsPage = lazy(() => import("./pages/dashboard/ManageJobsPage"));
const EditJobPage = lazy(() => import("./pages/dashboard/EditJobPage"));
const CandidatesPage = lazy(() => import("./pages/dashboard/CandidatesPage"));
const AnalyticsPage = lazy(() => import("./pages/dashboard/AnalyticsPage"));
const SettingsPage = lazy(() => import("./pages/dashboard/SettingsPage"));
const InterviewerCandidateReportPage = lazy(() => import("./pages/dashboard/CandidateReportPage"));
const FairnessDashboardPage = lazy(() => import("./pages/dashboard/FairnessDashboardPage"));
const CommandCenterPage = lazy(() => import("./pages/dashboard/CommandCenterPage"));
const LearningDashboardPage = lazy(() => import("./pages/dashboard/LearningDashboardPage"));

// Candidate Dashboard Pages
const CandidateOverviewPage = lazy(() => import("./pages/candidate/CandidateOverviewPage"));
const BrowseJobsPage = lazy(() => import("./pages/candidate/BrowseJobsPage"));
const JobDetailsPage = lazy(() => import("./pages/candidate/JobDetailsPage"));
const MyApplicationsPage = lazy(() => import("./pages/candidate/MyApplicationsPage"));
const CandidateProfilePage = lazy(() => import("./pages/candidate/CandidateProfilePage"));
const InterviewRoomPage = lazy(() => import("./pages/candidate/InterviewRoomPage"));
const AIInterviewRoomPage = lazy(() => import("./pages/candidate/AIInterviewRoomPage"));
const MCQAssessmentPage = lazy(() => import("./pages/candidate/MCQAssessmentPage"));
const CodingChallengePage = lazy(() => import("./pages/candidate/CodingChallengePage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<RouteLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/register" element={<RoleSelectionPage />} />
                  <Route path="/register/interviewer" element={<InterviewerRegisterPage />} />
                  <Route path="/register/candidate" element={<CandidateRegisterPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/for-companies" element={<ForCompaniesPage />} />
                  <Route path="/for-candidates" element={<ForCandidatesPage />} />
                  <Route path="/pricing" element={<PricingPage />} />

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
                    path="/candidate/assessment/mcq"
                    element={
                      <ProtectedRoute allowedRoles={["candidate"]}>
                        <MCQAssessmentPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/candidate/assessment/coding"
                    element={
                      <ProtectedRoute allowedRoles={["candidate"]}>
                        <CodingChallengePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Interviewer Dashboard Routes */}
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
                  path="/dashboard/jobs/:id/edit"
                  element={
                    <ProtectedRoute allowedRoles={["interviewer"]}>
                      <DashboardLayout>
                        <EditJobPage />
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
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
