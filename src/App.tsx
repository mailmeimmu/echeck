import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { AuthPage } from './pages/Auth';
import { AnimatePresence } from 'framer-motion';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { AdminLayout } from './components/layout/AdminLayout';
import { EngineerLayout } from './components/layout/EngineerLayout';
import { useEffect, useState } from 'react';
import { LandingPage } from './pages/Landing';
import { ResetPassword } from './pages/ResetPassword';
import { Suspense } from 'react';
import React from 'react';

// Lazy load route components
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard'));
const BookingsPage = React.lazy(() => import('./pages/admin/BookingsPage'));
const EngineersPage = React.lazy(() => import('./pages/admin/EngineersPage'));
const ReportsPage = React.lazy(() => import('./pages/admin/ReportsPage'));
const EngineerDashboard = React.lazy(() => import('./pages/EngineerDashboard'));
const EngineerProfile = React.lazy(() => import('./pages/EngineerProfile'));

export default function App() {
  const { user, initialized, isEngineer, isAdmin } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reduced initial loading time
    const timer = setTimeout(() => { 
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!initialized || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        {!user ? (
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : isAdmin ? (
          <AdminLayout>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/bookings" element={<BookingsPage />} />
                <Route path="/admin/engineers" element={<EngineersPage />} />
                <Route path="/admin/reports" element={<ReportsPage />} />
                <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </Suspense>
          </AdminLayout>
        ) : isEngineer ? (
          <EngineerLayout>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/engineer" element={<EngineerDashboard />} />
                <Route path="/engineer/profile" element={<EngineerProfile />} />
                <Route path="*" element={<Navigate to="/engineer" replace />} />
              </Routes>
            </Suspense>
          </EngineerLayout>
        ) : (
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        )}
      </AnimatePresence>
    </BrowserRouter>
  );
}