import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  ChevronDown,
  Building2,
  Stethoscope,
  Activity,
  Pill,
  Microscope,
  DollarSign,
  User as UserIcon,
  ShieldCheck,
  QrCode,
  CheckCircle2,
  LogOut,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useNotifications } from '../../context/NotificationContext.js';
import { UserRole } from '../../types/index.js';

interface HeaderProps {
  onOpenSidebar: () => void;
  onOpenCommandPalette: () => void;
  onOpenAIAssistant: () => void;
  onOpenQrScanner: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSidebar,
  onOpenCommandPalette,
  onOpenAIAssistant,
  onOpenQrScanner,
}) => {
  const { user, organization, availableOrgs, switchOrganization, switchRole, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const roleLabels: Record<string, { label: string; icon: any }> = {
    HOSPITAL_ADMIN: { label: 'Hospital Admin', icon: Building2 },
    DOCTOR: { label: 'Attending Doctor', icon: Stethoscope },
    NURSE: { label: 'Staff Nurse', icon: Activity },
    PHARMACIST: { label: 'Pharmacist', icon: Pill },
    LAB_TECHNICIAN: { label: 'Pathology Lab', icon: Microscope },
    ACCOUNTANT: { label: 'Finance & Billing', icon: DollarSign },
    PATIENT: { label: 'Patient Portal', icon: UserIcon },
    SUPER_ADMIN: { label: 'Super Admin', icon: ShieldCheck },
  };

  const currentRoleInfo = roleLabels[user?.role || 'HOSPITAL_ADMIN'] || {
    label: user?.role || 'Staff',
    icon: UserIcon,
  };
  const RoleIcon = currentRoleInfo.icon;

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8 shrink-0 z-30">
      {/* Left: Mobile Toggle & Tenant Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Tenant Breadcrumbs & Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowOrgDropdown(!showOrgDropdown)}
            className="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-700 hover:text-blue-600 transition"
          >
            <span className="text-slate-500 hidden sm:inline">Tenants</span>
            <span className="text-slate-600 dark:text-slate-600 hidden sm:inline">&rsaquo;</span>
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: organization?.brandColor || '#2563eb' }}
            />
            <span className="font-bold text-slate-900 text-slate-800 truncate max-w-[140px] sm:max-w-[200px]">
              {organization?.name || 'Central General Hospital'}
            </span>
            <span className="rounded-md bg-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 text-blue-700 uppercase">
              {organization?.subscriptionPlan || 'Pro Plan'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* Organization Switcher Dropdown */}
          {showOrgDropdown && (
            <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in">
              <div className="px-3 py-1.5 border-b border-slate-100 border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Switch Hospital Tenant
              </div>
              {availableOrgs.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    switchOrganization(org.id);
                    setShowOrgDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-left text-xs hover:bg-slate-50 hover:bg-slate-100/60 transition ${
                    organization?.id === org.id
                      ? 'bg-blue-50 bg-blue-50/40 font-bold text-blue-700 text-blue-700'
                      : 'text-slate-700 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: org.brandColor }}
                    />
                    <div>
                      <p className="font-semibold">{org.name}</p>
                      <p className="text-[10px] text-slate-500">{org.city} &bull; {org.code}</p>
                    </div>
                  </div>
                  {organization?.id === org.id && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Actions: Pill Search, Notification Bell, QR, Quick Role Action */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Search input (Pill Style) */}
        <div className="relative hidden md:block">
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 w-64 rounded-full border border-slate-200 bg-slate-50 bg-slate-100 px-4 py-1.5 text-xs text-slate-500 hover:text-slate-600 hover:text-slate-700 transition"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Search records, doctors, beds...</span>
            <kbd className="ml-auto text-[10px] bg-white dark:bg-slate-700 border border-slate-200 rounded px-1.5 py-0.5 font-mono text-slate-500">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* QR Check-in */}
        <button
          onClick={onOpenQrScanner}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:text-slate-700 hover:bg-slate-100 hover:bg-slate-100 transition"
          title="Patient QR Code & Touchless Check-in"
        >
          <QrCode className="w-4 h-4" />
        </button>

        {/* Notification Bell with Status Dot */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-1.5 text-slate-500 hover:text-slate-600 hover:text-slate-700 transition"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white ring-white" />
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 border-slate-200">
                <span className="text-xs font-bold text-slate-900 text-slate-800">
                  Hospital Notifications ({notifications.length})
                </span>
                <span className="text-[10px] text-blue-600 font-semibold">Real-time</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 divide-slate-100/60">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-3 text-xs hover:bg-slate-50 hover:bg-slate-100/50 cursor-pointer transition ${
                      !n.read ? 'bg-blue-50/40 bg-blue-50/20' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-bold text-slate-700">{n.title}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 text-slate-500 text-[11px] leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Subtle Vertical Divider */}
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

        {/* Quick Role Switcher Action */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-slate-900 dark:text-slate-900 px-3 py-1.5 text-xs font-semibold transition shadow-xs"
          >
            <RoleIcon className="w-3.5 h-3.5 text-blue-400 dark:text-blue-600 shrink-0" />
            <span className="hidden sm:inline">{currentRoleInfo.label}</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in">
              <div className="px-3 py-1.5 border-b border-slate-100 border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Simulate Role Workspace
              </div>
              {[
                { role: 'HOSPITAL_ADMIN' as UserRole, label: 'Hospital Admin', icon: Building2 },
                { role: 'DOCTOR' as UserRole, label: 'Doctor Workspace', icon: Stethoscope },
                { role: 'NURSE' as UserRole, label: 'Nurse Station', icon: Activity },
                { role: 'LAB_TECHNICIAN' as UserRole, label: 'Pathology Lab', icon: Microscope },
                { role: 'PHARMACIST' as UserRole, label: 'Pharmacy & POS', icon: Pill },
                { role: 'ACCOUNTANT' as UserRole, label: 'Finance & Invoicing', icon: DollarSign },
                { role: 'PATIENT' as UserRole, label: 'Patient Portal', icon: UserIcon },
                { role: 'SUPER_ADMIN' as UserRole, label: 'SaaS Platform Admin', icon: ShieldCheck },
              ].map((item) => (
                <button
                  key={item.role}
                  onClick={() => {
                    switchRole(item.role);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left hover:bg-slate-50 hover:bg-slate-100 transition ${
                    user?.role === item.role
                      ? 'bg-blue-50 bg-blue-50/40 text-blue-700 text-blue-700 font-bold'
                      : 'text-slate-700 text-slate-600'
                  }`}
                >
                  <item.icon className="w-4 h-4 text-slate-500" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={() => logout()}
          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 hover:bg-slate-100 transition shrink-0"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};



