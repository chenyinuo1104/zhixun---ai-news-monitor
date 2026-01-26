import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Statistics from './pages/Statistics';
import Assistant from './pages/Assistant';
import Profile from './pages/Profile';
import BottomNav from './components/BottomNav';

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

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/alerts" element={<div className="flex items-center justify-center h-full bg-[#F8F9FB] text-slate-400 font-bold">Alerts Screen Placeholder</div>} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;