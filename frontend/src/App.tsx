import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/authStore';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { NoticeFeedPage } from './pages/student/NoticeFeedPage';
import { NoticeDetailPage } from './pages/student/NoticeDetailPage';
import { DeadlinesPage } from './pages/student/DeadlinesPage';
import { TasksPage } from './pages/student/TasksPage';
import { NotificationsPage } from './pages/student/NotificationsPage';
import { ProfilePage } from './pages/student/ProfilePage';

// Admin Pages
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard').then(m => ({default: m.AdminDashboard})));
const NoticeManagementPage = React.lazy(() => import('./pages/admin/NoticeManagementPage').then(m => ({default: m.NoticeManagementPage})));
const UploadNoticePage = React.lazy(() => import('./pages/admin/UploadNoticePage').then(m => ({default: m.UploadNoticePage})));
const CreateNoticePage = React.lazy(() => import('./pages/admin/CreateNoticePage').then(m => ({default: m.CreateNoticePage})));
const AnalyticsPage = React.lazy(() => import('./pages/admin/AnalyticsPage').then(m => ({default: m.AnalyticsPage})));

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
  children,
  adminOnly = false,
}) => {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center text-xs font-mono text-muted">
        <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
        Authenticating session...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <React.Suspense fallback={<p className="text-center p-12 text-muted">Loading portal…</p>}>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Student & General Dashboard */}
            <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
            <Route path="/notices" element={<NoticeFeedPage />} />
            <Route path="/notices/:id" element={<NoticeDetailPage />} />
            <Route path="/deadlines" element={<DeadlinesPage />} />
            <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/upload" element={<Navigate to="/admin/upload" replace />} />
            <Route path="/student" element={<Navigate to="/dashboard" replace />} />

            {/* Admin Management Pages */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/notices"
              element={
                <ProtectedRoute adminOnly>
                  <NoticeManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/upload"
              element={
                <ProtectedRoute adminOnly>
                  <UploadNoticePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/create"
              element={
                <ProtectedRoute adminOnly>
                  <CreateNoticePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute adminOnly>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </React.Suspense>
        </AppLayout>
      </Router>
    </AuthProvider>
  );
};

export default App;
