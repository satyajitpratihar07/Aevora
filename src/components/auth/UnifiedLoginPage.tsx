import React, { useState } from 'react';
import {
  Shield,
  Stethoscope,
  HeartPulse,
  Cpu,
  Heart,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  RefreshCw,
  User,
  UserPlus,
  CheckCircle2,
  Activity,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { UserRole } from '../../types/index.js';

interface UnifiedLoginPageProps {
  onSuccessLogin?: () => void;
}

type AuthMode = 'SIGN_IN' | 'SIGN_UP';

const ROLES = [
  {
    role: 'HOSPITAL_ADMIN' as UserRole,
    label: 'Hospital Admin',
    badge: 'Executive Control',
    icon: Shield,
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    accent: 'from-blue-600 to-blue-500',
    demo: { email: 'admin@hospital.org', password: 'admin123' },
    features: ['Staff & HR Management', 'Bed Occupancy Matrix', 'Financial Billing & Analytics'],
  },
  {
    role: 'DOCTOR' as UserRole,
    label: 'Doctor Portal',
    badge: 'Clinical Workspace',
    icon: Stethoscope,
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    accent: 'from-violet-600 to-purple-500',
    demo: { email: 'doctor@hospital.org', password: 'doctor123' },
    features: ['Patient EMR & Records', 'Digital Prescriptions', 'AI Consult Notes'],
  },
  {
    role: 'NURSE' as UserRole,
    label: 'Nurse Station',
    badge: 'Inpatient Care',
    icon: HeartPulse,
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    accent: 'from-emerald-600 to-teal-500',
    demo: { email: 'nurse@hospital.org', password: 'nurse123' },
    features: ['MAR Medicine Checklist', 'Patient Vitals Telemetry', 'Shift Duty Roster'],
  },
  {
    role: 'RECEPTIONIST' as UserRole,
    label: 'Patient Portal',
    badge: 'Personal Health Record',
    icon: Heart,
    color: '#e11d48',
    bg: '#fff1f2',
    border: '#fecdd3',
    accent: 'from-rose-600 to-pink-500',
    demo: { email: 'patient@gmail.com', password: 'patient123' },
    features: ['Appointments & History', 'Prescriptions & Labs', 'Digital Health Card'],
  },
  {
    role: 'TECHNICAL_STAFF' as UserRole,
    label: 'Tech Operations',
    badge: 'IT Infrastructure',
    icon: Cpu,
    color: '#0891b2',
    bg: '#ecfeff',
    border: '#a5f3fc',
    accent: 'from-cyan-600 to-sky-500',
    demo: { email: 'tech@hospital.org', password: 'tech123' },
    features: ['Biomedical Device Mesh', 'Server & API Diagnostics', 'Maintenance Tickets'],
  },
] as const;

export const UnifiedLoginPage: React.FC<UnifiedLoginPageProps> = ({ onSuccessLogin }) => {
  const { login, signup, loginWithGoogle, loginWithFirebaseEmail, signupWithFirebaseEmail } = useAuth();

  const [selectedRoleIdx, setSelectedRoleIdx] = useState(0);
  const [authMode, setAuthMode] = useState<AuthMode>('SIGN_IN');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(ROLES[0].demo.email);
  const [password, setPassword] = useState(ROLES[0].demo.password);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const currentRole = ROLES[selectedRoleIdx];

  const handleRoleSelect = (idx: number) => {
    setSelectedRoleIdx(idx);
    setEmail(ROLES[idx].demo.email);
    setPassword(ROLES[idx].demo.password);
    setError('');
    setSuccessMsg('');
  };

  const handleModeSwitch = (mode: AuthMode) => {
    setAuthMode(mode);
    setError('');
    setSuccessMsg('');
    setFullName('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!password) { setError('Please enter your password.'); return; }

    if (authMode === 'SIGN_UP') {
      if (!fullName.trim()) { setError('Please enter your full name.'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    }

    setError('');
    setLoading(true);

    try {
      if (authMode === 'SIGN_UP') {
        try {
          await signupWithFirebaseEmail(email, password, currentRole.role, fullName);
        } catch {
          await signup({ email, name: fullName, role: currentRole.role });
        }
        setSuccessMsg('Account created! Signing you in...');
      } else {
        try {
          await loginWithFirebaseEmail(email, password, currentRole.role);
        } catch {
          await login(email, currentRole.role);
        }
      }
      onSuccessLogin?.();
    } catch {
      setError(
        authMode === 'SIGN_UP'
          ? 'Registration failed. This email may already be in use.'
          : 'Invalid credentials. Please check your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In: triggers Firebase popup directly — user sees their actual Google accounts
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const success = await loginWithGoogle(currentRole.role);
      if (success) {
        onSuccessLogin?.();
      } else {
        setError('Google sign-in was cancelled or failed. Please try again.');
      }
    } catch {
      setError('Google sign-in failed. Please try again or use email & password.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .ulp-root * { box-sizing: border-box; font-family: 'Inter', sans-serif; }

        @keyframes ulpFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ulpSlideRight {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes ulpPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes ulpSpin { to { transform: rotate(360deg); } }
        @keyframes ulpEcg {
          0% { stroke-dashoffset: 800; }
          100% { stroke-dashoffset: -800; }
        }

        .ulp-fadein { animation: ulpFadeIn 0.5s ease both; }
        .ulp-slide-right { animation: ulpSlideRight 0.35s ease both; }
        .ulp-pulse-icon { animation: ulpPulse 2.5s ease-in-out infinite; }
        .ulp-spin { animation: ulpSpin 1s linear infinite; }
        .ulp-ecg-stroke {
          stroke-dasharray: 800;
          animation: ulpEcg 4s linear infinite;
        }

        .ulp-input {
          width: 100%;
          padding: 11px 14px 11px 40px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #111827;
          background: #f9fafb;
          transition: all 0.2s;
          outline: none;
        }
        .ulp-input:focus {
          border-color: var(--role-color, #2563eb);
          background: #fff;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
        }
        .ulp-input::placeholder { color: #9ca3af; font-weight: 400; }

        .ulp-btn-primary {
          width: 100%;
          padding: 13px 20px;
          border-radius: 10px;
          border: none;
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }
        .ulp-btn-primary:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
        .ulp-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

        .ulp-btn-google {
          width: 100%;
          padding: 12px 20px;
          border-radius: 10px;
          border: 1.5px solid #e5e7eb;
          background: #fff;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .ulp-btn-google:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #d1d5db;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transform: translateY(-1px);
        }
        .ulp-btn-google:disabled { opacity: 0.6; cursor: not-allowed; }

        .ulp-role-tab {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1.5px solid #f3f4f6;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          background: #fff;
          width: 100%;
        }
        .ulp-role-tab:hover { border-color: #e5e7eb; background: #f9fafb; }
        .ulp-role-tab.active {
          background: var(--role-bg);
          border-color: var(--role-border);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
      `}</style>

      <div className="ulp-root" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f4ff 0%, #fff 50%, #f5feff 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* ── HEADER ───────────────────────────────────────────────────── */}
        <header style={{
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
            }}>
              <Activity size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#111827', letterSpacing: '-0.5px' }}>
                AVORA <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: 6, marginLeft: 4 }}>HMS</span>
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Enterprise Healthcare Operating System</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 600, color: '#059669',
              background: '#ecfdf5', border: '1px solid #a7f3d0',
              padding: '5px 12px', borderRadius: 20,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              System Online
            </span>
            <span style={{
              fontSize: 11, fontWeight: 600, color: '#6b7280',
              background: '#f3f4f6', border: '1px solid #e5e7eb',
              padding: '5px 12px', borderRadius: 20,
            }}>HIPAA Certified</span>
          </div>
        </header>

        {/* ── MAIN LAYOUT ──────────────────────────────────────────────── */}
        <main style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
        }}>
          <div className="ulp-fadein" style={{
            width: '100%',
            maxWidth: 980,
            background: '#fff',
            borderRadius: 20,
            boxShadow: '0 8px 40px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.05)',
            border: '1px solid #f0f0f0',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: '1fr 1.15fr',
          }}>

            {/* ── LEFT: ROLE SELECTOR PANEL ───────────────────────────── */}
            <div style={{
              background: '#f9fafb',
              borderRight: '1px solid #f0f0f0',
              padding: '40px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}>
              {/* Panel heading */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
                  Select Your Workspace
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1.3 }}>
                  Choose Your Role
                </h2>
                <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6, lineHeight: 1.6 }}>
                  Each role provides a dedicated workspace with specialized clinical tools.
                </p>
              </div>

              {/* Role tabs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ROLES.map((r, idx) => {
                  const Icon = r.icon;
                  const active = selectedRoleIdx === idx;
                  return (
                    <button
                      key={r.role}
                      className={`ulp-role-tab${active ? ' active' : ''}`}
                      style={{
                        '--role-bg': r.bg,
                        '--role-border': r.border,
                      } as React.CSSProperties}
                      onClick={() => handleRoleSelect(idx)}
                    >
                      <div style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        background: active ? r.color : '#f3f4f6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}>
                        <Icon size={18} color={active ? '#fff' : r.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: active ? r.color : '#374151' }}>{r.label}</div>
                        <div style={{ fontSize: 11, color: active ? r.color : '#9ca3af', fontWeight: 500 }}>{r.badge}</div>
                      </div>
                      <ChevronRight size={16} color={active ? r.color : '#d1d5db'} />
                    </button>
                  );
                })}
              </div>

              {/* Role features preview */}
              <div style={{
                background: currentRole.bg,
                border: `1px solid ${currentRole.border}`,
                borderRadius: 12,
                padding: '16px 18px',
                marginTop: 'auto',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: currentRole.color, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {currentRole.label} — Key Features
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {currentRole.features.map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <CheckCircle2 size={13} color={currentRole.color} />
                      <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT: FORM PANEL ───────────────────────────────────── */}
            <div
              className="ulp-slide-right"
              key={`${selectedRoleIdx}-${authMode}`}
              style={{
                padding: '40px 36px',
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
                '--role-color': currentRole.color,
              } as React.CSSProperties}
            >
              {/* Form header */}
              <div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: currentRole.bg, border: `1px solid ${currentRole.border}`,
                  borderRadius: 20, padding: '4px 12px', marginBottom: 12,
                }}>
                  {React.createElement(currentRole.icon, { size: 13, color: currentRole.color })}
                  <span style={{ fontSize: 11, fontWeight: 700, color: currentRole.color }}>{currentRole.badge}</span>
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>
                  {authMode === 'SIGN_IN' ? `Sign in to ${currentRole.label}` : `Create ${currentRole.label} Account`}
                </h3>
                <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
                  {authMode === 'SIGN_IN'
                    ? 'Enter your credentials or use Google to access your workspace.'
                    : 'Register your new account to access this portal.'}
                </p>
              </div>

              {/* Sign In / Sign Up toggle */}
              <div style={{
                display: 'flex',
                background: '#f3f4f6',
                borderRadius: 10,
                padding: 4,
                gap: 4,
              }}>
                {(['SIGN_IN', 'SIGN_UP'] as AuthMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleModeSwitch(mode)}
                    style={{
                      flex: 1, padding: '9px 12px', borderRadius: 7, border: 'none',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      background: authMode === mode ? '#fff' : 'transparent',
                      color: authMode === mode ? currentRole.color : '#9ca3af',
                      boxShadow: authMode === mode ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                    }}
                  >
                    {mode === 'SIGN_IN' ? <><User size={14} /> Sign In</> : <><UserPlus size={14} /> Sign Up</>}
                  </button>
                ))}
              </div>

              {/* Error / Success messages */}
              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: '#fff1f2', border: '1px solid #fecdd3',
                  borderRadius: 10, padding: '12px 14px',
                }}>
                  <AlertCircle size={15} color="#e11d48" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#be123c', fontWeight: 600 }}>{error}</span>
                </div>
              )}
              {successMsg && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: '#ecfdf5', border: '1px solid #a7f3d0',
                  borderRadius: 10, padding: '12px 14px',
                }}>
                  <CheckCircle2 size={15} color="#059669" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#047857', fontWeight: 600 }}>{successMsg}</span>
                </div>
              )}

              {/* ── FORM ─────────────────────────────────────────────── */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Full Name — sign up only */}
                {authMode === 'SIGN_UP' && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={15} color="#9ca3af" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="Dr. John Smith"
                        className="ulp-input"
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} color="#9ca3af" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="user@hospital.org"
                      className="ulp-input"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="#9ca3af" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="ulp-input"
                      style={{ paddingRight: 42 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      {showPassword ? <EyeOff size={15} color="#9ca3af" /> : <Eye size={15} color="#9ca3af" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password — sign up only */}
                {authMode === 'SIGN_UP' && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Confirm Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={15} color="#9ca3af" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="ulp-input"
                      />
                    </div>
                  </div>
                )}

                {/* Forgot Password link — sign in only */}
                {authMode === 'SIGN_IN' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <a href="#" style={{ fontSize: 12, fontWeight: 600, color: currentRole.color, textDecoration: 'none' }}>
                      Forgot Password?
                    </a>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="ulp-btn-primary"
                  style={{ background: `linear-gradient(135deg, ${currentRole.color}, ${currentRole.color}dd)` }}
                >
                  {loading ? (
                    <><RefreshCw size={15} className="ulp-spin" /> Processing...</>
                  ) : (
                    <>{authMode === 'SIGN_IN' ? 'Sign In' : 'Create Account'} <ArrowRight size={15} /></>
                  )}
                </button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
                  <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>or</span>
                  <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
                </div>

                {/* Google Sign-In button — triggers real Firebase Google popup */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading || googleLoading}
                  className="ulp-btn-google"
                >
                  {googleLoading ? (
                    <><RefreshCw size={15} className="ulp-spin" /> Connecting to Google...</>
                  ) : (
                    <>
                      {/* Official Google G Logo */}
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>
              </form>

              {/* Demo quick-fill notice */}
              <div style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <div style={{ flexShrink: 0, fontSize: 16 }}>💡</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>Demo Credentials Pre-filled</div>
                  <div style={{ fontSize: 11, color: '#78350f' }}>
                    Email: <strong>{currentRole.demo.email}</strong> · Password: <strong>{currentRole.demo.password}</strong>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>

        {/* ── FOOTER ───────────────────────────────────────────────────── */}
        <footer style={{
          background: '#fff',
          borderTop: '1px solid #f0f0f0',
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>
            © 2025 AVORA HMS · HIPAA & SOC 2 Certified Healthcare Platform
          </span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy Policy', 'Terms of Use', 'Support'].map(link => (
              <a key={link} href="#" style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none', fontWeight: 500 }}>
                {link}
              </a>
            ))}
          </div>
        </footer>

      </div>
    </>
  );
};
