import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Shield, 
  Stethoscope, 
  HeartPulse, 
  Heart,
  Cpu, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  Terminal, 
  Wifi, 
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Zap,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { UserRole } from '../../types/index.js';
import { GoogleAccountModal } from './GoogleAccountModal.js';

interface AnimatedLogoLoginPageProps {
  onSuccessLogin: () => void;
  onGoToLanding?: () => void;
}

export const AnimatedLogoLoginPage: React.FC<AnimatedLogoLoginPageProps> = ({ 
  onSuccessLogin,
  onGoToLanding 
}) => {
  const { login, loginWithGoogle, loginWithFirebaseEmail } = useAuth();

  // Splash screen animation state
  const [showSplash, setShowSplash] = useState(true);
  const [splashProgress, setSplashProgress] = useState(0);
  const [splashStatus, setSplashStatus] = useState('Initializing AVORA AI Telemetry...');

  // Form state
  const [selectedRole, setSelectedRole] = useState<UserRole>('HOSPITAL_ADMIN');
  const [email, setEmail] = useState('admin@hospital.org');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // Splash screen progress simulation
  useEffect(() => {
    if (!showSplash) return;
    const interval = setInterval(() => {
      setSplashProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setShowSplash(false), 400);
          return 100;
        }
        const next = prev + 5;
        if (next === 25) setSplashStatus('Connecting Encrypted Bio-Telemetry Mesh...');
        if (next === 55) setSplashStatus('Syncing NABL & HIPAA Data Nodes...');
        if (next === 85) setSplashStatus('AVORA Operating System Ready');
        return next;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [showSplash]);

  // Update default credentials when role tab changes
  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setError('');
    if (role === 'DOCTOR') {
      setEmail('doctor@hospital.org');
      setPassword('doctor123');
    } else if (role === 'HOSPITAL_ADMIN') {
      setEmail('admin@hospital.org');
      setPassword('admin123');
    } else if (role === 'NURSE') {
      setEmail('sunita.s@hospital.org');
      setPassword('nurse123');
    } else if (role === 'TECHNICAL_STAFF') {
      setEmail('tech.ops@hospital.org');
      setPassword('tech123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your Email or User ID');
      return;
    }
    setError('');
    setLoading(true);

    try {
      if (password && password.length >= 6) {
        try {
          await loginWithFirebaseEmail(email, password, selectedRole);
        } catch {
          await login(email, selectedRole);
        }
      } else {
        await login(email, selectedRole);
      }
      onSuccessLogin();
    } catch (err: any) {
      console.error(err);
      setError('Invalid credentials. Please verify your Email and Password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const success = await loginWithGoogle(selectedRole);
      if (success) {
        onSuccessLogin();
      } else {
        setIsGoogleModalOpen(true);
      }
    } catch {
      setIsGoogleModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGoogleAccount = async (accountEmail: string, accountName: string) => {
    await loginWithGoogle(selectedRole, accountEmail, accountName);
    onSuccessLogin();
  };

  // Role Configurations for Switcher
  const rolesConfig = [
    {
      role: 'HOSPITAL_ADMIN' as UserRole,
      label: 'Hospital Admin',
      icon: Shield,
      gradient: 'from-blue-600 to-sky-600',
      badge: 'Executive Node'
    },
    {
      role: 'DOCTOR' as UserRole,
      label: 'Doctor Portal',
      icon: Stethoscope,
      gradient: 'from-indigo-600 to-purple-600',
      badge: 'Clinical EMR'
    },
    {
      role: 'NURSE' as UserRole,
      label: 'Nurse Station',
      icon: HeartPulse,
      gradient: 'from-emerald-600 to-teal-600',
      badge: 'MAR Telemetry'
    },
    {
      role: 'TECHNICAL_STAFF' as UserRole,
      label: 'Tech Operations',
      icon: Cpu,
      gradient: 'from-cyan-600 to-blue-700',
      badge: 'IT Infrastructure'
    },
    {
      role: 'PATIENT' as UserRole,
      label: 'Patient Portal',
      icon: Heart,
      gradient: 'from-rose-600 to-pink-600',
      badge: 'Personal EMR & Labs'
    }
  ];

  const currentRoleObj = rolesConfig.find(r => r.role === selectedRole) || rolesConfig[0];

  return (
    <>
      <style>{`
        @keyframes avoraPulseGlow {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 25px rgba(2, 132, 199, 0.4)); }
          50% { transform: scale(1.06); filter: drop-shadow(0 0 50px rgba(2, 132, 199, 0.8)); }
        }
        @keyframes avoraEcgDash {
          0% { stroke-dashoffset: 1200; }
          100% { stroke-dashoffset: -1200; }
        }
        .avora-logo-glow { animation: avoraPulseGlow 3s infinite ease-in-out; }
        .avora-ecg-line {
          stroke-dasharray: 1200;
          animation: avoraEcgDash 4s linear infinite;
        }
      `}</style>

      {/* ── 1. ANIMATED LOGO SPLASH ENTRANCE SCREEN ───────────────────────────── */}
      {showSplash ? (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden">
          
          {/* Animated Background Mesh & Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.15)_0,transparent_70%)] pointer-events-none" />
          
          {/* SVG Animated ECG Heartbeat Line Background */}
          <svg className="absolute w-full h-48 opacity-25 pointer-events-none" viewBox="0 0 1200 200" preserveAspectRatio="none">
            <path
              d="M 0,100 L 300,100 L 330,40 L 360,160 L 390,70 L 420,130 L 450,100 L 750,100 L 780,30 L 810,170 L 840,60 L 870,140 L 900,100 L 1200,100"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="4"
              className="avora-ecg-line"
            />
          </svg>

          {/* Central Logo & Emblem Container */}
          <div className="relative z-10 flex flex-col items-center space-y-6 text-center max-w-md">
            
            {/* Glowing Animated Logo Badge */}
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 via-sky-500 to-emerald-400 p-0.5 avora-logo-glow shadow-2xl">
                <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-sky-400 relative overflow-hidden">
                  <Activity className="w-12 h-12 text-sky-400 animate-pulse" />
                  <span className="absolute top-2 right-2 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                </div>
              </div>
            </div>

            {/* Title & Branding */}
            <div>
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                <span>Certified Clinical SaaS Engine</span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight">AVORA OS</h1>
              <p className="text-xs text-sky-200/80 font-medium mt-1">Enterprise Healthcare Operating System</p>
            </div>

            {/* Progress Bar & Status Indicator */}
            <div className="w-full space-y-2 pt-4">
              <div className="w-full h-2 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-emerald-400 transition-all duration-150 rounded-full"
                  style={{ width: `${splashProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="truncate">{splashStatus}</span>
                <span className="font-bold text-sky-400">{splashProgress}%</span>
              </div>
            </div>

            <button
              onClick={() => setShowSplash(false)}
              className="mt-2 text-xs font-bold text-sky-400 hover:text-white underline transition"
            >
              Skip Animation →
            </button>
          </div>

        </div>
      ) : (
        /* ── 2. HIGH-TECH FUTURISTIC LOGIN INTERFACE ────────────────────────────── */
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-sky-500 selection:text-white">
          
          {/* Glowing Background Radial Orbs */}
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-sky-600/15 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[150px] pointer-events-none" />

          {/* Top Bar Header */}
          <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={onGoToLanding}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-emerald-400 p-0.5 shadow-md shadow-sky-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-sky-400">
                  <Activity className="w-5 h-5 text-sky-400 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-black text-xl text-white tracking-tight">AVORA</span>
                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/30">
                    Operating System
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Enterprise Healthcare Portal</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {onGoToLanding && (
                <button
                  onClick={onGoToLanding}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition border border-slate-700"
                >
                  ← Back to Home
                </button>
              )}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>99.9% System Online</span>
              </div>
            </div>
          </header>

          {/* Main Card Container */}
          <main className="relative z-10 max-w-5xl mx-auto px-4 py-8 w-full flex-1 flex flex-col justify-center">
            
            <div className="bg-slate-950/80 rounded-3xl border border-slate-800 shadow-2xl shadow-sky-950/50 backdrop-blur-2xl overflow-hidden grid lg:grid-cols-12">
              
              {/* Left Column: Role Selector & System Status */}
              <div className="lg:col-span-5 p-6 sm:p-8 bg-slate-900/60 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between space-y-6">
                <div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-extrabold uppercase tracking-wider mb-3">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Role-Based Access Control</span>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Select Portal Workspace</h2>
                  <p className="text-slate-400 text-xs font-medium mt-1">
                    Choose your credential role to access dedicated clinical workflows and telemetry nodes.
                  </p>

                  {/* Role Selector Tabs */}
                  <div className="space-y-2.5 mt-6">
                    {rolesConfig.map((r) => {
                      const Icon = r.icon;
                      const active = selectedRole === r.role;
                      return (
                        <button
                          key={r.role}
                          onClick={() => handleRoleChange(r.role)}
                          className={`w-full p-3.5 rounded-2xl border text-left transition duration-200 flex items-center justify-between cursor-pointer ${
                            active
                              ? `bg-gradient-to-r ${r.gradient} text-white border-transparent shadow-lg shadow-sky-950`
                              : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${active ? 'bg-white/20 text-white' : 'bg-slate-800 text-sky-400'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-extrabold block leading-tight">{r.label}</span>
                              <span className={`text-[10px] font-medium ${active ? 'text-white/80' : 'text-slate-500'}`}>{r.badge}</span>
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-600'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* System Notice */}
                <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-800/40 text-[11px] text-sky-200 font-medium space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-sky-300">
                    <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Instant Demo Authentication</span>
                  </div>
                  <p className="text-slate-400 text-[10px]">
                    Credentials auto-update based on your selected role. Click 1-Click Auto-Fill to test dashboard tools immediately.
                  </p>
                </div>
              </div>

              {/* Right Column: Login Form */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                
                {/* Form Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-xl font-black text-white">Sign In to {currentRoleObj.label}</h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Enter your credentials or use Google Account SSO</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
                    ⚠️ {error}
                  </div>
                )}

                {/* Main Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">User Email / Badge ID</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@hospital.org"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Security Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center space-x-2 text-slate-400 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-800 text-sky-500 focus:ring-sky-500"
                      />
                      <span>Remember Session</span>
                    </label>
                    <a href="#" className="text-sky-400 hover:underline font-bold">Forgot Password?</a>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${currentRoleObj.gradient} hover:opacity-95 text-white font-black text-xs shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer`}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Authenticating Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to {currentRoleObj.label}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-extrabold">
                      <span className="bg-slate-950 px-3 text-slate-500">OR CONTINUE WITH GOOGLE</span>
                    </div>
                  </div>

                  {/* Google Sign In Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs transition flex items-center justify-center space-x-3 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Sign in with Google (Firebase)</span>
                  </button>
                </form>

                {/* Quick Auto-Fill Demo Bar */}
                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Demo User: <strong className="text-slate-300">{email}</strong></span>
                  <button
                    type="button"
                    onClick={() => handleRoleChange(selectedRole)}
                    className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 font-bold text-[10px] border border-sky-500/30 transition cursor-pointer"
                  >
                    Auto-Fill Demo Credentials
                  </button>
                </div>

              </div>

            </div>

          </main>

          {/* Footer */}
          <footer className="relative z-10 py-4 px-6 text-center text-xs text-slate-500 border-t border-slate-800 bg-slate-950/80">
            AVORA Hospital Operating System · HIPAA Certified & SOC 2 Compliant Healthcare Platform
          </footer>

          {/* Interactive Google Account Selector Modal */}
          <GoogleAccountModal
            isOpen={isGoogleModalOpen}
            onClose={() => setIsGoogleModalOpen(false)}
            onSelectAccount={handleSelectGoogleAccount}
            role={selectedRole}
          />
        </div>
      )}
    </>
  );
};
