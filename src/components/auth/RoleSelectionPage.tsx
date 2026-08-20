import React from 'react';
import {
  Stethoscope,
  Shield,
  HeartPulse,
  Cpu,
  ArrowRight,
  Activity,
  Lock,
  Sparkles,
  Server,
  Building2,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { UserRole } from '../../types/index.js';

interface RoleSelectionPageProps {
  onSelectRole: (role: UserRole) => void;
  onQuickDemo: (role: UserRole) => void;
}

export const RoleSelectionPage: React.FC<RoleSelectionPageProps> = ({ onSelectRole, onQuickDemo }) => {
  const roleCards = [
    {
      role: 'DOCTOR' as UserRole,
      title: 'Doctor Portal',
      subtitle: 'Clinical Workflows & EHR',
      description: 'Access patient records, ambient AI consultations, digital prescriptions, diagnosis charts & clinical schedules.',
      icon: Stethoscope,
      badgeText: 'Clinical Workspace',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      gradient: 'from-slate-900 via-indigo-950 to-slate-900 hover:border-indigo-500/60',
      iconBg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      accentColor: 'text-indigo-400',
      btnBg: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40',
      features: ['Ambient AI Notes', 'EMR & Diagnostic Charts', 'Prescription Generator']
    },
    {
      role: 'HOSPITAL_ADMIN' as UserRole,
      title: 'Hospital Admin',
      subtitle: 'Executive Hospital Control',
      description: 'Manage hospital staff, departments, bed allocations, financial billing, analytics & SaaS white-label settings.',
      icon: Shield,
      badgeText: 'Executive Control',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      gradient: 'from-slate-900 via-sky-950 to-slate-900 hover:border-sky-500/60',
      iconBg: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
      accentColor: 'text-sky-400',
      btnBg: 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-900/40',
      features: ['Staff & HR Management', 'Bed Occupancy Matrix', 'Financial Analytics']
    },
    {
      role: 'NURSE' as UserRole,
      title: 'Nurse Station',
      subtitle: 'Inpatient Care & Telemetry',
      description: 'Monitor ward beds, medicine administration records (MAR), patient vitals, shift rosters & care notes.',
      icon: HeartPulse,
      badgeText: 'Patient Care & MAR',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      gradient: 'from-slate-900 via-emerald-950 to-slate-900 hover:border-emerald-500/60',
      iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      accentColor: 'text-emerald-400',
      btnBg: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40',
      features: ['MAR Medicine Checklist', 'Live Patient Telemetry', 'Shift Duty Roster']
    },
    {
      role: 'TECHNICAL_STAFF' as UserRole,
      title: 'Technical Operations',
      subtitle: 'IT Infrastructure & Telemetry',
      description: 'Monitor hospital IT infrastructure, server/API latency, medical device telemetry, maintenance tickets & audit logs.',
      icon: Cpu,
      badgeText: 'IT & Bio-Devices',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      gradient: 'from-slate-900 via-cyan-950 to-slate-900 hover:border-cyan-500/60',
      iconBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      accentColor: 'text-cyan-400',
      btnBg: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/40',
      features: ['Biomedical Device Status', 'Server & API Diagnostics', 'Maintenance Tickets']
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-sky-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-1 ring-white/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white">PulseCloud</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  Enterprise HMS
                </span>
              </div>
              <p className="text-xs text-slate-400">Multi-Role Hospital Operations Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>HIPAA Compliant · AES-256</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-6 py-12 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Select Your Access Role Below to Proceed</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Role-Based Institutional Gate
          </h1>
          <p className="text-sm md:text-base text-slate-400 leading-relaxed">
            Choose your designated healthcare or operations role. Each access gateway features an independent authentication framework and tailored clinical workspace.
          </p>
        </div>

        {/* 4 Distinct Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roleCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.role}
                className={`relative group rounded-3xl border border-slate-800 bg-gradient-to-b ${card.gradient} p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl shadow-slate-950/80`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${card.iconBg} border flex items-center justify-center shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${card.badgeColor}`}>
                      {card.badgeText}
                    </span>
                  </div>

                  <h2 className="text-xl font-black text-white group-hover:text-sky-300 transition-colors">
                    {card.title}
                  </h2>
                  <p className={`text-xs font-semibold ${card.accentColor} mb-3`}>
                    {card.subtitle}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {card.description}
                  </p>

                  {/* Feature Bullets */}
                  <div className="space-y-2 border-t border-slate-800/80 pt-4 mb-6">
                    {card.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2 text-[11px] text-slate-300 font-medium">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${card.accentColor} shrink-0`} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={() => onSelectRole(card.role)}
                    className={`w-full py-3 px-4 rounded-2xl font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2 ${card.btnBg}`}
                  >
                    <span>Login to {card.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onQuickDemo(card.role)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white text-[11px] font-semibold transition"
                  >
                    ⚡ Quick Demo Switch
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Demo Footer Notice */}
        <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-sky-400 shrink-0" />
            <div>
              <p className="font-bold text-slate-200">System Telemetry & Isolation Guard</p>
              <p className="text-[11px] text-slate-400">Multi-tenant role boundaries strictly enforced. Session authentication active.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Server Cluster: Operational</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <p>© 2026 PulseCloud HMS SaaS Platform. Enterprise Healthcare Security Standard.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <a href="#" className="hover:text-slate-300 transition">Privacy Shield</a>
            <a href="#" className="hover:text-slate-300 transition">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 transition">IT System Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
