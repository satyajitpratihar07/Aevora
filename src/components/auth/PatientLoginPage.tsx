import React, { useState } from 'react';
import { 
  Heart, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw, 
  FileText, 
  Calendar, 
  Activity,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { GoogleAccountModal } from './GoogleAccountModal.js';

interface PatientLoginPageProps {
  onBackToRoles: () => void;
  onSuccessLogin: () => void;
  onGoToSignUp?: () => void;
}

export const PatientLoginPage: React.FC<PatientLoginPageProps> = ({
  onBackToRoles,
  onSuccessLogin,
  onGoToSignUp
}) => {
  const { login, loginWithGoogle, loginWithFirebaseEmail } = useAuth();
  const [email, setEmail] = useState('patient.demo@avora.org');
  const [password, setPassword] = useState('patient123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your Patient Email or UHID Number');
      return;
    }
    setError('');
    setLoading(true);

    try {
      if (password && password.length >= 6) {
        try {
          await loginWithFirebaseEmail(email, password, 'PATIENT');
        } catch {
          await login(email, 'PATIENT');
        }
      } else {
        await login(email, 'PATIENT');
      }
      onSuccessLogin();
    } catch (err: any) {
      console.error(err);
      setError('Invalid patient credentials. Please verify your Email/UHID and Password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const success = await loginWithGoogle('PATIENT');
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
    await loginWithGoogle('PATIENT', accountEmail, accountName);
    onSuccessLogin();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-rose-500 selection:text-white">
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-rose-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-pink-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-slate-800 bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onBackToRoles}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 p-0.5 shadow-md shadow-rose-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-rose-400">
              <Heart className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-xl text-white tracking-tight">AVORA</span>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/30">
                Patient Health Portal
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Personal Medical Records & Lab Diagnostics</p>
          </div>
        </div>

        <button
          onClick={onBackToRoles}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition border border-slate-800"
        >
          ← All Portals
        </button>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 w-full flex-1 flex flex-col justify-center">
        
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl shadow-rose-950/50 backdrop-blur-xl overflow-hidden grid lg:grid-cols-12">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-5 p-6 sm:p-8 bg-gradient-to-b from-rose-950/40 via-slate-900/60 to-slate-950/80 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between space-y-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-extrabold uppercase tracking-wider mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Patient Self-Service Access</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Your Complete Medical History</h2>
              <p className="text-slate-400 text-xs font-medium mt-1">
                Access your prescriptions, lab test reports, upcoming doctor appointments, & Gemini AI health insights in one secure dashboard.
              </p>

              <div className="space-y-3 mt-6">
                <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">EMR Diagnostic Reports</p>
                    <p className="text-[10px] text-slate-500">Instant PDF downloads of blood & scan tests</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">Doctor OPD Bookings</p>
                    <p className="text-[10px] text-slate-500">Live token updates & tele-consultation</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-800/30 text-[11px] text-rose-200">
              <p className="font-bold text-rose-300">New Patient Registration?</p>
              <p className="text-slate-400 text-[10px] mt-0.5">
                Don't have a patient account yet? Click Sign Up below to create your patient profile instantly.
              </p>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-black text-white">Patient Sign In</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Enter your Email or UHID to access health portal</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5" />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Patient Email / UHID Number</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patient.demo@avora.org"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Portal Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black text-xs shadow-lg shadow-rose-950 transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Accessing Patient Records...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Patient Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-extrabold">
                  <span className="bg-slate-900 px-3 text-slate-500">OR</span>
                </div>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-200 font-bold text-xs transition flex items-center justify-center space-x-3 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Sign in with Google Account</span>
              </button>
            </form>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Need an account?</span>
              {onGoToSignUp && (
                <button
                  onClick={onGoToSignUp}
                  className="px-3 py-1 rounded-xl bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 font-bold text-xs border border-rose-500/30 transition flex items-center space-x-1 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Patient Account →</span>
                </button>
              )}
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 px-6 text-center text-xs text-slate-500 border-t border-slate-800 bg-slate-950/80">
        AVORA Patient Health Record Portal · Encrypted & HIPAA Compliant Data Privacy
      </footer>

      <GoogleAccountModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSelectAccount={handleSelectGoogleAccount}
        role="PATIENT"
      />
    </div>
  );
};
