import React, { useState } from 'react';
import {
  Stethoscope,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Activity,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  Brain,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface DoctorLoginPageProps {
  onBackToRoles: () => void;
  onSuccessLogin: () => void;
}

export const DoctorLoginPage: React.FC<DoctorLoginPageProps> = ({ onBackToRoles, onSuccessLogin }) => {
  const { login } = useAuth();
  const [doctorId, setDoctorId] = useState('doctor@hospital.org');
  const [password, setPassword] = useState('doctor123');
  const [department, setDepartment] = useState('Cardiology');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId) {
      setError('Please enter your Doctor ID or Email Address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(doctorId, 'DOCTOR');
      onSuccessLogin();
    } catch {
      setError('Invalid Doctor credentials. Please verify your Doctor ID or Password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Clinical Indigo Ambient Background Glow */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
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
            <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Stethoscope className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-white">PulseCloud Clinical Gateway</span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 my-6">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-3xl border border-indigo-900/50 bg-slate-900/90 shadow-2xl shadow-indigo-950/60 overflow-hidden backdrop-blur-xl">
          {/* Left Panel: Clinical Branding */}
          <div className="p-8 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-b md:border-b-0 md:border-r border-indigo-900/40 flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-950/50">
                <Stethoscope className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Doctor Authentication
                </span>
                <h1 className="text-2xl font-black text-white mt-3">Clinical Workspace</h1>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Dedicated portal for physicians, surgeons, and specialists. Secure access to EHR patient records, prescriptions & AI dictation.
                </p>
              </div>

              {/* Feature Pills */}
              <div className="space-y-2.5 pt-2">
                {[
                  { label: 'Ambient AI Dictation Notes', icon: Brain },
                  { label: 'Live Patient Vitals & EHR Charts', icon: Activity },
                  { label: 'Digital Rx & Drug Interaction Checks', icon: CheckCircle2 }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-indigo-950/50 border border-indigo-900/40 text-xs text-indigo-200">
                      <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-indigo-900/30 text-[11px] text-slate-500">
              Authorized Medical Practitioner Access Only. HIPAA Protected.
            </div>
          </div>

          {/* Right Panel: Doctor Login Form */}
          <div className="p-8 flex flex-col justify-between space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Doctor Sign In</h2>
              <p className="text-xs text-slate-400 mb-6">Enter your credential details to open your clinical desk.</p>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Doctor ID / Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <span>Doctor ID or Email</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative flex items-center rounded-xl border border-slate-800 bg-slate-950 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition">
                    <Mail className="w-4 h-4 text-slate-500 ml-3.5 shrink-0" />
                    <input
                      type="text"
                      value={doctorId}
                      onChange={(e) => setDoctorId(e.target.value)}
                      placeholder="dr.smith@hospital.org"
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
                  <div className="relative flex items-center rounded-xl border border-slate-800 bg-slate-950 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition">
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

                {/* Clinical Department Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <span>Active Clinical Ward / Department</span>
                  </label>
                  <div className="relative flex items-center rounded-xl border border-slate-800 bg-slate-950 focus-within:border-indigo-500 transition">
                    <Building2 className="w-4 h-4 text-slate-500 ml-3.5 shrink-0" />
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-transparent px-3 py-3 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="Cardiology" className="bg-slate-900 text-white">Cardiology Department</option>
                      <option value="General Medicine" className="bg-slate-900 text-white">General Medicine</option>
                      <option value="Neurology" className="bg-slate-900 text-white">Neurology Ward</option>
                      <option value="Pediatrics" className="bg-slate-900 text-white">Pediatrics & Neonatal Care</option>
                      <option value="Surgery & ICU" className="bg-slate-900 text-white">Surgery & ICU Desk</option>
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
                      className="rounded border-slate-800 bg-slate-950 text-indigo-500 focus:ring-indigo-500"
                    />
                    <span>Remember my Doctor Session</span>
                  </label>
                  <a href="#" onClick={(e) => { e.preventDefault(); alert('Reset link sent to hospital IT desk.'); }} className="text-indigo-400 hover:underline">
                    Forgot Password?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-950/50 hover:shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Authenticating Doctor Credentials…</span>
                    </>
                  ) : (
                    <>
                      <span>Open Doctor Desk</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick credentials hint */}
            <div className="rounded-xl border border-indigo-900/40 bg-indigo-950/30 p-3 text-[11px] text-indigo-300 flex items-center justify-between">
              <div>
                <span className="font-bold">Demo Doctor:</span> doctor@hospital.org
              </div>
              <button
                type="button"
                onClick={() => { setDoctorId('doctor@hospital.org'); setPassword('doctor123'); }}
                className="text-[10px] bg-indigo-500/20 hover:bg-indigo-500/40 px-2 py-1 rounded text-indigo-200 border border-indigo-500/30 font-semibold"
              >
                Auto-Fill Demo
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-500 border-t border-slate-800/60 bg-slate-950">
        PulseCloud HMS Doctor Portal · Protected Medical Access System
      </footer>
    </div>
  );
};
