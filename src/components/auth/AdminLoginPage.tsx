import React, { useState } from 'react';
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Building,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Users,
  BarChart3,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface AdminLoginPageProps {
  onBackToRoles: () => void;
  onSuccessLogin: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onBackToRoles, onSuccessLogin }) => {
  const { login } = useAuth();
  const [adminId, setAdminId] = useState('admin@hospital.org');
  const [password, setPassword] = useState('admin123');
  const [hospitalCode, setHospitalCode] = useState('HMS-APEX-01');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId) {
      setError('Please enter your Admin Email or ID');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(adminId, 'HOSPITAL_ADMIN');
      onSuccessLogin();
    } catch {
      setError('Invalid Admin credentials. Please check your Hospital Code & ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Sky Executive Glow Background */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-sky-100/60 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackToRoles}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-sky-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Role Selection</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center border border-sky-200">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-slate-900">Hospital Executive Console</span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 my-6">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-3xl border border-sky-100 bg-white shadow-2xl shadow-sky-100/60 overflow-hidden">
          {/* Left Panel: Admin Executive Branding */}
          <div className="p-8 bg-gradient-to-br from-sky-50/80 via-sky-50/30 to-white border-b md:border-b-0 md:border-r border-sky-100 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-lg shadow-sky-200">
                <Shield className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                  Institutional Governance
                </span>
                <h1 className="text-2xl font-black text-slate-900 mt-3">Hospital Admin Console</h1>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Executive management center for hospital directors, operations leads, and administrative officers. Manage personnel, beds, finance & system settings.
                </p>
              </div>

              {/* Feature Pills */}
              <div className="space-y-2.5 pt-2">
                {[
                  { label: 'Staff & Physician HR Roster Control', icon: Users },
                  { label: 'Ward Occupancy & Bed Allocation Matrix', icon: Building },
                  { label: 'Institutional Billing & Financial Telemetry', icon: BarChart3 }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white border border-sky-100 text-xs font-semibold text-sky-900 shadow-2xs">
                      <Icon className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-sky-100 text-[11px] text-slate-500 font-medium">
              Executive Administrator Access Only. System Audit Log Active.
            </div>
          </div>

          {/* Right Panel: Hospital Admin Login Form */}
          <div className="p-8 flex flex-col justify-between space-y-6 bg-white">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Admin Executive Sign In</h2>
              <p className="text-xs text-slate-500 mb-6">Enter institutional administrator credentials.</p>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Admin ID / Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <span>Admin Email or Officer ID</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50 focus-within:border-sky-500 focus-within:bg-white transition">
                    <Mail className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
                    <input
                      type="text"
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      placeholder="admin@hospital.org"
                      className="w-full bg-transparent px-3 py-3 text-xs text-slate-800 font-medium placeholder-slate-400 outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Admin Password</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50 focus-within:border-sky-500 focus-within:bg-white transition">
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

                {/* Hospital Code */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Hospital Code
                  </label>
                  <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50 focus-within:border-sky-500 transition">
                    <KeyRound className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
                    <input
                      type="text"
                      value={hospitalCode}
                      onChange={(e) => setHospitalCode(e.target.value)}
                      placeholder="HMS-APEX-01"
                      className="w-full bg-transparent px-3 py-3 text-xs text-slate-800 font-mono font-semibold outline-none"
                    />
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span>Remember Admin Credentials</span>
                  </label>
                  <a href="#" onClick={(e) => { e.preventDefault(); alert('Reset request sent to Root SaaS Security Console.'); }} className="text-sky-600 font-semibold hover:underline">
                    Forgot Password?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Executive Authentication…</span>
                    </>
                  ) : (
                    <>
                      <span>Open Admin Control Console</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Demo Hint */}
            <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3 text-[11px] text-sky-900 flex items-center justify-between font-medium">
              <div>
                <span className="font-bold text-sky-700">Demo Admin:</span> admin@hospital.org
              </div>
              <button
                type="button"
                onClick={() => { setAdminId('admin@hospital.org'); setPassword('admin123'); setHospitalCode('HMS-APEX-01'); }}
                className="text-[10px] bg-sky-600 hover:bg-sky-700 text-white px-2.5 py-1 rounded-lg font-bold shadow-xs"
              >
                Auto-Fill Demo
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        PulseCloud HMS Executive Admin · Institutional Governance Node
      </footer>
    </div>
  );
};
