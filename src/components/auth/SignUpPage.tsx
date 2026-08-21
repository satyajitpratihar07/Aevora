import React, { useState } from 'react';
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Heart, 
  Stethoscope, 
  Shield, 
  HeartPulse, 
  Cpu 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { UserRole } from '../../types/index.js';
import { GoogleAccountModal } from './GoogleAccountModal.js';

interface SignUpPageProps {
  onBackToLogin: () => void;
  onSuccessSignUp: () => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onBackToLogin, onSuccessSignUp }) => {
  const { signupWithFirebaseEmail, signup, loginWithGoogle } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('PATIENT');
  const [hospitalName, setHospitalName] = useState('AVORA Central Hospital');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required registration fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      try {
        await signupWithFirebaseEmail(email, password, role, name);
      } catch {
        await signup({
          name,
          email,
          role,
          organizationName: hospitalName
        });
      }
      onSuccessSignUp();
    } catch (err: any) {
      console.error(err);
      setError('Registration error. Please check your information and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');
    try {
      const success = await loginWithGoogle(role);
      if (success) {
        onSuccessSignUp();
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
    await loginWithGoogle(role, accountEmail, accountName);
    onSuccessSignUp();
  };

  const roles = [
    { id: 'PATIENT' as UserRole, label: 'Patient', icon: Heart, desc: 'Access your health records & lab tests' },
    { id: 'DOCTOR' as UserRole, label: 'Doctor', icon: Stethoscope, desc: 'Manage patient consultations & EMR' },
    { id: 'HOSPITAL_ADMIN' as UserRole, label: 'Hospital Admin', icon: Shield, desc: 'Full hospital & SaaS administration' },
    { id: 'NURSE' as UserRole, label: 'Staff Nurse', icon: HeartPulse, desc: 'Ward bed care & medicine MAR' },
    { id: 'TECHNICAL_STAFF' as UserRole, label: 'Tech Operations', icon: Cpu, desc: 'Bio-telemetry & IT infrastructure' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-sky-500 selection:text-white">
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-slate-800 bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onBackToLogin}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-500 to-emerald-400 p-0.5 shadow-md shadow-sky-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-sky-400">
              <UserPlus className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-xl text-white tracking-tight">AVORA OS</span>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/30">
                Account Registration
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Create your AVORA Healthcare Account</p>
          </div>
        </div>

        <button
          onClick={onBackToLogin}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition border border-slate-800"
        >
          ← Already Have an Account? Sign In
        </button>
      </header>

      {/* Form Card */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 py-8 w-full flex-1 flex flex-col justify-center">
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl shadow-sky-950/50 backdrop-blur-xl p-6 sm:p-8 space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-2xl font-black text-white">Create New Account</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Select your role and fill in registration details</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
              ⚠️ {error}
            </div>
          )}

          {/* Role Choice Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">Select Your Role</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {roles.map((r) => {
                const Icon = r.icon;
                const active = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`p-3 rounded-2xl border text-center transition duration-200 flex flex-col items-center justify-center space-y-1.5 cursor-pointer ${
                      active
                        ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-950'
                        : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-sky-400'}`} />
                    <span className="text-[11px] font-extrabold block leading-tight">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Satya Pratihar / Rahul Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@hospital.org"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Create Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
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

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Hospital / Facility Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="AVORA Central Hospital"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-black text-xs shadow-lg shadow-sky-950 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Registering Account to Firebase...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-extrabold">
                <span className="bg-slate-900 px-3 text-slate-500">OR REGISTER WITH GOOGLE</span>
              </div>
            </div>

            {/* Google Sign Up */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-200 font-bold text-xs transition flex items-center justify-center space-x-3 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google Account</span>
            </button>
          </form>

        </div>
      </main>

      <footer className="relative z-10 py-4 px-6 text-center text-xs text-slate-500 border-t border-slate-800 bg-slate-950/80">
        AVORA Hospital Platform · Encrypted Session Storage & Firestore Persistence
      </footer>

      <GoogleAccountModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSelectAccount={handleSelectGoogleAccount}
        role={role}
      />
    </div>
  );
};
