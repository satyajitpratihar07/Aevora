import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { NotificationProvider, useNotifications } from './context/NotificationContext.js';
import { Header } from './components/common/Header.js';
import { Sidebar } from './components/common/Sidebar.js';
import { CommandPalette } from './components/common/CommandPalette.js';
import { AIAssistantDrawer } from './components/common/AIAssistantDrawer.js';
import { QrCodeModal } from './components/common/QrCodeModal.js';
import { VoiceRecorderModal } from './components/common/VoiceRecorderModal.js';

import { AnimatedLogoLoginPage } from './components/auth/AnimatedLogoLoginPage.js';

type AppRoute =
  | '/role-selection'
  | '/doctor/login'
  | '/admin/login'
  | '/nurse/login'
  | '/technical/login'
  | '/doctor/dashboard'
  | '/admin/dashboard'
  | '/nurse/dashboard'
  | '/technical/dashboard'
  | '/landing'
  | '/auth-general'
  | '/avora/command-center'
  | '/avora/smart-booking'
  | '/avora/emergency'
  | '/avora/workflow-designer'
  | '/avora/icon-dashboard';

// Dashboards and Views
import { LandingPage } from './components/landing/LandingPage.js';
import { AuthPage } from './components/auth/AuthPage.js';
import { HospitalAdminDashboard } from './components/dashboards/HospitalAdminDashboard.js';
import { DoctorWorkspace } from './components/dashboards/DoctorWorkspace.js';
import { NurseDashboard } from './components/dashboards/NurseDashboard.js';
import { TechnicalDashboard } from './components/dashboards/TechnicalDashboard.js';
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
import { HospitalCommandCenter } from './components/avora/HospitalCommandCenter.js';
import { SmartBooking } from './components/avora/SmartBooking.js';
import { EmergencyCoordinator } from './components/avora/EmergencyCoordinator.js';
import { WorkflowDesigner } from './components/avora/WorkflowDesigner.js';
import { ReceptionistWorkspace } from './components/avora/ReceptionistWorkspace.js';
import { AvoraIconLaunchpad } from './components/avora/AvoraIconLaunchpad.js';
import { GeminiChatbotWidget } from './components/common/GeminiChatbotWidget.js';
import { UserRole } from './types/index.js';
import { ShieldAlert, ArrowRight, LogOut } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, login, logout, switchRole } = useAuth();
  const { toasts, removeToast } = useNotifications();

  // Active navigation route state
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('/landing');
  const [activeView, setActiveView] = useState<string>('DASHBOARD');

  // Modals state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceContext, setVoiceContext] = useState<string>('Clinical notes dictation');

  // Sync route on login/logout
  useEffect(() => {
    if (!user) {
      if (currentRoute.includes('/dashboard')) {
        setCurrentRoute('/landing');
      }
    } else {
      // Auto-route logged in user to their role dashboard if not on a valid dashboard
      if (user.role === 'DOCTOR' && currentRoute !== '/doctor/dashboard') {
        setCurrentRoute('/doctor/dashboard');
      } else if (user.role === 'HOSPITAL_ADMIN' && currentRoute !== '/admin/dashboard') {
        setCurrentRoute('/admin/dashboard');
      } else if (user.role === 'NURSE' && currentRoute !== '/nurse/dashboard') {
        setCurrentRoute('/nurse/dashboard');
      } else if (user.role === 'TECHNICAL_STAFF' && currentRoute !== '/technical/dashboard') {
        setCurrentRoute('/technical/dashboard');
      } else if (user.role === 'SUPER_ADMIN' && currentRoute !== '/admin/dashboard') {
        setCurrentRoute('/admin/dashboard');
      }
    }
  }, [user]);

  // Handle selecting a role card from RoleSelectionPage
  const handleRoleCardSelect = (role: UserRole) => {
    if (role === 'DOCTOR') setCurrentRoute('/doctor/login');
    else if (role === 'HOSPITAL_ADMIN') setCurrentRoute('/admin/login');
    else if (role === 'NURSE') setCurrentRoute('/nurse/login');
    else if (role === 'TECHNICAL_STAFF') setCurrentRoute('/technical/login');
    else setCurrentRoute('/auth-general');
  };

  // Quick Demo Shortcut handler
  const handleQuickDemo = async (role: UserRole) => {
    await switchRole(role);
    if (role === 'DOCTOR') setCurrentRoute('/doctor/dashboard');
    else if (role === 'HOSPITAL_ADMIN') setCurrentRoute('/admin/dashboard');
    else if (role === 'NURSE') setCurrentRoute('/nurse/dashboard');
    else if (role === 'TECHNICAL_STAFF') setCurrentRoute('/technical/dashboard');
    else setCurrentRoute('/admin/dashboard');
  };

  const handleOpenVoice = (contextText?: string) => {
    if (contextText) setVoiceContext(contextText);
    setIsVoiceModalOpen(true);
  };

  // 1. UNAUTHENTICATED & LOGIN ROUTES
  if (!user) {
    if (currentRoute === '/doctor/login') {
      return <DoctorLoginPage onBackToRoles={() => setCurrentRoute('/role-selection')} onSuccessLogin={() => setCurrentRoute('/doctor/dashboard')} />;
    }
    if (currentRoute === '/admin/login') {
      return <AdminLoginPage onBackToRoles={() => setCurrentRoute('/role-selection')} onSuccessLogin={() => setCurrentRoute('/admin/dashboard')} />;
    }
    if (currentRoute === '/nurse/login') {
      return <NurseLoginPage onBackToRoles={() => setCurrentRoute('/role-selection')} onSuccessLogin={() => setCurrentRoute('/nurse/dashboard')} />;
    }
    if (currentRoute === '/technical/login') {
      return <TechnicalLoginPage onBackToRoles={() => setCurrentRoute('/role-selection')} onSuccessLogin={() => setCurrentRoute('/technical/dashboard')} />;
    }
    if (currentRoute === '/role-selection' || currentRoute === '/auth-general') {
      return (
        <AnimatedLogoLoginPage 
          onSuccessLogin={() => {
            if (user?.role === 'DOCTOR') setCurrentRoute('/doctor/dashboard');
            else if (user?.role === 'NURSE') setCurrentRoute('/nurse/dashboard');
            else if (user?.role === 'TECHNICAL_STAFF') setCurrentRoute('/technical/dashboard');
            else setCurrentRoute('/admin/dashboard');
          }} 
          onGoToLanding={() => setCurrentRoute('/landing')} 
        />
      );
    }
    // Default entry point: AVORA Home Page
    return (
      <>
        <LandingPage onLaunchApp={() => setCurrentRoute('/role-selection')} onSelectRole={handleRoleCardSelect} />
        <AIAssistantDrawer isOpen={isAIDrawerOpen} onClose={() => setIsAIDrawerOpen(false)} />
        <GeminiChatbotWidget onClick={() => setIsAIDrawerOpen(true)} />
      </>
    );
  }

  // 2. STRICT ROLE-BASED ROUTE GUARD & PROTECTION
  // Verify if user's role matches the requested route
  const checkRoleAuthorization = (): boolean => {
    if (currentRoute === '/doctor/dashboard') return user.role === 'DOCTOR';
    if (currentRoute === '/admin/dashboard') return user.role === 'HOSPITAL_ADMIN' || user.role === 'SUPER_ADMIN';
    if (currentRoute === '/nurse/dashboard') return user.role === 'NURSE';
    if (currentRoute === '/technical/dashboard') return user.role === 'TECHNICAL_STAFF';
    return true;
  };

  if (!checkRoleAuthorization()) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full rounded-3xl border border-rose-900/60 bg-slate-900/90 p-8 text-center space-y-6 shadow-2xl shadow-rose-950/50">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-bold font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Role Boundary Enforced
            </span>
            <h1 className="text-xl font-black text-white mt-3">Unauthorized Role Access</h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Your current authenticated session is assigned to role <strong className="text-white uppercase font-mono">{user.role}</strong>. You are not authorized to view the requested dashboard.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                if (user.role === 'DOCTOR') setCurrentRoute('/doctor/dashboard');
                else if (user.role === 'HOSPITAL_ADMIN' || user.role === 'SUPER_ADMIN') setCurrentRoute('/admin/dashboard');
                else if (user.role === 'NURSE') setCurrentRoute('/nurse/dashboard');
                else if (user.role === 'TECHNICAL_STAFF') setCurrentRoute('/technical/dashboard');
              }}
              className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
            >
              <span>Go to My Authorized Dashboard ({user.role})</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => { logout(); setCurrentRoute('/role-selection'); }}
              className="w-full py-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-400 text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out & Return to Role Selection</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. FOUR DISTINCT STANDALONE DASHBOARDS
  if (user.role === 'NURSE') {
    return (
      <>
        <NurseDashboard />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  if (user.role === 'TECHNICAL_STAFF') {
    return (
      <>
        <TechnicalDashboard />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  if (user.role === 'DOCTOR') {
    return (
      <>
        <DoctorWorkspace onOpenVoiceRecorder={handleOpenVoice} />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <VoiceRecorderModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          contextDescription={voiceContext}
        />
      </>
    );
  }

  if (user.role === 'RECEPTIONIST') {
    return (
      <>
        <ReceptionistWorkspace />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  if (user.role === 'HOSPITAL_ADMIN' || user.role === 'SUPER_ADMIN') {
    // AVORA standalone full-screen routes
    if (currentRoute === '/avora/command-center') {
      return (
        <>
          <HospitalCommandCenter
            organizationId={user.organizationId}
            organizationName="Aevora Medical Centre"
            onClose={() => setCurrentRoute('/admin/dashboard')}
          />
          <ToastContainer toasts={toasts} removeToast={removeToast} />
        </>
      );
    }
    if (currentRoute === '/avora/emergency') {
      return (
        <>
          <EmergencyCoordinator organizationId={user.organizationId} />
          <ToastContainer toasts={toasts} removeToast={removeToast} />
        </>
      );
    }
    if (currentRoute === '/avora/smart-booking') {
      return (
        <>
          <SmartBooking organizationId={user.organizationId} />
          <ToastContainer toasts={toasts} removeToast={removeToast} />
        </>
      );
    }
    if (currentRoute === '/avora/workflow-designer') {
      return (
        <>
          <WorkflowDesigner organizationId={user.organizationId} />
          <ToastContainer toasts={toasts} removeToast={removeToast} />
        </>
      );
    }
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenAIAssistant={() => setIsAIDrawerOpen(true)}
          onOpenQrScanner={() => setIsQrModalOpen(true)}
        />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            activeView={activeView}
            onNavigate={(view) => { setActiveView(view); setIsSidebarOpen(false); }}
            onOpenAIAssistant={() => setIsAIDrawerOpen(true)}
          />
          <main className="flex-1 overflow-y-auto">
            {activeView === 'ICON_LAUNCHPAD' ? (
              <AvoraIconLaunchpad
                onNavigateModule={(modId) => {
                  const map: Record<string, string> = {
                    appointment: 'APPOINTMENTS',
                    patient_registration: 'PATIENT_DIRECTORY',
                    outpatient: 'APPOINTMENTS',
                    health_checkup: 'PATIENT_DIRECTORY',
                    laboratory: 'LAB_ORDERS',
                    radiology: 'LAB_ORDERS',
                    inpatient: 'BED_MANAGEMENT',
                    inpatient_billing: 'BILLING',
                    nurse_station: 'NURSE_STATION',
                    operation_theatre: 'EMERGENCY',
                    blood_bank: 'LAB_ORDERS',
                    review_doctor: 'DOCTOR_WORKSPACE',
                    mis_reports: 'DASHBOARD',
                    pharmacy: 'PHARMACY',
                    software_management: 'SETTINGS',
                    system_control: 'SUPER_ADMIN',
                    phlebotomy: 'LAB_ORDERS',
                    store_management: 'PHARMACY',
                    opd_clinical: 'DOCTOR_WORKSPACE',
                    tally: 'BILLING',
                    mrd: 'PATIENT_DIRECTORY',
                    doctor_accounting: 'BILLING',
                    asset_management: 'SETTINGS',
                    cssd: 'SETTINGS',
                    equipment_maintenance: 'SETTINGS',
                    doctor_management: 'STAFF_DIRECTORY',
                    physiotherapy: 'DOCTOR_WORKSPACE',
                    hr_management: 'STAFF_DIRECTORY',
                    discharge_summary: 'BED_MANAGEMENT',
                    housekeeping: 'BED_MANAGEMENT',
                    canteen: 'SETTINGS',
                    ambulance: 'EMERGENCY'
                  };
                  if (map[modId]) setActiveView(map[modId]);
                }}
                onLogout={logout}
              />
            ) : activeView === 'COMMAND_CENTER' ? (
              <HospitalCommandCenter
                organizationId={user.organizationId}
                organizationName="Aevora Medical Centre"
              />
            ) : activeView === 'EMERGENCY' ? (
              <EmergencyCoordinator organizationId={user.organizationId} />
            ) : activeView === 'STAFF_DIRECTORY' ? <StaffManager /> :
             activeView === 'SETTINGS' ? <SettingsAndWhiteLabel /> :
             activeView === 'SUPER_ADMIN' ? <SuperAdminDashboard /> :
             <HospitalAdminDashboard />}
          </main>
        </div>

        <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} onNavigate={setActiveView} onOpenAIAssistant={() => setIsAIDrawerOpen(true)} />
        <AIAssistantDrawer isOpen={isAIDrawerOpen} onClose={() => setIsAIDrawerOpen(false)} />
        <QrCodeModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />
        <GeminiChatbotWidget onClick={() => setIsAIDrawerOpen(true)} />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }


  // Fallback for other roles (Pharmacist, Lab Tech, Patient)
  return (
    <>
      {user.role === 'LAB_TECHNICIAN' || user.role === 'LAB_TECH' ? <LabTechDashboard /> :
       user.role === 'PHARMACIST' ? <PharmacistDashboard /> :
       user.role === 'ACCOUNTANT' ? <AccountantDashboard /> :
       user.role === 'PATIENT' ? <PatientPortal /> :
       <HospitalAdminDashboard />}
      <AIAssistantDrawer isOpen={isAIDrawerOpen} onClose={() => setIsAIDrawerOpen(false)} />
      <GeminiChatbotWidget onClick={() => setIsAIDrawerOpen(true)} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

// Reusable Toast Container
const ToastContainer: React.FC<{ toasts: any[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => (
  <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className={`pointer-events-auto p-4 rounded-2xl shadow-xl border text-xs flex justify-between items-start space-x-3 max-w-sm animate-in slide-in-from-bottom-2 duration-200 ${
          toast.type === 'success'
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
        <button onClick={() => removeToast(toast.id)} className="text-xs opacity-60 hover:opacity-100 p-1">&times;</button>
      </div>
    ))}
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainAppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}
