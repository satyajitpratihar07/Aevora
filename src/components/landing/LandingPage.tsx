import React, { useEffect, useState, useRef } from "react";
import {
  Activity, Shield, Zap, CheckCircle2, Building2, Stethoscope,
  Microscope, Pill, BedDouble, CreditCard, Mic, ArrowRight,
  Lock, Globe, Sparkles, HeartPulse, Brain, FlaskConical,
  TrendingUp, Clock, AlertTriangle, ChevronRight, Users,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { UserRole } from "../../types/index.js";

interface LandingPageProps {
  onLaunchApp: () => void;
  onSelectRole: (role: UserRole) => void;
}

const HeartbeatLine: React.FC<{ color?: string }> = ({ color = "#0284c7" }) => (
  <svg viewBox="0 0 400 80" className="w-full h-full" preserveAspectRatio="none">
    <defs>
      <linearGradient id="ecgGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={color} stopOpacity="0" />
        <stop offset="40%" stopColor={color} stopOpacity="1" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <path
      d="M0,40 L60,40 L75,40 L80,10 L90,70 L100,5 L110,70 L120,40 L135,40 L200,40 L215,40 L220,10 L230,70 L240,5 L250,70 L260,40 L275,40 L340,40 L355,40 L360,10 L370,70 L380,5 L390,70 L400,40"
      fill="none"
      stroke={`url(#ecgGrad)`}
      strokeWidth="2.5"
      filter="url(#glow)"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        strokeDasharray: 1000,
        strokeDashoffset: 1000,
        animation: "ecgDraw 3s ease-in-out infinite",
      }}
    />
  </svg>
);

