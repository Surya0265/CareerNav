import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppProviders } from "./providers/AppProviders.tsx";
import { AppLayout } from "../components/layout/AppLayout.tsx";
import { AuthLayout } from "../components/layout/AuthLayout.tsx";
import { ErrorBoundary } from "../components/ErrorBoundary.tsx";
import { useAuth } from "../hooks/useAuth.ts";
import { DashboardPage } from "../pages/Dashboard.tsx";
import { LandingPage } from "../pages/LandingPage.tsx";
import { ResumeUploadPage } from "../pages/ResumeUpload.tsx";
import { AnalysisPage } from "../pages/Analysis.tsx";
import { TimelinePage } from "../pages/Timeline.tsx";
import { TimelineView } from "../pages/TimelineView.tsx";
import { JobRecommendationsPage } from "../pages/JobRecommendations.tsx";
import { YouTubeRecommendationsPage } from "../pages/YouTubeRecommendations.tsx";
import { LoginPage } from "../pages/Login.tsx";
import { SignupPage } from "../pages/Signup.tsx";
import { VerificationSentPage } from "../pages/VerificationSent.tsx";
import { VerifyEmailPage } from "../pages/VerifyEmail.tsx";
import { ForgotPasswordPage } from "../pages/ForgotPassword.tsx";
import { ResetPasswordPage } from "../pages/ResetPassword.tsx";
import type { ReactElement } from "react";

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const { isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return null; // Show nothing while checking auth status
  }

  // Only redirect to login for known protected paths. This prevents the
  // protected layout from redirecting public routes like "/" (LandingPage).
  const protectedPrefixes = [
    "/dashboard",
    "/resume",
    "/analysis",
    "/timeline",
    "/jobs",
    "/youtube",
  ];

  const isProtectedPath = protectedPrefixes.some((p) => location.pathname.startsWith(p));

  if (!isAuthenticated && isProtectedPath) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    
    <Route
      path="/login"
      element={
        <AuthLayout>
          <LoginPage />
        </AuthLayout>
      }
    />
    <Route
      path="/forgot-password"
      element={
        <AuthLayout>
          <ForgotPasswordPage />
        </AuthLayout>
      }
    />
    <Route
      path="/reset-password"
      element={
        <AuthLayout>
          <ResetPasswordPage />
        </AuthLayout>
      }
    />
    <Route
      path="/signup"
      element={
        <AuthLayout>
          <SignupPage />
        </AuthLayout>
      }
    />
    <Route
      path="/verification-sent"
      element={
        <AuthLayout>
          <VerificationSentPage />
        </AuthLayout>
      }
    />
    <Route
      path="/verify-email"
      element={
        <AuthLayout>
          <VerifyEmailPage />
        </AuthLayout>
      }
    />
    <Route
      element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="resume" element={<ResumeUploadPage />} />
      <Route path="analysis" element={<AnalysisPage />} />
      <Route path="timeline" element={<TimelinePage />} />
  <Route path="timeline/:id" element={<TimelineView />} />
      <Route path="jobs" element={<JobRecommendationsPage />} />
      <Route path="youtube" element={<YouTubeRecommendationsPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export const App = () => (
  <ErrorBoundary>
    <AppProviders>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AppProviders>
  </ErrorBoundary>
);

export default App;
