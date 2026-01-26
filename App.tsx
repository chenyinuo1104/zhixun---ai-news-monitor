import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Statistics from './pages/Statistics';
import Assistant from './pages/Assistant';
import Profile from './pages/Profile';
import BottomNav from './components/BottomNav';
import { AuthProvider, useAuth } from './context/AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const showNav = location.pathname !== '/';

  return (
    <div className="relative h-full w-full bg-background flex flex-col overflow-hidden">
      {/* Scrollable Content Area */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden no-scrollbar relative z-0">
        {children}
      </div>

      {/* Nav Overlay - Fixed relative to the App Frame */}
      {showNav && <BottomNav />}
    </div>
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-[#F0F8FF]">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/statistics"
          element={
            <ProtectedRoute>
              <Statistics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assistant"
          element={
            <ProtectedRoute>
              <Assistant />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <div className="flex items-center justify-center h-full bg-[#F8F9FB] text-slate-400 font-bold">Alerts Screen Placeholder</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;