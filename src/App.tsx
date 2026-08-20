import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { NotificationProvider, useNotifications } from './context/NotificationContext.js';
import { Header } from './components/common/Header.js';
import { Sidebar } from './components/common/Sidebar.js';
import { CommandPalette } from './components/common/CommandPalette.js';
import { AIAssistantDrawer } from './components/common/AIAssistantDrawer.js';
import { QrCodeModal } from './components/common/QrCodeModal.js';
import { VoiceRecorderModal } from './components/common/VoiceRecorderModal.js';

// Dashboards and Views
import { LandingPage } from './components/landing/LandingPage.js';
import { AuthPage } from './components/auth/AuthPage.js';
import { HospitalAdminDashboard } from './components/dashboards/HospitalAdminDashboard.js';
import { DoctorWorkspace } from './components/dashboards/DoctorWorkspace.js';
import { NurseDashboard } from './components/dashboards/NurseDashboard.js';
import { LabTechDashboard } from './components/dashboards/LabTechDashboard.js';
import { PharmacistDashboard } from './components/dashboards/PharmacistDashboard.js';
import { InpatientBedManager } from './components/dashboards/InpatientBedManager.js';
import { AccountantDashboard } from './components/dashboards/AccountantDashboard.js';
import { PatientDirectory } from './components/dashboards/PatientDirectory.js';
import { AppointmentManager } from './components/dashboards/AppointmentManager.js';
import { PatientPortal } from './components/dashboards/PatientPortal.js';
import { SuperAdminDashboard } from './components/dashboards/SuperAdminDashboard.js';
import { StaffManager } from './components/dashboards/StaffManager.js';
import { SettingsAndWhiteLabel } from './components/dashboards/SettingsAndWhiteLabel.js';
import { PrescriptionList } from './components/dashboards/PrescriptionList.js';
import { UserRole } from './types/index.js';

