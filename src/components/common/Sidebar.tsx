import React from 'react';
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  Calendar,
  FileText,
  Microscope,
  Pill,
  CreditCard,
  BedDouble,
  Activity,
  UserCheck,
  Shield,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Globe,
  Sliders,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: string;
  onNavigate: (view: string) => void;
  onOpenAIAssistant: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeView,
  onNavigate,
  onOpenAIAssistant,
}) => {
  const { organization, user, logout } = useAuth();

  const navigationSections = [
    {
      title: 'Medical Operations',
      items: [
        { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard, roles: ['DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'PHARMACIST', 'ACCOUNTANT', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'] },
        { id: 'DOCTOR_WORKSPACE', label: 'Doctor EHR & Consult', icon: Stethoscope, badge: 'AI Prescribe', roles: ['DOCTOR'] },
        { id: 'PATIENT_DIRECTORY', label: 'Patients Directory', icon: Users, roles: ['DOCTOR', 'NURSE', 'HOSPITAL_ADMIN'] },
        { id: 'APPOINTMENTS', label: 'Appointments & Queue', icon: Calendar, roles: ['DOCTOR', 'NURSE', 'PATIENT'] },
        { id: 'PRESCRIPTIONS', label: 'Prescriptions', icon: FileText, roles: ['DOCTOR', 'NURSE', 'PHARMACIST', 'PATIENT'] },
        { id: 'NURSE_STATION', label: 'Nursing & Vitals', icon: Activity, roles: ['NURSE', 'DOCTOR'] },
        { id: 'PATIENT_PORTAL', label: 'Patient Portal', icon: UserCheck, roles: ['PATIENT'] },
      ],
    },
    {
      title: 'Diagnostics & Operations',
      items: [
        { id: 'LAB_ORDERS', label: 'Pathology & Lab', icon: Microscope, badge: 'STAT', roles: ['LAB_TECHNICIAN', 'DOCTOR'] },
        { id: 'PHARMACY', label: 'Pharmacy & Dispensing', icon: Pill, roles: ['PHARMACIST', 'DOCTOR'] },
        { id: 'BED_MANAGEMENT', label: 'Ward & Inpatient Beds', icon: BedDouble, roles: ['NURSE', 'DOCTOR'] },
        { id: 'BILLING', label: 'Finance & Billing', icon: CreditCard, roles: ['ACCOUNTANT', 'HOSPITAL_ADMIN'] },
      ],
    },
    {
      title: 'Administrative',
      items: [
        { id: 'STAFF_DIRECTORY', label: 'Staff & Roles (HR)', icon: Users, roles: ['HOSPITAL_ADMIN', 'SUPER_ADMIN'] },
        { id: 'SUPER_ADMIN', label: 'SaaS Platform Admin', icon: Shield, badge: 'Multi-Tenant', roles: ['SUPER_ADMIN'] },
        { id: 'SETTINGS', label: 'Settings & White-Label', icon: Settings, roles: ['HOSPITAL_ADMIN', 'SUPER_ADMIN'] },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 border-slate-200">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => {
              onNavigate('DASHBOARD');
              onClose();
            }}
          >
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-900 font-bold text-sm shadow-xs"
              style={{ backgroundColor: organization?.brandColor || '#2563eb' }}
            >
              {organization?.name?.charAt(0) || 'H'}
            </div>
            <div className="leading-tight">
              <span className="text-base font-bold tracking-tight text-slate-900 text-slate-800">
                PulseCloud
              </span>
              <span className="block text-[10px] font-semibold text-blue-600 text-blue-600">
                Enterprise HMS
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-slate-500 hover:text-slate-600 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 space-y-5 p-4 overflow-y-auto">
          {navigationSections.map((section, sIdx) => {
            const visibleItems = section.items.filter(
              (item) =>
                !item.roles ||
                item.roles.includes(user?.role as any)
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={sIdx} className="space-y-1">
                <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {section.title}
                </div>

                {visibleItems.map((item) => {
                  const isActive = activeView === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-xs font-semibold transition ${
                        isActive
                          ? 'bg-blue-50 bg-blue-50/60 text-blue-700 text-blue-700 shadow-2xs font-bold'
                          : 'text-slate-600 text-slate-500 hover:bg-slate-50 hover:bg-slate-100/60 hover:text-slate-900 hover:text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            isActive ? 'text-blue-600 text-blue-600' : 'text-slate-500'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            isActive
                              ? 'bg-blue-200/80 dark:bg-blue-900 text-blue-800 text-blue-600'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}

          {/* Quick AI Assistant Trigger */}
          <div className="pt-2">
            <button
              onClick={onOpenAIAssistant}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-600/20 text-xs font-bold transition"
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-700 animate-pulse" />
                <span>Ask AI Clinical Bot</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 uppercase">Gemini</span>
            </button>
          </div>
        </nav>

        {/* User Footer Profile */}
        <div className="border-t border-slate-100 border-slate-200 p-4 bg-slate-50/50 bg-white/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 text-slate-700 text-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-slate-900 text-slate-800 truncate">
                {user?.name || 'Dr. Ananya Deshmukh'}
              </span>
              <span className="text-[11px] text-slate-500 truncate">
                {user?.role?.replace('_', ' ') || 'Staff Specialist'}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 border-slate-200 flex justify-between items-center text-[11px]">
            <button
              onClick={() => onNavigate('LANDING')}
              className="flex items-center space-x-1 text-slate-500 hover:text-blue-600 transition"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>SaaS Portal</span>
            </button>
            <button
              onClick={() => logout()}
              className="flex items-center space-x-1 text-slate-500 hover:text-rose-600 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};





