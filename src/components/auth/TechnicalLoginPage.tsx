import React, { useState } from 'react';
import {
  Cpu,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Server,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Activity,
  Terminal,
  Wifi,
  HardDrive
} from 'lucide-react';
import { GoogleAccountModal } from './GoogleAccountModal.js';
import { useAuth } from '../../context/AuthContext.js';

interface TechnicalLoginPageProps {
  onBackToRoles: () => void;
  onSuccessLogin: () => void;
}

export const TechnicalLoginPage: React.FC<TechnicalLoginPageProps> = ({ onBackToRoles, onSuccessLogin }) => {
  const { login, loginWithGoogle, loginWithFirebaseEmail } = useAuth();
  const [techId, setTechId] = useState('tech.ops@hospital.org');
  const [password, setPassword] = useState('tech123');
  const [unit, setUnit] = useState('IT Infrastructure & Servers');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!techId) {
      setError('Please enter your Technical Staff ID or Email');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (password && password.length >= 6) {
        try {
          await loginWithFirebaseEmail(techId, password, 'TECHNICAL_STAFF');
        } catch {
          await login(techId, 'TECHNICAL_STAFF');
        }
      } else {
        await login(techId, 'TECHNICAL_STAFF');
      }
      onSuccessLogin();
    } catch {
      setError('Invalid Tech Ops credentials. Please verify your Technical Staff Badge ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const success = await loginWithGoogle('TECHNICAL_STAFF');
      if (success) {
        onSuccessLogin();
      } else {
        setIsGoogleModalOpen(true);
      }
    } catch (err: any) {
      console.error(err);
      setIsGoogleModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGoogleAccount = async (email: string, name: string) => {
    await loginWithGoogle('TECHNICAL_STAFF', email, name);
    onSuccessLogin();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Cyan Soft Background Glow */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-cyan-100/60 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-100/50 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackToRoles}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-cyan-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Role Selection</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center border border-cyan-200">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-slate-900 font-mono">AVORA Technical Operations Portal</span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 my-6">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-3xl border border-cyan-100 bg-white shadow-2xl shadow-cyan-100/60 overflow-hidden">
          {/* Left Panel: Tech Operations Branding */}
          <div className="p-8 bg-gradient-to-br from-cyan-50/80 via-cyan-50/30 to-white border-b md:border-b-0 md:border-r border-cyan-100 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-lg shadow-cyan-200">
                <Cpu className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 border border-cyan-200">
                  IT & Biomedical Operations
                </span>
                <h1 className="text-2xl font-black text-slate-900 mt-3">Technical Staff Console</h1>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Dedicated telemetry portal for IT system administrators, biomedical engineers & server engineers. Monitor system health, equipment telemetry & incident tickets.
                </p>
              </div>

              {/* Feature Pills */}
              <div className="space-y-2.5 pt-2">
                {[
                  { label: 'Real-time Hospital IT & API Latency Telemetry', icon: Server },
                  { label: 'Biomedical Device Mesh (ICU, MRI, Monitors)', icon: HardDrive },
                  { label: 'Maintenance Incident Tickets & Audit Logs', icon: Terminal }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white border border-cyan-100 text-xs font-semibold text-cyan-900 shadow-2xs font-mono">
                      <Icon className="w-4 h-4 text-cyan-600 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-cyan-100 text-[11px] text-slate-500 font-mono flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <Wifi className="w-3.5 h-3.5" />
                <span>Cluster Status: Operational (99.98% SLA)</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Tech Staff Login Form */}
          <div className="p-8 flex flex-col justify-between space-y-6 bg-white">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Technical Staff Sign In</h2>
              <p className="text-xs text-slate-500 mb-6">Enter your authorized Technical Operations badge credentials.</p>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tech ID / Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <span>Technical Staff ID or Email</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50 focus-within:border-cyan-500 focus-within:bg-white transition">
                    <Mail className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
                    <input
                      type="text"
                      value={techId}
                      onChange={(e) => setTechId(e.target.value)}
                      placeholder="tech.ops@hospital.org"
                      className="w-full bg-transparent px-3 py-3 text-xs text-slate-800 font-mono font-medium placeholder-slate-400 outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Password</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50 focus-within:border-cyan-500 focus-within:bg-white transition">
                    <Lock className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent px-3 py-3 text-xs text-slate-800 font-medium placeholder-slate-400 outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="pr-3.5 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Operations Unit */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Operations Unit / Division
                  </label>
                  <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50 focus-within:border-cyan-500 transition">
                    <Server className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full bg-transparent px-3 py-3 text-xs text-slate-800 font-semibold outline-none cursor-pointer"
                    >
                      <option value="IT Infrastructure & Servers">IT Infrastructure & Servers</option>
                      <option value="Biomedical Equipment Maintenance">Biomedical Equipment Maintenance</option>
                      <option value="Network & Telemetry Ops">Network & Telemetry Ops</option>
                      <option value="PACS Imaging & HL7 Gateways">PACS Imaging & HL7 Gateways</option>
                    </select>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span>Keep Engineering Terminal Open</span>
                  </label>
                  <a href="#" onClick={(e) => { e.preventDefault(); alert('Root Security Admin notified.'); }} className="text-cyan-600 font-semibold hover:underline">
                    Forgot Password?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-200 transition flex items-center justify-center gap-2 disabled:opacity-50 font-mono"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Tech Credentials…</span>
                    </>
                  ) : (
                    <>
                      <span>Open Technical Console</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="relative my-3 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                  <span className="relative bg-white px-3 text-[10px] uppercase font-bold text-slate-400">or sign in with</span>
                </div>

                {/* Firebase Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-2.5 shadow-xs font-sans"
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
            </div>

            {/* Demo Hint */}
            <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 p-3 text-[11px] text-cyan-900 flex items-center justify-between font-medium">
              <div>
                <span className="font-bold text-cyan-700">Demo Tech:</span> tech.ops@hospital.org
              </div>
              <button
                type="button"
                onClick={() => { setTechId('tech.ops@hospital.org'); setPassword('tech123'); }}
                className="text-[10px] bg-cyan-600 hover:bg-cyan-700 text-white px-2.5 py-1 rounded-lg font-bold shadow-xs"
              >
                Auto-Fill Demo
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white font-mono">
        AVORA HMS Technical Operations · Infrastructure Monitoring Core
      </footer>

      <GoogleAccountModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSelectAccount={handleSelectGoogleAccount}
        role="TECHNICAL_STAFF"
      />
    </div>
  );
};
