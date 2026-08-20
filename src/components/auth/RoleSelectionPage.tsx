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
  ChevronRight,
  ShieldCheck
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
      badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      cardBorder: 'border-indigo-100 hover:border-indigo-400 hover:shadow-indigo-100',
      iconBg: 'bg-indigo-100/80 text-indigo-600 border-indigo-200',
      accentColor: 'text-indigo-600',
      bulletIconColor: 'text-indigo-500',
      btnBg: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200',
      demoBtn: 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-700',
      features: ['Ambient AI Consult Notes', 'EMR & Diagnostic Charts', 'Digital Prescription Generator']
    },
    {
      role: 'HOSPITAL_ADMIN' as UserRole,
      title: 'Hospital Admin',
      subtitle: 'Executive Hospital Control',
      description: 'Manage hospital staff, departments, bed allocations, financial billing, analytics & SaaS white-label settings.',
      icon: Shield,
      badgeText: 'Executive Control',
      badgeStyle: 'bg-sky-50 text-sky-700 border-sky-200',
      cardBorder: 'border-sky-100 hover:border-sky-400 hover:shadow-sky-100',
      iconBg: 'bg-sky-100/80 text-sky-600 border-sky-200',
      accentColor: 'text-sky-600',
      bulletIconColor: 'text-sky-500',
      btnBg: 'bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-200',
      demoBtn: 'border-sky-200 bg-sky-50/50 hover:bg-sky-100 text-sky-700',
      features: ['Staff & HR Management', 'Bed Occupancy Matrix', 'Financial Billing & Analytics']
    },
    {
      role: 'NURSE' as UserRole,
      title: 'Nurse Station',
      subtitle: 'Inpatient Care & Telemetry',
      description: 'Monitor ward beds, medicine administration records (MAR), patient vitals, shift rosters & care notes.',
      icon: HeartPulse,
      badgeText: 'Patient Care & MAR',
      badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      cardBorder: 'border-emerald-100 hover:border-emerald-400 hover:shadow-emerald-100',
      iconBg: 'bg-emerald-100/80 text-emerald-600 border-emerald-200',
      accentColor: 'text-emerald-600',
      bulletIconColor: 'text-emerald-500',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200',
      demoBtn: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-700',
      features: ['MAR Medicine Checklist', 'Live Patient Telemetry', 'Shift Duty Roster']
    },
    {
      role: 'TECHNICAL_STAFF' as UserRole,
      title: 'Technical Operations',
      subtitle: 'IT Infrastructure & Telemetry',
      description: 'Monitor hospital IT infrastructure, server/API latency, medical device telemetry, maintenance tickets & audit logs.',
      icon: Cpu,
      badgeText: 'IT & Bio-Devices',
      badgeStyle: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      cardBorder: 'border-cyan-100 hover:border-cyan-400 hover:shadow-cyan-100',
      iconBg: 'bg-cyan-100/80 text-cyan-600 border-cyan-200',
      accentColor: 'text-cyan-600',
      bulletIconColor: 'text-cyan-500',
      btnBg: 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-200',
      demoBtn: 'border-cyan-200 bg-cyan-50/50 hover:bg-cyan-100 text-cyan-700',
      features: ['Biomedical Device Mesh', 'Server & API Diagnostics', 'Maintenance Tickets']
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-sky-500 selection:text-white relative overflow-hidden font-sans">
      {/* Dynamic ECG Animation Style */}
      <style>{`
        @keyframes ecgPulse {
          0% { stroke-dashoffset: 1000; }
          100% { stroke-dashoffset: 0; }
        }
        .ecg-line {
          stroke-dasharray: 1000;
          animation: ecgPulse 6s linear infinite;
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .animate-float {
          animation: floatSlow 4s ease-in-out infinite;
        }
      `}</style>

      {/* Luminous Soft Background Glow Gradients */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-gradient-to-br from-sky-200/50 to-indigo-100/40 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-100/40 to-teal-100/50 rounded-full blur-[140px] pointer-events-none" />

      {/* Background Animated Heartbeat Line Graphics */}
      <div className="absolute top-24 left-0 w-full h-32 opacity-25 pointer-events-none overflow-hidden">
        <svg className="w-full h-full text-sky-500" viewBox="0 0 1200 120" fill="none">
          <path
            className="ecg-line"
            d="M0 60 H400 L410 40 L420 80 L430 10 L445 110 L460 60 H480 L490 45 L500 75 L510 60 H1200"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Top Professional Hospital Header */}
      <header className="relative z-10 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-2 ring-sky-100">
              <Activity className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-slate-900">PulseCloud</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                  Enterprise HMS
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Multi-Role Hospital Operations Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>HIPAA Certified · 256-bit AES</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Content Section */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-6 py-10 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-sky-200 text-sky-700 text-xs font-bold shadow-sm animate-float">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Hospital Access Portal Gate</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Select Role to Access Portal
          </h1>

          <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Welcome to PulseCloud Hospital Platform. Choose your designated clinical or operations role below to launch your role-specific dashboard.
          </p>
        </div>

        {/* 4 Distinct Role Cards (Clean White Theme) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roleCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.role}
                className={`relative group rounded-3xl border ${card.cardBorder} bg-white p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-xl shadow-lg shadow-slate-200/60`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${card.iconBg} border flex items-center justify-center shadow-xs transition-transform group-hover:scale-110`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${card.badgeStyle}`}>
                      {card.badgeText}
                    </span>
                  </div>

                  <h2 className="text-xl font-black text-slate-900 group-hover:text-sky-600 transition-colors">
                    {card.title}
                  </h2>
                  <p className={`text-xs font-bold ${card.accentColor} mb-2.5`}>
                    {card.subtitle}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed mb-5">
                    {card.description}
                  </p>

                  {/* Feature Checklist */}
                  <div className="space-y-2 border-t border-slate-100 pt-4 mb-6">
                    {card.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2 text-[11px] text-slate-700 font-semibold">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${card.bulletIconColor} shrink-0`} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={() => onSelectRole(card.role)}
                    className={`w-full py-3 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${card.btnBg}`}
                  >
                    <span>Login to {card.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onQuickDemo(card.role)}
                    className={`w-full py-2 px-3 rounded-xl border text-[11px] font-bold transition flex items-center justify-center gap-1.5 ${card.demoBtn}`}
                  >
                    <span>⚡ Quick Demo Switch</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* System Heartbeat & Telemetry Status Notice */}
        <div className="mt-10 rounded-2xl border border-sky-100 bg-white/90 p-4 max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs shadow-md shadow-sky-100/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Hospital Ecosystem Active</p>
              <p className="text-[11px] text-slate-500 font-medium">Strict role-based session authorization enforced across all 4 independent portals.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>ECG Telemetry: 72 BPM · Online</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <p>© 2026 PulseCloud HMS Platform. Enterprise Healthcare Grade Technology.</p>
          <div className="flex items-center gap-4 text-[11px] font-medium text-slate-600">
            <a href="#" className="hover:text-sky-600 transition">Privacy Policy</a>
            <a href="#" className="hover:text-sky-600 transition">Terms of Service</a>
            <a href="#" className="hover:text-sky-600 transition">System Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
