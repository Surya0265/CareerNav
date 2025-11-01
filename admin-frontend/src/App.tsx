import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { ToastProvider } from './components/shared/ToastProvider'
import { ProtectedAdminRoute } from './components/ProtectedAdminRoute'
import { AdminLogin } from './pages/AdminLogin'
import { AdminSignup } from './pages/AdminSignup'
import { AdminVerifyEmail } from './pages/AdminVerifyEmail'
import { AdminVerificationSent } from './pages/AdminVerificationSent'
import { AdminForgotPassword } from './pages/AdminForgotPassword'
import { AdminResetPassword } from './pages/AdminResetPassword'
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminProfile } from './pages/AdminProfile'

function App() {
  return (
    <Router>
      <AdminAuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/signup" element={<AdminSignup />} />
            <Route path="/verify-email" element={<AdminVerifyEmail />} />
            <Route path="/verification-sent" element={<AdminVerificationSent />} />
            <Route path="/forgot-password" element={<AdminForgotPassword />} />
            <Route path="/reset-password" element={<AdminResetPassword />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedAdminRoute>
                  <AdminProfile />
                </ProtectedAdminRoute>
              }
            />

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AdminAuthProvider>
    </Router>
  )
}

export default App
