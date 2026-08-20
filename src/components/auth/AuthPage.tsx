import React, { useState, useEffect, useRef } from 'react';
import {
  Activity, Mail, Lock, Eye, EyeOff, Phone, User, ArrowRight,
  Shield, HeartPulse, Stethoscope, CheckCircle2, AlertCircle,
  Sparkles, ChevronRight, RefreshCw, Brain, Clock,
  Calendar, Droplets, Ruler, Weight, Mic, ChevronLeft
} from 'lucide-react';
import { UserRole } from '../../types/index.js';

interface AuthPageProps {
  onLogin: (email?: string, role?: UserRole) => Promise<void>;
  onSignup: (data: any) => Promise<void>;
  onGoToLanding: () => void;
}

type AuthView = 'login' | 'signup';
type SignupStep = 1 | 2 | 3;

// ── Heartbeat strip ──────────────────────────────────────────────────────────
const HeartbeatLine: React.FC = () => (
  <svg viewBox="0 0 300 40" className="w-full h-full" preserveAspectRatio="none">
    <defs>
      <linearGradient id="hbAuth" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
        <stop offset="50%" stopColor="#ef4444" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
      </linearGradient>
      <filter id="glowAuth">
        <feGaussianBlur stdDeviation="1.5" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <path
      d="M0,20 L50,20 L60,20 L65,5 L72,35 L78,2 L85,35 L92,20 L105,20 L155,20 L165,20 L170,5 L177,35 L183,2 L190,35 L197,20 L210,20 L260,20 L270,20 L275,5 L282,35 L288,2 L295,35 L300,20"
      fill="none" stroke="url(#hbAuth)" strokeWidth="2" strokeLinecap="round"
      filter="url(#glowAuth)"
      style={{
        strokeDasharray: 600,
        strokeDashoffset: 600,
        animation: 'ecgAuthAnim 2.5s ease-in-out infinite',
      }}
    />
  </svg>
);

// ── Input field ──────────────────────────────────────────────────────────────
interface InputProps {
  label: string;
  icon: React.ElementType;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  error?: string;
}

