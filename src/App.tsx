import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import LandingPage from "./pages/LandingPage";
import RoleSelectionPage from "./pages/auth/RoleSelectionPage";
import InterviewerRegisterPage from "./pages/auth/InterviewerRegisterPage";
import CandidateRegisterPage from "./pages/auth/CandidateRegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import FaceVerificationPage from "./pages/auth/FaceVerificationPage";
import DashboardPage from "./pages/DashboardPage";
import CandidateDashboardPage from "./pages/CandidateDashboardPage";
import InterviewPage from "./pages/InterviewPage";
import CandidateReportPage from "./pages/CandidateReportPage";
import NotFound from "./pages/NotFound";

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

              {/* Protected Routes - Interviewer */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["interviewer"]}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
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