const MainAppContent: React.FC = () => {
  const { user, switchRole, login, signup } = useAuth();
  const { toasts, removeToast } = useNotifications();

  // Top-level routing: 'landing' | 'auth' | 'app'
  const [rootView, setRootView] = useState<'landing' | 'auth' | 'app'>('landing');
  const [activeView, setActiveView] = useState<string>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceContext, setVoiceContext] = useState<string>('Clinical notes dictation');

  // Handle direct role selection from landing or command palette
  const handleSelectRoleFromLanding = (role: UserRole) => {
    switchRole(role);
    if (role === 'DOCTOR') setActiveView('DOCTOR_WORKSPACE');
    else if (role === 'HOSPITAL_ADMIN') setActiveView('DASHBOARD');
    else if (role === 'NURSE') setActiveView('NURSE_STATION');
    else if (role === 'LAB_TECHNICIAN') setActiveView('LAB_ORDERS');
    else if (role === 'PHARMACIST') setActiveView('PHARMACY');
    else if (role === 'ACCOUNTANT') setActiveView('BILLING');
    else if (role === 'PATIENT') setActiveView('PATIENT_PORTAL');
    else if (role === 'SUPER_ADMIN') setActiveView('SUPER_ADMIN');
    else setActiveView('DASHBOARD');
  };

  const handleLaunchApp = () => {
    // Landing CTA → go to auth page
    setRootView('auth');
  };

  const handleAuthLogin = async (email?: string, role?: any) => {
    await login(email, role);
    setRootView('app');
    setActiveView('DASHBOARD');
  };

  const handleAuthSignup = async (data: any) => {
    await signup(data);
    setRootView('app');
    setActiveView('DASHBOARD');
  };

  const handleOpenVoice = (contextText?: string) => {
    if (contextText) setVoiceContext(contextText);
    setIsVoiceModalOpen(true);
  };

  // Determine current component based on activeView & role
  const renderActiveView = () => {
    switch (activeView) {
      case 'LANDING':
        return (
          <LandingPage
            onLaunchApp={handleLaunchApp}
            onSelectRole={handleSelectRoleFromLanding}
          />
        );

      case 'DOCTOR_WORKSPACE':
        return <DoctorWorkspace onOpenVoiceRecorder={handleOpenVoice} />;

      case 'NURSE_STATION':
        return <NurseDashboard />;

      case 'LAB_ORDERS':
        return <LabTechDashboard />;

      case 'PHARMACY':
        return <PharmacistDashboard />;

      case 'BED_MANAGEMENT':
        return <InpatientBedManager />;

      case 'BILLING':
        return <AccountantDashboard />;

      case 'PATIENT_DIRECTORY':
        return <PatientDirectory />;

      case 'APPOINTMENTS':
        return <AppointmentManager />;

      case 'PRESCRIPTIONS':
        return <PrescriptionList />;

      case 'PATIENT_PORTAL':
        return <PatientPortal />;

      case 'SUPER_ADMIN':
        return <SuperAdminDashboard />;

      case 'STAFF_DIRECTORY':
        return <StaffManager />;

      case 'SETTINGS':
        return <SettingsAndWhiteLabel />;

      case 'DASHBOARD':
      default:
        if (user?.role === 'DOCTOR') {
          return <DoctorWorkspace onOpenVoiceRecorder={handleOpenVoice} />;
        }
        if (user?.role === 'SUPER_ADMIN') {
          return <SuperAdminDashboard />;
        }
        if (user?.role === 'NURSE') {
          return <NurseDashboard />;
        }
        if (user?.role === 'LAB_TECHNICIAN') {
          return <LabTechDashboard />;
        }
        if (user?.role === 'PHARMACIST') {
          return <PharmacistDashboard />;
        }
        if (user?.role === 'ACCOUNTANT') {
          return <AccountantDashboard />;
        }
        if (user?.role === 'PATIENT') {
          return <PatientPortal />;
        }
        return <HospitalAdminDashboard />;
    }
  };

  // When user logs out while in app, go back to landing
  useEffect(() => {
    if (!user && rootView === 'app') {
      setRootView('landing');
    }
  }, [user, rootView]);

  if (rootView === 'landing' || activeView === 'LANDING') {
    return (
      <LandingPage
        onLaunchApp={handleLaunchApp}
        onSelectRole={(role) => {
          setRootView('auth');
        }}
      />
    );
  }

  if (rootView === 'auth' || !user) {
    return (
      <AuthPage
        onLogin={handleAuthLogin}
        onSignup={handleAuthSignup}
        onGoToLanding={() => setRootView('landing')}
      />
    );
  }

  // ── Roles with their OWN full-screen portal (no shared Header/Sidebar) ──────
  if (user?.role === 'NURSE') {
    return (
      <>
        <NurseDashboard />
        {/* Toast overlay still available */}
        <div className="fixed bottom-4 right-4 z-[200] flex flex-col space-y-2 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-2xl shadow-xl border text-xs flex justify-between items-start space-x-3 max-w-sm ${toast.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : toast.type === 'error'
                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                    : toast.type === 'warning'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-white text-slate-800 border-slate-200'
                }`}
            >
              <div>
                <p className="font-bold">{toast.title}</p>
                {toast.message && <p className="text-[11px] opacity-90 mt-0.5">{toast.message}</p>}
              </div>
              <button onClick={() => removeToast(toast.id)} className="text-xs opacity-60 hover:opacity-100 p-1">&times;</button>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Application Header */}
      <Header
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenAIAssistant={() => setIsAIDrawerOpen(true)}
        onOpenQrScanner={() => setIsQrModalOpen(true)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Navigation Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeView={activeView}
          onNavigate={(view) => {
            setActiveView(view);
            setIsSidebarOpen(false);
          }}
          onOpenAIAssistant={() => setIsAIDrawerOpen(true)}
        />

        {/* Dynamic Viewport */}
        <main className="flex-1 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Quick Global Modals */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(view) => setActiveView(view)}
        onOpenAIAssistant={() => setIsAIDrawerOpen(true)}
      />

      <AIAssistantDrawer
        isOpen={isAIDrawerOpen}
        onClose={() => setIsAIDrawerOpen(false)}
      />

      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      <VoiceRecorderModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        contextDescription={voiceContext}
      />

      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border text-xs flex justify-between items-start space-x-3 max-w-sm animate-in slide-in-from-bottom-2 duration-200 ${toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-emerald-100'
                : toast.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-rose-100'
                  : toast.type === 'warning'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-amber-100'
                    : 'bg-white text-slate-800 border-slate-200 shadow-slate-100'
              }`}
          >
            <div>
              <p className="font-bold">{toast.title}</p>
              {toast.message && <p className="text-[11px] opacity-90 mt-0.5">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-xs opacity-60 hover:opacity-100 p-1"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainAppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}
