import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PrisonDataProvider } from './context/PrisonDataContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/Toast';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Prisoners } from './pages/Prisoners';
import { Cells } from './pages/Cells';
import { Visitors } from './pages/Visitors';
import { Cases } from './pages/Cases';
import { Releases } from './pages/Releases';
import { Reports } from './pages/Reports';
import { Notifications } from './pages/Notifications';
import { AuditLogs } from './pages/AuditLogs';
import { AcademicGuide } from './pages/AcademicGuide';
import { Settings } from './pages/Settings';

const MainLayout: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // If not logged in, render the Login Screen
  if (!currentUser) {
    return <Login onLoginSuccess={() => setActiveTab('dashboard')} />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={(tab) => setActiveTab(tab)} />;
      case 'prisoners':
        return <Prisoners />;
      case 'cells':
        return <Cells />;
      case 'visitors':
        return <Visitors />;
      case 'cases':
        return <Cases />;
      case 'releases':
        return <Releases />;
      case 'reports':
        return <Reports />;
      case 'notifications':
        return <Notifications />;
      case 'audit':
      case 'audit-logs':
        return <AuditLogs />;
      case 'academic':
      case 'academic-guide':
        return <AcademicGuide />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onNavigate={setActiveTab}
        activeTab={activeTab}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsSidebarOpen(false);
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Workspace Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PrisonDataProvider>
        <MainLayout />
      </PrisonDataProvider>
    </AuthProvider>
  );
}
