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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Soft Lighting Gradients */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-indigo-100/60 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-sky-100/50 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackToRoles}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Role Selection</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center border border-indigo-200">
              <Stethoscope className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-slate-900">Doctor Clinical Portal</span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 my-6">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-3xl border border-indigo-100 bg-white shadow-2xl shadow-indigo-100/60 overflow-hidden">
          {/* Left Panel: Clinical Branding */}
          <div className="p-8 bg-gradient-to-br from-indigo-50/80 via-indigo-50/30 to-white border-b md:border-b-0 md:border-r border-indigo-100 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                <Stethoscope className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                  Physician Access
                </span>
                <h1 className="text-2xl font-black text-slate-900 mt-3">Doctor Clinical Desk</h1>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Dedicated portal for medical practitioners, physicians, and surgeons. Access ambient AI consultation notes, diagnostic charts & patient EMR records.
                </p>
              </div>

              {/* Feature Pills */}
              <div className="space-y-2.5 pt-2">
                {[
                  { label: 'Ambient AI Dictation & Consult Notes', icon: Brain },
                  { label: 'Live Patient Vitals & EHR Charts', icon: Activity },
                  { label: 'Digital Rx & Drug Interaction Checks', icon: CheckCircle2 }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white border border-indigo-100 text-xs font-semibold text-indigo-900 shadow-2xs">
                      <Icon className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-indigo-100 text-[11px] text-slate-500 font-medium">
              HIPAA Protected Medical System. Authorized Physicians Only.
            </div>
          </div>

          {/* Right Panel: Doctor Login Form */}
          <div className="p-8 flex flex-col justify-between space-y-6 bg-white">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Doctor Sign In</h2>
              <p className="text-xs text-slate-500 mb-6">Enter your medical ID credentials to open your desk.</p>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Doctor ID / Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <span>Doctor ID or Email</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50 focus-within:border-indigo-500 focus-within:bg-white transition">
                    <Mail className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
                    <input
                      type="text"
                      value={doctorId}
                      onChange={(e) => setDoctorId(e.target.value)}
                      placeholder="dr.smith@hospital.org"
                      className="w-full bg-transparent px-3 py-3 text-xs text-slate-800 font-medium placeholder-slate-400 outline-none"
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
                  <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50 focus-within:border-indigo-500 focus-within:bg-white transition">
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

                {/* Clinical Department */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Active Clinical Department
                  </label>
                  <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50 focus-within:border-indigo-500 transition">
                    <Building2 className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-transparent px-3 py-3 text-xs text-slate-800 font-semibold outline-none cursor-pointer"
                    >
                      <option value="Cardiology">Cardiology Department</option>
                      <option value="General Medicine">General Medicine</option>
                      <option value="Neurology">Neurology Ward</option>
                      <option value="Pediatrics">Pediatrics & Neonatal Care</option>
                      <option value="Surgery & ICU">Surgery & ICU Desk</option>
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
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Remember my Doctor Session</span>
                  </label>
                  <a href="#" onClick={(e) => { e.preventDefault(); alert('Reset link sent to hospital IT desk.'); }} className="text-indigo-600 font-semibold hover:underline">
                    Forgot Password?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
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

            {/* Demo Hint */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-[11px] text-indigo-900 flex items-center justify-between font-medium">
              <div>
                <span className="font-bold text-indigo-700">Demo Doctor:</span> doctor@hospital.org
              </div>
              <button
                type="button"
                onClick={() => { setDoctorId('doctor@hospital.org'); setPassword('doctor123'); }}
                className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-lg font-bold shadow-xs"
              >
                Auto-Fill Demo
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        PulseCloud HMS Doctor Portal · Protected Medical Access System
      </footer>
    </div>
  );
};
