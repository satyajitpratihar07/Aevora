import React, { useState } from 'react';
import {
  HeartPulse,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  BedDouble,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Clock,
  Pill,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface NurseLoginPageProps {
  onBackToRoles: () => void;
  onSuccessLogin: () => void;
}

export const NurseLoginPage: React.FC<NurseLoginPageProps> = ({ onBackToRoles, onSuccessLogin }) => {
  const { login } = useAuth();
  const [nurseId, setNurseId] = useState('sunita.s@hospital.org');
  const [password, setPassword] = useState('nurse123');
  const [wardCode, setWardCode] = useState('General Ward A');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nurseId) {
      setError('Please enter your Nurse ID or Email');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(nurseId, 'NURSE');
      onSuccessLogin();
    } catch {
      setError('Invalid Nurse credentials. Please check your Nurse Badge ID or Password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Emerald Care Glow Background */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackToRoles}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Role Gate</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <HeartPulse className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-white">PulseCloud Staff Nursing Portal</span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 my-6">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-3xl border border-emerald-900/50 bg-slate-900/90 shadow-2xl shadow-emerald-950/60 overflow-hidden backdrop-blur-xl">
          {/* Left Panel: Nurse Patient-Care Branding */}
          <div className="p-8 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 border-b md:border-b-0 md:border-r border-emerald-900/40 flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/50">
                <HeartPulse className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Patient Care & Ward Management
                </span>
                <h1 className="text-2xl font-black text-white mt-3">Nurse Station</h1>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Caregiver portal for staff nurses & head nurses. Manage inpatient bed telemetry, Medicine Administration Records (MAR), vitals monitoring & duty shifts.
                </p>
              </div>

              {/* Feature Pills */}
              <div className="space-y-2.5 pt-2">
                {[
                  { label: 'Medicine Administration Record (MAR)', icon: Pill },
                  { label: 'Real-time Ward & Inpatient Bed Status', icon: BedDouble },
                  { label: 'Shift Roster & Clock-In Attendance', icon: Clock }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-950/50 border border-emerald-900/40 text-xs text-emerald-200">
                      <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-emerald-900/30 text-[11px] text-slate-500 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Staff Nurse Badge Authentication Active.</span>
            </div>
          </div>

          {/* Right Panel: Nurse Login Form */}
          <div className="p-8 flex flex-col justify-between space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Nurse Sign In</h2>
              <p className="text-xs text-slate-400 mb-6">Enter your registered Staff Nurse credentials.</p>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nurse ID / Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <span>Nurse ID or Email</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative flex items-center rounded-xl border border-slate-800 bg-slate-950 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition">
                    <Mail className="w-4 h-4 text-slate-500 ml-3.5 shrink-0" />
                    <input
                      type="text"
                      value={nurseId}
                      onChange={(e) => setNurseId(e.target.value)}
                      placeholder="sunita.s@hospital.org"
                      className="w-full bg-transparent px-3 py-3 text-xs text-white placeholder-slate-500 outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Password</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative flex items-center rounded-xl border border-slate-800 bg-slate-950 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition">
                    <Lock className="w-4 h-4 text-slate-500 ml-3.5 shrink-0" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent px-3 py-3 text-xs text-white placeholder-slate-500 outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="pr-3.5 text-slate-500 hover:text-slate-300 transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Ward Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <span>Assigned Ward Unit</span>
                  </label>
                  <div className="relative flex items-center rounded-xl border border-slate-800 bg-slate-950 focus-within:border-emerald-500 transition">
                    <BedDouble className="w-4 h-4 text-slate-500 ml-3.5 shrink-0" />
                    <select
                      value={wardCode}
                      onChange={(e) => setWardCode(e.target.value)}
                      className="w-full bg-transparent px-3 py-3 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="General Ward A" className="bg-slate-900 text-white">General Ward A</option>
                      <option value="General Ward B" className="bg-slate-900 text-white">General Ward B</option>
                      <option value="ICU Ward" className="bg-slate-900 text-white">Intensive Care Unit (ICU)</option>
                      <option value="Pediatrics" className="bg-slate-900 text-white">Pediatric Care Ward</option>
                      <option value="Maternity" className="bg-slate-900 text-white">Maternity & Neonatal Ward</option>
                    </select>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span>Keep Nurse Duty Session</span>
                  </label>
                  <a href="#" onClick={(e) => { e.preventDefault(); alert('Nursing Head desk notified.'); }} className="text-emerald-400 hover:underline">
                    Forgot Password?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 hover:shadow-emerald-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Opening Nurse Station Workspace…</span>
                    </>
                  ) : (
                    <>
                      <span>Open Nurse Station</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Demo Hint */}
            <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/30 p-3 text-[11px] text-emerald-300 flex items-center justify-between">
              <div>
                <span className="font-bold">Demo Nurse:</span> sunita.s@hospital.org
              </div>
              <button
                type="button"
                onClick={() => { setNurseId('sunita.s@hospital.org'); setPassword('nurse123'); }}
                className="text-[10px] bg-emerald-500/20 hover:bg-emerald-500/40 px-2 py-1 rounded text-emerald-200 border border-emerald-500/30 font-semibold"
              >
                Auto-Fill Demo
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-500 border-t border-slate-800/60 bg-slate-950">
        PulseCloud HMS Staff Nurse Portal · Dedicated Inpatient Telemetry Node
      </footer>
    </div>
  );
};
