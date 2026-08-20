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
import { useAuth } from '../../context/AuthContext.js';

interface TechnicalLoginPageProps {
  onBackToRoles: () => void;
  onSuccessLogin: () => void;
}

export const TechnicalLoginPage: React.FC<TechnicalLoginPageProps> = ({ onBackToRoles, onSuccessLogin }) => {
  const { login } = useAuth();
  const [techId, setTechId] = useState('tech.ops@hospital.org');
  const [password, setPassword] = useState('tech123');
  const [unit, setUnit] = useState('IT Infrastructure & Servers');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!techId) {
      setError('Please enter your Technical Staff ID or Email');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(techId, 'TECHNICAL_STAFF');
      onSuccessLogin();
    } catch {
      setError('Invalid Tech Ops credentials. Please verify your Technical Staff Badge ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Cyber Cyan & Amber Tech Glow Background */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-amber-600/10 rounded-full blur-[130px] pointer-events-none" />

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
            <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-white font-mono">PulseCloud Tech Telemetry Gateway</span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 my-6">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-3xl border border-cyan-900/50 bg-slate-900/90 shadow-2xl shadow-cyan-950/60 overflow-hidden backdrop-blur-xl">
          {/* Left Panel: Tech Operations Branding */}
          <div className="p-8 bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-950 border-b md:border-b-0 md:border-r border-cyan-900/40 flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-950/50">
                <Cpu className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  IT & Biomedical Operations
                </span>
                <h1 className="text-2xl font-black text-white mt-3">Technical Staff Console</h1>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Dedicated telemetry portal for IT system administrators, biomedical engineers & server engineers. Monitor system health, equipment telemetry & incident tickets.
                </p>
              </div>

              {/* Feature Pills */}
              <div className="space-y-2.5 pt-2">
                {[
                  { label: 'Real-time Hospital IT & API Latency Telemetry', icon: Server },
                  { label: 'Biomedical Device Mesh Monitoring (ICU, MRI, Monitors)', icon: HardDrive },
                  { label: 'Maintenance Incident Tickets & Audit Logs', icon: Terminal }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-cyan-950/50 border border-cyan-900/40 text-xs text-cyan-200">
                      <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-cyan-900/30 text-[11px] text-slate-400 flex items-center justify-between font-mono">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Wifi className="w-3.5 h-3.5" />
                <span>Network Node: Operational (99.98% SLA)</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Tech Staff Login Form */}
          <div className="p-8 flex flex-col justify-between space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Technical Staff Sign In</h2>
              <p className="text-xs text-slate-400 mb-6">Enter your authorized Technical Operations badge credentials.</p>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tech ID / Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <span>Technical Staff ID or Email</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative flex items-center rounded-xl border border-slate-800 bg-slate-950 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition">
                    <Mail className="w-4 h-4 text-slate-500 ml-3.5 shrink-0" />
                    <input
                      type="text"
                      value={techId}
                      onChange={(e) => setTechId(e.target.value)}
                      placeholder="tech.ops@hospital.org"
                      className="w-full bg-transparent px-3 py-3 text-xs text-white placeholder-slate-500 outline-none font-mono"
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
                  <div className="relative flex items-center rounded-xl border border-slate-800 bg-slate-950 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition">
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

                {/* Department/Unit */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <span>Operations Unit / Engineering Division</span>
                  </label>
                  <div className="relative flex items-center rounded-xl border border-slate-800 bg-slate-950 focus-within:border-cyan-500 transition">
                    <Server className="w-4 h-4 text-slate-500 ml-3.5 shrink-0" />
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full bg-transparent px-3 py-3 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="IT Infrastructure & Servers" className="bg-slate-900 text-white">IT Infrastructure & Servers</option>
                      <option value="Biomedical Equipment Maintenance" className="bg-slate-900 text-white">Biomedical Equipment Maintenance</option>
                      <option value="Network & Telemetry Ops" className="bg-slate-900 text-white">Network & Telemetry Ops</option>
                      <option value="PACS Imaging & HL7 Gateways" className="bg-slate-900 text-white">PACS Imaging & HL7 Gateways</option>
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
                      className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span>Keep Engineering Terminal Open</span>
                  </label>
                  <a href="#" onClick={(e) => { e.preventDefault(); alert('Root Security Admin notified.'); }} className="text-cyan-400 hover:underline">
                    Forgot Password?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/50 hover:shadow-cyan-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 font-mono"
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
              </form>
            </div>

            {/* Demo Hint */}
            <div className="rounded-xl border border-cyan-900/40 bg-cyan-950/30 p-3 text-[11px] text-cyan-300 flex items-center justify-between">
              <div>
                <span className="font-bold">Demo Tech:</span> tech.ops@hospital.org
              </div>
              <button
                type="button"
                onClick={() => { setTechId('tech.ops@hospital.org'); setPassword('tech123'); }}
                className="text-[10px] bg-cyan-500/20 hover:bg-cyan-500/40 px-2 py-1 rounded text-cyan-200 border border-cyan-500/30 font-semibold"
              >
                Auto-Fill Demo
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-500 border-t border-slate-800/60 bg-slate-950 font-mono">
        PulseCloud HMS Technical Operations · Infrastructure Monitoring Core
      </footer>
    </div>
  );
};