const AnimatedCounter: React.FC<{ target: number; suffix?: string }> = ({ target, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(current));
        }, 2000 / steps);
      }
    }, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const VitalCard: React.FC<{ label: string; value: string; unit: string; status: "normal" | "warning" | "critical" }> = ({ label, value, unit, status }) => {
  const col = { normal: "text-emerald-600", warning: "text-amber-600", critical: "text-rose-600" }[status];
  const bg = { normal: "bg-emerald-50 border-emerald-200", warning: "bg-amber-50 border-amber-200", critical: "bg-rose-50 border-rose-200" }[status];
  return (
    <div className={`rounded-xl p-3 border ${bg} flex flex-col gap-0.5`}>
      <span className="text-[10px] font-semibold text-slate-800 uppercase tracking-wider">{label}</span>
      <div className="flex items-end gap-1">
        <span className={`text-xl font-black tabular-nums ${col}`}>{value}</span>
        <span className="text-[10px] text-slate-800 mb-0.5">{unit}</span>
      </div>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp, onSelectRole }) => {
  const [vitals, setVitals] = useState({ hr: 72, spo2: 98, temp: 98.6, bp: "120/80" });
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);

  useEffect(() => {
    const iv = setInterval(() => {
      setVitals({
        hr: 68 + Math.floor(Math.random() * 16),
        spo2: 96 + Math.floor(Math.random() * 4),
        temp: parseFloat((98.2 + Math.random() * 0.8).toFixed(1)),
        bp: `${115 + Math.floor(Math.random() * 15)}/${75 + Math.floor(Math.random() * 10)}`,
      });
    }, 2500);
    return () => clearInterval(iv);
  }, []);

  const roles = [
    { role: "DOCTOR" as UserRole, title: "Doctor EHR", desc: "AI Rx & Voice Dictation", icon: Stethoscope, grad: "from-blue-600 to-blue-400", glow: "shadow-blue-200", border: "border-blue-200" },
    { role: "HOSPITAL_ADMIN" as UserRole, title: "Hospital Admin", desc: "Analytics & Operations", icon: Building2, grad: "from-cyan-600 to-teal-400", glow: "shadow-sky-200", border: "border-sky-200" },
    { role: "NURSE" as UserRole, title: "Nursing Station", desc: "Vitals, Triage & Care", icon: HeartPulse, grad: "from-emerald-600 to-green-400", glow: "shadow-emerald-200", border: "border-emerald-200" },
    { role: "LAB_TECHNICIAN" as UserRole, title: "Pathology Lab", desc: "Auto-Flagged Assays", icon: Microscope, grad: "from-purple-600 to-violet-400", glow: "shadow-purple-200", border: "border-purple-200" },
    { role: "PHARMACIST" as UserRole, title: "Pharmacy & POS", desc: "Dispensing & Inventory", icon: Pill, grad: "from-amber-600 to-yellow-400", glow: "shadow-amber-200", border: "border-amber-200" },
    { role: "ACCOUNTANT" as UserRole, title: "Finance & Billing", desc: "Invoicing & Revenue", icon: CreditCard, grad: "from-rose-600 to-pink-400", glow: "shadow-rose-200", border: "border-rose-200" },
    { role: "PATIENT" as UserRole, title: "Patient Portal", desc: "Records & Appointments", icon: Users, grad: "from-sky-600 to-blue-300", glow: "shadow-sky-200", border: "border-sky-200" },
    { role: "SUPER_ADMIN" as UserRole, title: "SaaS Admin", desc: "Multi-Tenant Control", icon: Shield, grad: "from-slate-500 to-slate-300", glow: "shadow-slate-200", border: "border-slate-200" },
  ];

  const features = [
    { icon: Brain, title: "Gemini AI Clinical Engine", desc: "Voice-driven prescription drafts, real-time drug allergy checks, and AI-powered clinical summaries in milliseconds.", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
    { icon: BedDouble, title: "Live Inpatient Bed Telemetry", desc: "Color-coded floor maps for ICU, Emergency, General, and Maternity wards with real-time admission and transfer queues.", color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200" },
    { icon: FlaskConical, title: "Pathology Automation", desc: "Auto-flagged critical lab results with HL7-compatible reporting, turnaround tracking, and clinician alerts.", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
    { icon: Mic, title: "Voice Prescription Dictation", desc: "Ambient AI microphone transcribes doctor speech into structured EHR entries with ICD-10 code suggestions.", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    { icon: Shield, title: "HIPAA-Grade Multi-Tenancy", desc: "Strict data partition per hospital tenant with custom white-label branding, immutable audit logs, and AES-256 encryption.", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
    { icon: TrendingUp, title: "Revenue Cycle Intelligence", desc: "Automated billing, insurance claim tracking, outstanding receivable alerts, and financial KPI dashboards for CFOs.", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  ];

  const stats = [
    { label: "Patient Records", value: 250000, suffix: "+", color: "text-sky-600" },
    { label: "Hospital Tenants", value: 340, suffix: "+", color: "text-blue-600" },
    { label: "AI Prescriptions/day", value: 12000, suffix: "+", color: "text-violet-600" },
    { label: "Uptime SLA", value: 99, suffix: ".9%", color: "text-emerald-600" },
  ];

  const particles = Array.from({ length: 14 }, (_, i) => ({
    delay: Math.random() * 5,
    x: Math.random() * 100,
    size: 4 + Math.random() * 8,
  }));

  return (
    <>
      <style>{`
        @keyframes ecgDraw {
          0% { stroke-dashoffset: 1000; opacity: 0.2; }
          30% { opacity: 1; }
          70% { opacity: 1; }
          100% { stroke-dashoffset: -1000; opacity: 0.2; }
        }
        @keyframes floatUp {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.25; }
          90% { opacity: 0.05; }
          100% { transform: translateY(-110vh); opacity: 0; }
        }
        @keyframes fadeSlideUp {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(2,132,199,0.2); }
          50% { box-shadow: 0 4px 40px rgba(2,132,199,0.45); }
        }
        @keyframes vitalBlink {
          0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
        }
        @keyframes rotateRing {
          from { transform: rotate(0deg); } to { transform: rotate(360deg); }
        }
        @keyframes cardFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .fade-up { animation: fadeSlideUp 0.8s ease forwards; opacity: 0; }
        .d1 { animation-delay: 0.1s; }
        .d2 { animation-delay: 0.25s; }
        .d3 { animation-delay: 0.4s; }
        .d4 { animation-delay: 0.55s; }
        .d5 { animation-delay: 0.7s; }
        .glow-btn { animation: glowPulse 3s ease-in-out infinite; }
        .vital-dot { animation: vitalBlink 1.2s ease-in-out infinite; }
        .float-monitor { animation: cardFloat 4s ease-in-out infinite; }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50/30 text-slate-900 font-sans overflow-x-hidden">

        {/* Particles */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {particles.map((p, i) => (
            <div key={i} className="absolute bottom-0 rounded-full bg-sky-400/10"
              style={{ left: `${p.x}%`, width: p.size, height: p.size, animation: `floatUp ${6 + p.delay}s ease-in ${p.delay}s infinite` }} />
          ))}
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(34,211,238,1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-blue-600/5 blur-[140px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-violet-400/5 blur-[100px]" />
        </div>

        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/85 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-sky-400/30 animate-ping" style={{ animationDuration: "2.5s" }} />
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="font-black text-lg text-slate-900 tracking-tight">PulseCloud</span>
                <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/12 text-sky-600 border border-sky-200">Enterprise HMS</span>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-800">
              {["Features", "Modules", "Security"].map((l) => <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-sky-600 transition">{l}</a>)}
            </nav>
            <button onClick={onLaunchApp} className="group relative overflow-hidden px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold text-xs shadow-lg shadow-blue-200 hover:scale-105 transition-all flex items-center space-x-2">
              <span className="relative z-10 text-white">Enter Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 relative z-10 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </header>

        {/* Hero */}
        <section className="relative min-h-screen flex items-center pt-8 pb-16 overflow-hidden">
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              {/* Copy */}
              <div className="space-y-8">
                <div className="fade-up d1 inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-sky-100 border border-sky-200 text-sky-600 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 vital-dot" />
                  <Sparkles className="w-3 h-3" />
                  <span>Powered by Gemini AI · HIPAA Certified · HL7 FHIR R4</span>
                </div>
                <h1 className="fade-up d2 text-5xl xl:text-6xl font-black text-slate-900 tracking-tight leading-[1.05]">
                  The Intelligent<br />
                  <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg,#22d3ee 0%,#3b82f6 50%,#a78bfa 100%)" }}>
                    Healthcare OS
                  </span>
                  <br />
                  <span className="text-slate-500 text-4xl xl:text-5xl font-bold">for Modern Hospitals</span>
                </h1>
                <p className="fade-up d3 text-slate-800 text-base max-w-lg leading-relaxed">
                  Multi-tenant EHR with AI prescription drafting, live bed telemetry, pathology automation, voice dictation, and HIPAA-compliant billing — all in one unified cloud platform.
                </p>
                <div className="fade-up d4 flex flex-wrap gap-3">
                  <button onClick={onLaunchApp} className="group relative overflow-hidden px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold text-sm shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:scale-[1.03] transition-all flex items-center space-x-2 glow-btn">
                    <span className="relative z-10">Launch Clinical Workspace</span>
                    <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  <button className="px-7 py-3.5 rounded-2xl border border-slate-300 text-slate-600 hover:border-sky-400 hover:text-sky-600 font-semibold text-sm transition flex items-center space-x-2 bg-white">
                    <Zap className="w-4 h-4" />
                    <span>View Live Demo</span>
                  </button>
                </div>
                <div className="fade-up d5 flex flex-wrap gap-4 pt-2">
                  {[{ icon: Shield, text: "HIPAA Compliant" }, { icon: Lock, text: "AES-256" }, { icon: Globe, text: "Multi-Tenant" }, { icon: CheckCircle2, text: "HL7 FHIR R4" }].map((b) => (
                    <div key={b.text} className="flex items-center space-x-1.5 text-[11px] text-slate-800 font-semibold">
                      <b.icon className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{b.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical Monitor Card */}
              <div className="fade-up d3 relative">
                <div className="relative rounded-3xl border border-sky-200 bg-slate-50/85 backdrop-blur-xl p-6 shadow-2xl overflow-hidden" style={{ boxShadow: "0 4px 40px rgba(2,132,199,0.08), 0 20px 60px rgba(0,0,0,0.06)" }}>
                  
                  {/* Monitor header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-400 flex items-center justify-center shadow-lg shadow-rose-500/30">
                          <HeartPulse className="w-4 h-4 text-slate-900" />
                        </div>
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Patient Monitor — ICU Bed 3A</p>
                        <p className="text-[10px] text-slate-800">Dr. Ananya Deshmukh · Apex Apollo Hospital</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 vital-dot" />
                      <span className="text-[10px] font-bold text-emerald-600">LIVE</span>
                    </div>
                  </div>

                  {/* ECG Strip */}
                  <div className="relative rounded-xl bg-slate-100 border border-slate-200/70 h-20 mb-4 overflow-hidden">
                    <HeartbeatLine color="#0284c7" />
                    <div className="absolute bottom-2 right-3 text-[9px] text-sky-500/50 font-mono">ECG · Lead II · 25mm/s</div>
                  </div>

                  {/* Vitals */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <VitalCard label="Heart Rate" value={vitals.hr.toString()} unit="bpm" status={vitals.hr < 60 || vitals.hr > 100 ? "warning" : "normal"} />
                    <VitalCard label="SpO₂" value={vitals.spo2.toString()} unit="%" status={vitals.spo2 < 95 ? "critical" : "normal"} />
                    <VitalCard label="Temperature" value={vitals.temp.toString()} unit="°F" status={vitals.temp > 99.5 ? "warning" : "normal"} />
                    <VitalCard label="Blood Pressure" value={vitals.bp} unit="mmHg" status="normal" />
                  </div>

                  {/* AI Analysis */}
                  <div className="rounded-xl bg-violet-50 border border-violet-200 p-3">
                    <div className="flex items-center space-x-2 mb-1.5">
                      <Brain className="w-3.5 h-3.5 text-violet-600" />
                      <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">Gemini AI Analysis</span>
                      <span className="ml-auto text-[9px] text-slate-800">Live</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Vitals stable. HR within normal sinus rhythm. SpO₂ optimal at {vitals.spo2}%. No immediate intervention required. Continue monitoring protocol.
                    </p>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 shadow-md flex items-center space-x-1.5 shadow-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[10px] font-bold text-emerald-600">AI Rx Approved</span>
                </div>
                <div className="absolute -bottom-4 -left-4 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 shadow-md flex items-center space-x-1.5 shadow-lg">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[10px] font-bold text-amber-600">Allergy Alert Checked</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="relative z-10 py-16 border-y border-slate-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((s) => (
                <div key={s.label} className="text-center space-y-1">
                  <div className={`text-4xl font-black tabular-nums ${s.color}`}><AnimatedCounter target={s.value} suffix={s.suffix} /></div>
                  <p className="text-xs text-slate-800 font-semibold uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Role Launcher */}
        <section id="modules" className="relative z-10 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-600 text-xs font-semibold">
                <Zap className="w-3 h-3" /><span>Role-Tailored Clinical Workspaces</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Every role, perfectly equipped</h2>
              <p className="text-slate-800 text-sm max-w-xl mx-auto">Launch a fully functional clinical workspace tailored to each hospital role with realistic data and AI features.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {roles.map((item) => {
                const Icon = item.icon;
                const h = hoveredRole === item.role;
                return (
                  <button key={item.role} onClick={() => onSelectRole(item.role)}
                    onMouseEnter={() => setHoveredRole(item.role)} onMouseLeave={() => setHoveredRole(null)}
                    className={`group relative overflow-hidden text-left p-5 rounded-2xl border transition-all duration-300 ${item.border} bg-slate-50/70 hover:scale-[1.04] ${h ? `shadow-xl ${item.glow}` : ""}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.grad} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-300 rounded-2xl`} />
                    <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${item.grad} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-slate-900" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-[11px] text-slate-800 leading-relaxed">{item.desc}</p>
                    <div className="mt-3 flex items-center space-x-1 text-[10px] font-bold text-slate-800 group-hover:text-slate-600 transition-colors">
                      <span>Open Workspace</span><ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="relative z-10 py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-100 border border-violet-200 text-violet-600 text-xs font-semibold">
                <Brain className="w-3 h-3" /><span>Enterprise Clinical Modules</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Everything from triage to discharge</h2>
              <p className="text-slate-800 text-sm max-w-xl mx-auto">Integrated modules covering every department — powered by AI, designed for clinicians, built for scale.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className={`group relative p-6 rounded-3xl border ${f.border} ${f.bg} backdrop-blur-sm hover:scale-[1.02] transition-all duration-300 overflow-hidden`}>
                    <div className={`w-11 h-11 rounded-2xl ${f.bg} border ${f.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-5 h-5 ${f.color}`} />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 mb-2">{f.title}</h3>
                    <p className="text-[12px] text-slate-800 leading-relaxed">{f.desc}</p>
                    <div className={`absolute -bottom-8 -right-8 w-24 h-24 rounded-full ${f.bg} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Security CTA */}
        <section id="security" className="relative z-10 py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl border border-sky-200 overflow-hidden p-10 text-center" style={{ background: "linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)" }}>
              
              <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle at 30% 50%,rgba(34,211,238,0.12) 0%,transparent 60%), radial-gradient(circle at 70% 50%,rgba(59,130,246,0.1) 0%,transparent 60%)" }} />
              <div className="relative z-10 space-y-6">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 mb-3">Security-First by Design</h2>
                  <p className="text-slate-800 text-sm max-w-2xl mx-auto leading-relaxed">Every patient record is protected with end-to-end AES-256 encryption, immutable HIPAA audit trails, and strict role-based access with multi-tenant data isolation.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {["HIPAA Compliant", "HL7 FHIR R4", "AES-256 Encryption", "SOC 2 Type II", "ISO 27001", "GDPR Ready", "Multi-Tenant Isolation", "Immutable Audit Logs"].map((b) => (
                    <span key={b} className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[11px] font-bold flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3 h-3" /><span>{b}</span>
                    </span>
                  ))}
                </div>
                <button onClick={onLaunchApp} className="group inline-flex items-center space-x-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold text-sm shadow-xl shadow-blue-200 hover:shadow-blue-300 hover:scale-[1.03] transition-all">
                  <span>Start Free Enterprise Trial</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-slate-200/60 py-10 bg-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-slate-900">PulseCloud</span>
              <span className="text-[10px] text-slate-800">Enterprise HMS SaaS</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-800">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>HIPAA · HL7 FHIR · AES-256 · SOC2</span>
              <span className="text-slate-800">·</span>
              <span>© {new Date().getFullYear()} PulseCloud Technologies Inc.</span>
            </div>
            <div className="flex items-center space-x-4 text-xs text-slate-800">
              {["Privacy", "Terms", "Status"].map((l) => <a key={l} href="#" className="hover:text-sky-600 transition">{l}</a>)}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};