const InputField: React.FC<InputProps> = ({
  label, icon: Icon, type = 'text', value, onChange,
  placeholder, required, hint, error,
}) => {
  const [show, setShow] = useState(false);
  const isPass = type === 'password';
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-xs font-semibold text-slate-600">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      <div className={`relative flex items-center rounded-xl border transition-all group ${
        error
          ? 'border-rose-400 bg-rose-50'
          : 'border-slate-200 bg-white focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100'
      }`}>
        <Icon className="w-4 h-4 text-slate-500 group-focus-within:text-sky-500 transition-colors ml-3.5 shrink-0" />
        <input
          type={isPass ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-3 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none"
        />
        {isPass && (
          <button type="button" onClick={() => setShow(!show)}
            className="pr-3.5 text-slate-500 hover:text-slate-600 transition">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {hint && !error && <p className="text-[11px] text-slate-500">{hint}</p>}
      {error && (
        <p className="text-[11px] text-rose-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />{error}
        </p>
      )}
    </div>
  );
};

// ── Select field ─────────────────────────────────────────────────────────────
interface SelectProps {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  required?: boolean;
}

const SelectField: React.FC<SelectProps> = ({ label, icon: Icon, value, onChange, options, required }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1 text-xs font-semibold text-slate-600">
      {label}
      {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative flex items-center rounded-xl border border-slate-200 bg-white focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 transition-all group">
      <Icon className="w-4 h-4 text-slate-500 group-focus-within:text-sky-500 transition-colors ml-3.5 shrink-0" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent pl-3 pr-10 py-3 text-sm text-slate-800 outline-none appearance-none cursor-pointer"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <div className="absolute right-3.5 pointer-events-none text-slate-500 group-focus-within:text-sky-500 transition-colors">
        <ChevronRight className="w-4 h-4 rotate-90 shrink-0" />
      </div>
    </div>
  </div>
);

// ── Main component ───────────────────────────────────────────────────────────
export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onSignup, onGoToLanding }) => {
  const [view, setView] = useState<AuthView>('login');
  const [signupStep, setSignupStep] = useState<SignupStep>(1);
  const [loading, setLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  // OTP state
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(30);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Signup step 1
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Signup step 2
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [allergies, setAllergies] = useState('');
  const [conditions, setConditions] = useState('');
  const [medications, setMedications] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Auto rotate features every 5.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  // OTP timer
  useEffect(() => {
    if (!otpSent || otpTimer <= 0) return;
    const t = setTimeout(() => setOtpTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [otpSent, otpTimer]);

  const handleSendOtp = () => {
    setOtpSent(true);
    setOtpTimer(30);
    setOtpValues(['', '', '', '', '', '']);
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otpValues];
    next[idx] = val;
    setOtpValues(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpValues.join('');
    if (code.length !== 6) return;
    setOtpVerified(true);
    setLoading(true);
    try {
      await onSignup({
        adminName: name, email, phone,
        orgName: `${name.split(' ')[0]}'s Health Account`,
        orgType: 'CLINIC',
        medicalProfile: { dob, gender, bloodGroup, height, weight, allergies, conditions, medications },
        emergencyContact: { name: emergencyName, phone: emergencyPhone },
      });
    } catch {
      setLoading(false);
      setOtpVerified(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) { setLoginError('Please enter your email'); return; }
    setLoginError('');
    setLoading(true);
    try {
      await onLogin(loginEmail);
    } catch {
      setLoginError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role: UserRole) => {
    setLoading(true);
    try { await onLogin(undefined, role); } catch { /* noop */ } finally { setLoading(false); }
  };

  const step1Valid = name && email && password && password === confirmPassword && phone.length >= 10;

  // Decorative dots for left panel
  const dots = Array.from({ length: 30 }, (_, i) => ({
    x: (i % 6) * 18 + 4,
    y: Math.floor(i / 6) * 18 + 4,
  }));

  const BRAND_FEATURES = [
    {
      title: 'Gemini AI Clinical Engine',
      desc: 'Ambient prescription drafting, live contraindication alerts, and automatic clinical summaries designed to save hours of administrative work.',
      tagline: 'Instant Clinical Assistance',
      icon: Brain,
      colorClass: 'text-violet-400 bg-violet-400/10 border-violet-400/25',
      widget: 'ai',
    },
    {
      title: 'Live Inpatient Bed Telemetry',
      desc: 'Continuous real-time tracking of patient vitals (HR, SpO2, BP) and interactive bed occupancy maps across all hospital wards.',
      tagline: 'Continuous Vital Tracking',
      icon: HeartPulse,
      colorClass: 'text-rose-400 bg-rose-400/10 border-rose-400/25',
      widget: 'telemetry',
    },
    {
      title: 'Voice Prescription Dictation',
      desc: 'Speech-to-text EHR drafting that understands complex medical terminology, clinical notes, and drug dosages.',
      tagline: 'Ambient Dictation Integration',
      icon: Mic,
      colorClass: 'text-sky-400 bg-sky-400/10 border-sky-400/25',
      widget: 'voice',
    },
    {
      title: 'HIPAA-Grade Security & Encryption',
      desc: 'Complete data isolation for healthcare institutions with AES-256 encryption, role-based access, and immutable audit logs.',
      tagline: 'Enterprise Compliance Assurance',
      icon: Shield,
      colorClass: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25',
      widget: 'security',
    },
  ];

  return (
    <>
      <style>{`
        @keyframes ecgAuthAnim {
          0%  { stroke-dashoffset: 600; opacity: .2; }
          30% { opacity: 1; }
          70% { opacity: 1; }
          100%{ stroke-dashoffset: -600; opacity: .2; }
        }
        @keyframes fadeUpAuth {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes vblink { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes checkPop {
          0%  {transform:scale(0);opacity:0}
          60% {transform:scale(1.3);opacity:1}
          100%{transform:scale(1);opacity:1}
        }
        @keyframes floatCard {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-8px)}
        }
        .au  { animation: fadeUpAuth .5s ease forwards; opacity:0; }
        .da1 { animation-delay:.05s } .da2 { animation-delay:.15s }
        .da3 { animation-delay:.25s } .da4 { animation-delay:.35s }
        .da5 { animation-delay:.45s } .da6 { animation-delay:.55s }
        .vb  { animation: vblink 1.3s ease-in-out infinite; }
        .cpop{ animation: checkPop .4s cubic-bezier(.34,1.56,.64,1) forwards; }
        .float-card { animation: floatCard 4s ease-in-out infinite; }
        .step-on  { background:linear-gradient(135deg,#0284c7,#38bdf8); color:#fff; border-color:transparent; box-shadow:0 4px 12px rgba(2,132,199,.25); }
        .step-ok  { background:#f0f9ff; border-color:#38bdf8; color:#0284c7; }
        .step-off { background:#f8fafc; border-color:#e2e8f0; color:#94a3b8; }
        .auth-input-focus:focus-within { border-color:#38bdf8; box-shadow:0 0 0 3px rgba(56,189,248,.15); }
      `}</style>

      <div className="min-h-screen bg-slate-50 flex overflow-hidden">

        {/* ── Left branding panel ──────────────────────────────────────── */}
        <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-sky-50/30 border-r border-slate-100">
          {/* Decorative grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
          
          {/* Moving decorative glowing blobs */}
          <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-sky-200/30 blur-[100px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-indigo-200/30 blur-[100px] pointer-events-none animate-pulse" />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 flex items-center justify-center shadow-md border border-sky-100">
              <Activity className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <span className="font-extrabold text-2xl text-slate-900 tracking-tight">PulseCloud</span>
              <span className="block text-[11px] font-semibold text-sky-600 tracking-wider uppercase">Enterprise HMS SaaS</span>
            </div>
          </div>

          {/* Center copy & active feature details */}
          <div className="relative z-10 space-y-10 my-auto">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-semibold backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 vb" />
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Next-Gen Healthcare OS</span>
              </div>
              <h1 className="text-5xl xl:text-6xl font-black text-slate-900 leading-tight tracking-tight">
                Healthcare OS<br />
                <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">
                  Built for Tomorrow
                </span>
              </h1>
              <p className="text-slate-600 text-sm max-w-md leading-relaxed font-medium">
                Empower your medical facility with clinical AI prescription drafting, real-time bed telemetry, voice dictation, and HIPAA-compliant patient operations.
              </p>
            </div>

            {/* Rotating Feature Showcase Widget */}
            <div className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-lg p-6 shadow-xl shadow-slate-100/50 space-y-5 transition-all duration-500">
              {/* Feature Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-sky-600 font-mono">
                    {BRAND_FEATURES[activeFeature].tagline}
                  </span>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    {React.createElement(BRAND_FEATURES[activeFeature].icon, { className: "w-5 h-5 text-sky-600 shrink-0" })}
                    {BRAND_FEATURES[activeFeature].title}
                  </h3>
                </div>
                
                {/* Feature Controls */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button 
                    onClick={() => setActiveFeature((prev) => (prev - 1 + 4) % 4)}
                    className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setActiveFeature((prev) => (prev + 1) % 4)}
                    className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Dynamic Showcase Visual Widget */}
              <div className="relative overflow-hidden transition-all duration-300 min-h-[128px]">
                {BRAND_FEATURES[activeFeature].widget === 'ai' && (
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 font-mono text-[11px] text-slate-800 space-y-2 animate-pulse">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Gemini Clinical Agent</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <p className="text-slate-500">&gt; analyzing chief patient symptoms...</p>
                    <p className="text-emerald-600 font-bold">&gt; drafted treatment plan check: complete</p>
                    <p className="text-slate-900 border-l-2 border-sky-500 pl-2 py-0.5 font-semibold">Amoxicillin 500mg TDS x 5 days</p>
                    <div className="flex gap-1.5 pt-1">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-semibold">Allergy OK</span>
                      <span className="px-1.5 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-700 text-[9px] font-semibold">ICD-10 J02.9</span>
                    </div>
                  </div>
                )}

                {BRAND_FEATURES[activeFeature].widget === 'telemetry' && (
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-mono">ICU Bed Telemetry — Live</span>
                      <span className="text-xs text-rose-600 font-bold flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                        74 BPM
                      </span>
                    </div>
                    <div className="h-10 overflow-hidden">
                      <HeartbeatLine />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="bg-white rounded border border-slate-200 p-1.5">
                        <p className="text-slate-500 font-semibold uppercase">HR</p>
                        <p className="text-xs font-black text-rose-600 font-mono">74</p>
                      </div>
                      <div className="bg-white rounded border border-slate-200 p-1.5">
                        <p className="text-slate-500 font-semibold uppercase">SpO₂</p>
                        <p className="text-xs font-black text-sky-600 font-mono">98%</p>
                      </div>
                      <div className="bg-white rounded border border-slate-200 p-1.5">
                        <p className="text-slate-500 font-semibold uppercase">BP</p>
                        <p className="text-xs font-black text-emerald-600 font-mono">120/80</p>
                      </div>
                    </div>
                  </div>
                )}

                {BRAND_FEATURES[activeFeature].widget === 'voice' && (
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col justify-between min-h-[128px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-mono">Ambient Voice Transcriber</span>
                      <span className="text-sky-600 text-xs flex items-center gap-1.5 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
                        Listening
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-1 my-2 h-10">
                      {[12, 28, 45, 18, 55, 32, 70, 48, 62, 24, 60, 40, 52, 16, 38, 20, 10].map((h, i) => (
                        <span
                          key={i}
                          className="w-1 bg-gradient-to-t from-sky-500 to-indigo-500 rounded-full transition-all"
                          style={{
                            height: `${h}%`,
                            animation: `vblink 1.2s ease-in-out infinite alternate`,
                            animationDelay: `${i * 0.06}s`
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 italic text-center truncate font-medium">
                      "Patient shows symptoms of mild acute rhinitis, suggest rest..."
                    </p>
                  </div>
                )}

                {BRAND_FEATURES[activeFeature].widget === 'security' && (
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex items-center gap-4 min-h-[128px]">
                    <div className="relative shrink-0 w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <Shield className="w-7 h-7 text-emerald-600 animate-pulse" />
                      <div className="absolute inset-0 rounded-full border border-emerald-400/20 animate-ping" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 font-mono">HIPAA & SOC2 Compliant</p>
                      <p className="text-xs text-slate-900 font-bold">End-to-End Cryptographic Security</p>
                      <p className="text-[10px] text-slate-500 font-medium">Strict hospital tenant data isolation under AES-256 standard protocols.</p>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                {BRAND_FEATURES[activeFeature].desc}
              </p>

              {/* Dots navigation */}
              <div className="flex justify-center gap-1.5 pt-1">
                {BRAND_FEATURES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveFeature(idx)}
                    className={`h-1.5 rounded-full transition-all ${activeFeature === idx ? 'w-5 bg-sky-600' : 'w-1.5 bg-slate-200'}`}
                  />
                ))}
              </div>
            </div>

            {/* Compliance badges */}
            <div className="flex flex-wrap gap-2">
              {['HIPAA Certified', 'HL7 FHIR R4', 'AES-256 Encryption', 'SOC 2 compliant'].map((b) => (
                <span key={b} className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold flex items-center gap-1.5 backdrop-blur-md">
                  <Shield className="w-3.5 h-3.5 text-sky-500" />{b}
                </span>
              ))}
            </div>
          </div>

          <div className="relative z-10 text-[11px] text-slate-400 font-mono font-medium">
            © {new Date().getFullYear()} PulseCloud Technologies Inc. All rights reserved.
          </div>
        </div>

        {/* ── Right auth panel ─────────────────────────────────────────── */}
        <div className="w-full lg:w-[55%] xl:w-1/2 flex flex-col overflow-y-auto bg-white">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between p-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-slate-800">PulseCloud</span>
            </div>
            <button onClick={onGoToLanding} className="text-xs text-slate-500 hover:text-sky-600 transition">
              ← Back to site
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md">

              {/* ─── LOGIN ──────────────────────────────────────────────── */}
              {view === 'login' && (
                <div className="space-y-6">
                  <div className="au da1">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-200 mb-4">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-1">Welcome back</h2>
                    <p className="text-sm text-slate-500">Sign in to your clinical workspace</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="au da2">
                      <InputField label="Email Address" icon={Mail} type="email"
                        value={loginEmail} onChange={setLoginEmail}
                        placeholder="doctor@hospital.org" required error={loginError} />
                    </div>
                    <div className="au da3">
                      <InputField label="Password" icon={Lock} type="password"
                        value={loginPassword} onChange={setLoginPassword}
                        placeholder="••••••••" required />
                    </div>
                    <div className="au da4 flex items-center justify-between text-xs">
                      <label className="flex items-center gap-2 text-slate-500 cursor-pointer select-none">
                        <input type="checkbox" className="rounded border-slate-300 text-sky-500 focus:ring-sky-300" />
                        <span>Remember me</span>
                      </label>
                      <button type="button" className="text-sky-600 hover:text-sky-700 font-semibold transition">
                        Forgot password?
                      </button>
                    </div>
                    <div className="au da5">
                      <button type="submit" disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold text-sm shadow-lg shadow-sky-200 hover:shadow-sky-300 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                        {loading
                          ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>Authenticating…</span></>
                          : <><span>Sign In to Dashboard</span><ArrowRight className="w-4 h-4" /></>
                        }
                      </button>
                    </div>
                  </form>

                  {/* Quick demo logins */}
                  <div className="au da6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-slate-100" />
                      <span className="text-[11px] text-slate-500 font-semibold whitespace-nowrap">Quick demo login</span>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { role: 'DOCTOR' as UserRole, label: 'Doctor', icon: Stethoscope, cls: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300' },
                        { role: 'HOSPITAL_ADMIN' as UserRole, label: 'Hospital Admin', icon: Shield, cls: 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100 hover:border-sky-300' },
                        { role: 'NURSE' as UserRole, label: 'Nurse', icon: HeartPulse, cls: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300' },
                        { role: 'PATIENT' as UserRole, label: 'Patient', icon: User, cls: 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 hover:border-rose-300' },
                      ] as const).map((r) => {
                        const Icon = r.icon;
                        return (
                          <button key={r.role} onClick={() => demoLogin(r.role)} disabled={loading}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition ${r.cls} disabled:opacity-50`}>
                            <Icon className="w-3.5 h-3.5 shrink-0" /><span>{r.label} Demo</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <p className="text-center text-xs text-slate-500 au da6">
                    New patient or staff?{' '}
                    <button onClick={() => { setView('signup'); setSignupStep(1); }}
                      className="text-sky-600 hover:text-sky-700 font-bold transition">
                      Create Account
                    </button>
                  </p>
                  <p className="text-center text-xs text-slate-500 au da6">
                    <button onClick={onGoToLanding} className="hover:text-sky-600 transition">← Back to PulseCloud site</button>
                  </p>
                </div>
              )}

              {/* ─── SIGNUP ────────────────────────────────────────────── */}
              {view === 'signup' && (
                <div className="space-y-6">
                  <div className="au da1">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-200 mb-4">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-1">Create account</h2>
                    <p className="text-sm text-slate-500">Patient registration · HIPAA compliant</p>
                  </div>

                  {/* Step indicator */}
                  <div className="au da2 flex items-center gap-3">
                    {([
                      { n: 1, label: 'Personal' },
                      { n: 2, label: 'Medical' },
                      { n: 3, label: 'Verify OTP' },
                    ] as { n: SignupStep; label: string }[]).map((s, idx) => (
                      <React.Fragment key={s.n}>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className={`w-7 h-7 rounded-full border-2 text-[11px] font-black flex items-center justify-center transition-all ${
                            signupStep === s.n ? 'step-on'
                            : signupStep > s.n ? 'step-ok'
                            : 'step-off'
                          }`}>
                            {signupStep > s.n ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.n}
                          </div>
                          <span className={`text-[11px] font-semibold hidden sm:block transition-colors ${
                            signupStep === s.n ? 'text-slate-800' : signupStep > s.n ? 'text-sky-600' : 'text-slate-600'
                          }`}>{s.label}</span>
                        </div>
                        {idx < 2 && (
                          <div className={`flex-1 h-px transition-all ${signupStep > s.n ? 'bg-sky-300' : 'bg-slate-200'}`} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* ── Step 1: Personal Info ─────────────────────────── */}
                  {signupStep === 1 && (
                    <div className="space-y-4">
                      <div className="au da2">
                        <InputField label="Full Name" icon={User} value={name} onChange={setName} placeholder="Kavita Sharma" required />
                      </div>
                      <div className="au da3">
                        <InputField label="Email Address" icon={Mail} type="email" value={email} onChange={setEmail} placeholder="jane@example.com" required />
                      </div>
                      <div className="au da3">
                        <InputField label="Password" icon={Lock} type="password" value={password} onChange={setPassword}
                          placeholder="Min. 8 characters" required
                          hint="Use uppercase, lowercase, numbers & symbols" />
                      </div>
                      <div className="au da4">
                        <InputField label="Confirm Password" icon={Lock} type="password"
                          value={confirmPassword} onChange={setConfirmPassword}
                          placeholder="Re-enter password" required
                          error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined} />
                      </div>
                      <div className="au da4">
                        <InputField label="Mobile Number" icon={Phone} type="tel"
                          value={phone} onChange={setPhone}
                          placeholder="+91 98765 43210" required
                          hint="OTP will be sent to this number for verification" />
                      </div>
                      <div className="au da5">
                        <button disabled={!step1Valid} onClick={() => setSignupStep(2)}
                          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold text-sm shadow-lg shadow-sky-200 hover:shadow-sky-300 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                          <span>Continue to Medical Details</span><ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Step 2: Medical Details ───────────────────────── */}
                  {signupStep === 2 && (
                    <div className="space-y-4">
                      <div className="au da1 rounded-xl bg-violet-50 border border-violet-200 p-3 flex items-start gap-2">
                        <Brain className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-violet-700 leading-relaxed">
                          Medical details help clinicians provide accurate care and prevent dangerous drug interactions.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="au da2">
                          <InputField label="Date of Birth" icon={Calendar} type="date" value={dob} onChange={setDob} required />
                        </div>
                        <div className="au da2">
                          <SelectField label="Gender" icon={User} value={gender} onChange={setGender} required
                            options={[{ label: 'Male', value: 'M' }, { label: 'Female', value: 'F' }, { label: 'Other', value: 'O' }]} />
                        </div>
                      </div>

                      <div className="au da3">
                        <SelectField label="Blood Group" icon={Droplets} value={bloodGroup} onChange={setBloodGroup}
                          options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => ({ label: b, value: b }))} />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="au da3">
                          <InputField label="Height (cm)" icon={Ruler} value={height} onChange={setHeight} placeholder="170" />
                        </div>
                        <div className="au da4">
                          <InputField label="Weight (kg)" icon={Weight} value={weight} onChange={setWeight} placeholder="68" />
                        </div>
                      </div>

                      <div className="au da4 space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600">Known Allergies</label>
                        <textarea value={allergies} onChange={(e) => setAllergies(e.target.value)}
                          placeholder="e.g. Penicillin, Sulfa drugs, Peanuts…" rows={2}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 resize-none transition" />
                      </div>

                      <div className="au da5 space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600">Chronic Conditions</label>
                        <textarea value={conditions} onChange={(e) => setConditions(e.target.value)}
                          placeholder="e.g. Hypertension, Type 2 Diabetes, Asthma…" rows={2}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 resize-none transition" />
                      </div>

                      <div className="au da5 space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600">Current Medications</label>
                        <textarea value={medications} onChange={(e) => setMedications(e.target.value)}
                          placeholder="e.g. Metformin 500mg, Atenolol 25mg…" rows={2}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 resize-none transition" />
                      </div>

                      <div className="au da6 border-t border-slate-100 pt-4">
                        <p className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-rose-500" />Emergency Contact
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <InputField label="Name" icon={User} value={emergencyName} onChange={setEmergencyName} placeholder="Amitabh Verma" />
                          <InputField label="Phone" icon={Phone} value={emergencyPhone} onChange={setEmergencyPhone} placeholder="+91 98765 00000" />
                        </div>
                      </div>

                      <div className="flex gap-3 au da6">
                        <button onClick={() => setSignupStep(1)}
                          className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition">
                          ← Back
                        </button>
                        <button onClick={() => { setSignupStep(3); setOtpSent(false); }}
                          className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold text-sm shadow-lg shadow-sky-200 hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
                          <span>Send OTP</span><Phone className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Step 3: OTP Verification ──────────────────────── */}
                  {signupStep === 3 && (
                    <div className="space-y-5">
                      <div className="au da1 rounded-2xl border border-sky-200 bg-sky-50 p-6 text-center space-y-4">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-200">
                          <Phone className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-base mb-1">Verify Your Phone Number</p>
                          <p className="text-sm text-slate-500">We'll send a 6-digit OTP to</p>
                          <p className="text-sky-600 font-bold text-sm mt-1">{phone || '+XX XXXXX XXXXX'}</p>
                        </div>

                        {!otpSent ? (
                          <button onClick={handleSendOtp}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold text-sm shadow-lg shadow-sky-200 hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
                            <Phone className="w-4 h-4" /><span>Send OTP Now</span>
                          </button>
                        ) : (
                          <div className="space-y-5">
                            {/* OTP inputs */}
                            <div className="flex justify-center gap-2">
                              {otpValues.map((v, i) => (
                                <input key={i}
                                  ref={(el) => { otpRefs.current[i] = el; }}
                                  value={v} maxLength={1} inputMode="numeric"
                                  onChange={(e) => handleOtpChange(i, e.target.value)}
                                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                  className={`w-11 h-12 rounded-xl border-2 text-center text-xl font-black text-slate-800 outline-none transition-all ${
                                    v
                                      ? 'border-sky-500 bg-sky-50 text-sky-700'
                                      : 'border-slate-200 bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-100'
                                  }`}
                                />
                              ))}
                            </div>

                            {otpVerified ? (
                              <div className="flex items-center justify-center gap-2 text-emerald-600">
                                <CheckCircle2 className="w-5 h-5 cpop" />
                                <span className="font-bold text-sm">Verified! Setting up profile…</span>
                              </div>
                            ) : (
                              <>
                                <button onClick={handleVerifyOtp}
                                  disabled={otpValues.join('').length < 6 || loading}
                                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold text-sm shadow-lg shadow-sky-200 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                                  {loading
                                    ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>Creating profile…</span></>
                                    : <><span>Verify & Create Account</span><ArrowRight className="w-4 h-4" /></>
                                  }
                                </button>
                                <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                                  <Clock className="w-3.5 h-3.5" />
                                  {otpTimer > 0 ? (
                                    <span>Resend OTP in <strong className="text-slate-600">{otpTimer}s</strong></span>
                                  ) : (
                                    <button onClick={() => { setOtpValues(['', '', '', '', '', '']); setOtpTimer(30); }}
                                      className="flex items-center gap-1 text-sky-600 hover:text-sky-700 font-semibold transition">
                                      <RefreshCw className="w-3 h-3" />Resend OTP
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      <button onClick={() => setSignupStep(2)}
                        className="au da1 w-full py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-semibold text-sm transition">
                        ← Back to Medical Details
                      </button>
                    </div>
                  )}

                  <p className="text-center text-xs text-slate-500">
                    Already have an account?{' '}
                    <button onClick={() => setView('login')}
                      className="text-sky-600 hover:text-sky-700 font-bold transition">
                      Sign In
                    </button>
                  </p>
                  <p className="text-center text-xs text-slate-500">
                    <button onClick={onGoToLanding} className="hover:text-sky-600 transition">← Back to PulseCloud site</button>
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </>
  );
};



