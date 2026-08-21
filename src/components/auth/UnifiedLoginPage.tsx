import React, { useState, useRef, useEffect } from 'react';
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
  X,
  ArrowLeft,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { UserRole } from '../../types/index.js';
import { GoogleAccountModal } from './GoogleAccountModal.js';

interface UnifiedLoginPageProps {
  onSuccessLogin?: () => void;
}

type AuthMode = 'SIGN_IN' | 'SIGN_UP';
type PageView = 'LOGIN' | 'OTP_VERIFY' | 'FORGOT_EMAIL' | 'FORGOT_OTP' | 'RESET_PASSWORD';

// API base: in dev use localhost:3000, in prod use same origin
const API_BASE = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? ''  // Same origin in production (Vercel)
  : 'http://localhost:3000';

const ROLES = [
  {
    role: 'HOSPITAL_ADMIN' as UserRole,
    label: 'Hospital Admin',
    badge: 'Executive Control',
    icon: Shield,
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
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
    demo: { email: 'tech@hospital.org', password: 'tech123' },
    features: ['Biomedical Device Mesh', 'Server & API Diagnostics', 'Maintenance Tickets'],
  },
] as const;

/* ─────────────────────────────────────────────────────────────────
   OTP INPUT COMPONENT — 6 individual digit boxes
───────────────────────────────────────────────────────────────── */
const OtpInput: React.FC<{ value: string; onChange: (v: string) => void; color: string }> = ({ value, onChange, color }) => {
  // Single ref holding an array of 6 input elements — avoids hook-in-loop violation
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.padEnd(6, ' ').split('').slice(0, 6);

  const focusAt = (idx: number) => {
    if (idx >= 0 && idx < 6) inputRefs.current[idx]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newDigits = [...digits];
      if (newDigits[idx].trim() !== '') {
        newDigits[idx] = ' ';
      } else if (idx > 0) {
        newDigits[idx - 1] = ' ';
        focusAt(idx - 1);
      }
      onChange(newDigits.join('').replace(/ /g, ''));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusAt(idx - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusAt(idx + 1);
    }
  };

  const handleInput = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) return;
    const newDigits = [...digits];
    // Support paste of full OTP
    if (raw.length > 1) {
      const pasted = raw.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || ' ';
      }
      onChange(newDigits.join('').replace(/ /g, ''));
      focusAt(Math.min(pasted.length, 5));
      return;
    }
    newDigits[idx] = raw[0];
    onChange(newDigits.join('').replace(/ /g, ''));
    if (idx < 5) focusAt(idx + 1);
  };

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
      {digits.map((d, idx) => {
        const filled = d.trim() !== '';
        return (
          <input
            key={idx}
            ref={el => { inputRefs.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={filled ? d : ''}
            onChange={e => handleInput(idx, e)}
            onKeyDown={e => handleKeyDown(idx, e)}
            onFocus={e => e.target.select()}
            autoComplete="one-time-code"
            style={{
              width: 48,
              height: 56,
              textAlign: 'center',
              fontSize: 24,
              fontWeight: 800,
              borderRadius: 12,
              border: filled ? `2.5px solid ${color}` : '1.5px solid #e5e7eb',
              background: filled ? `${color}12` : '#f9fafb',
              color: filled ? color : '#374151',
              outline: 'none',
              transition: 'all 0.15s',
              fontFamily: 'monospace',
              cursor: 'text',
              boxShadow: filled ? `0 0 0 3px ${color}20` : 'none',
            }}
          />
        );
      })}
    </div>
  );
};


/* ─────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────── */
export const UnifiedLoginPage: React.FC<UnifiedLoginPageProps> = ({ onSuccessLogin }) => {
  const { login, signup, loginWithGoogle, loginWithFirebaseEmail, signupWithFirebaseEmail } = useAuth();

  const [selectedRoleIdx, setSelectedRoleIdx] = useState(0);
  const [authMode, setAuthMode] = useState<AuthMode>('SIGN_IN');
  const [pageView, setPageView] = useState<PageView>('LOGIN');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(ROLES[0].demo.email);
  const [password, setPassword] = useState(ROLES[0].demo.password);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP state
  const [otpCode, setOtpCode] = useState('');
  const [otpPurpose, setOtpPurpose] = useState<'signup' | 'forgot' | 'login'>('signup');
  const [otpTimer, setOtpTimer] = useState(0);
  const [pendingSignupData, setPendingSignupData] = useState<{ email: string; password: string; role: UserRole; name: string } | null>(null);
  const [pendingLoginData, setPendingLoginData] = useState<{ email: string; password: string } | null>(null);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [fallbackOtp, setFallbackOtp] = useState(''); // shown if SMTP fails in dev

  const currentRole = ROLES[selectedRoleIdx];

  // OTP countdown timer
  useEffect(() => {
    if (otpTimer <= 0) return;
    const t = setInterval(() => setOtpTimer(v => v - 1), 1000);
    return () => clearInterval(t);
  }, [otpTimer]);

  const clearMessages = () => { setError(''); setSuccessMsg(''); };

  const handleRoleSelect = (idx: number) => {
    setSelectedRoleIdx(idx);
    setEmail(ROLES[idx].demo.email);
    setPassword(ROLES[idx].demo.password);
    clearMessages();
    setOtpCode('');
  };

  const handleModeSwitch = (mode: AuthMode) => {
    setAuthMode(mode);
    clearMessages();
    setFullName('');
    setConfirmPassword('');
    setOtpCode('');
    setFallbackOtp('');
  };

  /* ── SEND OTP via server ─────────────────────────────── */
  const sendOtp = async (targetEmail: string, name: string, purpose: string): Promise<{ fallbackOtp?: string }> => {
    const res = await fetch(`${API_BASE}/api/v1/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetEmail, name, purpose }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to send OTP');
    return { fallbackOtp: data.fallbackOtp }; // present when SMTP fails in dev
  };

  /* ── VERIFY OTP via server ───────────────────────────── */
  const verifyOtp = async (targetEmail: string, code: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/v1/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetEmail, otpCode: code }),
    });
    const data = await res.json();
    if (!data.success || !data.verified) throw new Error(data.message || 'Invalid OTP code');
  };

  /* ── SIGN UP SUBMIT: Send OTP via SMTP ── */
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    clearMessages();
    setLoading(true);
    try {
      // Send SMTP OTP code
      await sendOtp(email, fullName, 'Account Registration');
      setPendingSignupData({ email, password, role: currentRole.role, name: fullName });
      setOtpPurpose('signup');
      setOtpTimer(60);
      setSuccessMsg(`A 6-digit verification code has been sent to ${email}`);
      setPageView('OTP_VERIFY');
    } catch (err: any) {
      console.error('SMTP signup OTP send failure:', err);
      setError(err.message || 'Failed to send verification code. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── SIGN IN SUBMIT: Send OTP via SMTP ── */
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!password) { setError('Please enter your password.'); return; }

    clearMessages();
    setLoading(true);
    try {
      // Send SMTP OTP code
      await sendOtp(email, email.split('@')[0], 'Account Login Verification');
      setPendingLoginData({ email, password });
      setOtpPurpose('login');
      setOtpTimer(60);
      setSuccessMsg(`A security code has been sent to ${email}`);
      setPageView('OTP_VERIFY');
    } catch (err: any) {
      console.error('SMTP Signin OTP send failure:', err);
      setError(err.message || 'Failed to send secure verification code. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── VERIFY OTP SUBMIT FOR ALL PURPOSES ── */
  const handleOtpVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    clearMessages();
    setLoading(true);
    try {
      const targetEmail = otpPurpose === 'login'
        ? pendingLoginData?.email
        : (otpPurpose === 'signup' ? pendingSignupData?.email : forgotEmail);

      if (!targetEmail) {
        throw new Error('Email context missing. Please try signing in again.');
      }

      // Verify OTP with Express server via SMTP verify endpoint
      await verifyOtp(targetEmail, otpCode);

      if (otpPurpose === 'login') {
        const creds = pendingLoginData;
        if (!creds) throw new Error('Session credentials missing.');
        try {
          await loginWithFirebaseEmail(creds.email, creds.password, currentRole.role);
        } catch {
          await login(creds.email, currentRole.role);
        }
        setSuccessMsg('OTP verified successfully! Redirecting...');
        setTimeout(() => onSuccessLogin?.(), 1000);
      } else if (otpPurpose === 'signup') {
        const data = pendingSignupData;
        if (!data) throw new Error('Registration data missing.');
        try {
          await signupWithFirebaseEmail(data.email, data.password, currentRole.role, data.name);
        } catch {
          await signup(data.email, data.password, currentRole.role, data.name);
        }
        setSuccessMsg('Email successfully verified! Redirecting to workspace...');
        setTimeout(() => onSuccessLogin?.(), 1000);
      } else if (otpPurpose === 'forgot') {
        setPageView('RESET_PASSWORD');
      }
    } catch (err: any) {
      console.error('OTP verification failure:', err);
      setError(err.message || 'Invalid or expired verification code. Please check your inbox and try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── RESEND OTP CODE ── */
  const handleResendVerificationCode = async () => {
    const targetEmail = otpPurpose === 'login'
      ? pendingLoginData?.email
      : (otpPurpose === 'signup' ? pendingSignupData?.email : forgotEmail);

    if (!targetEmail) return;
    clearMessages();
    setLoading(true);
    try {
      const name = pendingSignupData?.name || targetEmail.split('@')[0];
      await sendOtp(targetEmail, name, otpPurpose === 'login' ? 'Login Verification' : 'Account Registration');
      setOtpTimer(60);
      setSuccessMsg('A new verification code has been sent to your email.');
    } catch (err: any) {
      setError('Failed to resend verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── FORGOT PASSWORD SUBMIT: Send OTP via SMTP ── */
  const handleForgotSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) { setError('Please enter your email address.'); return; }

    clearMessages();
    setLoading(true);
    try {
      await sendOtp(forgotEmail, forgotEmail.split('@')[0], 'Password Recovery Verification');
      setOtpPurpose('forgot');
      setOtpTimer(60);
      setSuccessMsg(`A secure recovery code has been sent to ${forgotEmail}`);
      setPageView('OTP_VERIFY');
    } catch (err: any) {
      console.error('SMTP Forgot password OTP send failure:', err);
      setError(err.message || 'Failed to send password recovery code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── RESET PASSWORD SUBMIT ── */
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) { setError('Passwords do not match.'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }

    clearMessages();
    setLoading(true);
    try {
      setSuccessMsg('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        setPageView('LOGIN');
        setAuthMode('SIGN_IN');
        setEmail(forgotEmail);
        setPassword(newPassword);
        clearMessages();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  /* ── GOOGLE SIGN-IN ──────────────────────────────────── */
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    clearMessages();
    setFallbackOtp('');
    try {
      const success = await loginWithGoogle(currentRole.role);
      if (success) {
        onSuccessLogin?.();
      } else {
        // Direct popup couldn't retrieve account — open Google Account Modal
        setIsGoogleModalOpen(true);
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request'
      ) {
        setError('');
      } else {
        // For API key or popup blocked errors, open the Google Account Modal
        setIsGoogleModalOpen(true);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  /* ══════════════════════════════════════════════════════
     RENDER HELPERS
  ══════════════════════════════════════════════════════ */
  const renderMessages = () => (
    <>
      {error && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, padding: '12px 14px' }}>
          <AlertCircle size={15} color="#e11d48" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 13, color: '#be123c', fontWeight: 600 }}>{error}</span>
        </div>
      )}
      {successMsg && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 10, padding: '12px 14px' }}>
          <CheckCircle2 size={15} color="#059669" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 13, color: '#047857', fontWeight: 600 }}>{successMsg}</span>
        </div>
      )}
    </>
  );

  /* ── 1. REAL SMTP OTP VERIFICATION PANEL ─────── */
  const renderOtpPanel = () => {
    const targetEmail = otpPurpose === 'login'
      ? pendingLoginData?.email
      : (otpPurpose === 'signup' ? pendingSignupData?.email : forgotEmail);

    const handleBackToMode = () => {
      setPageView('LOGIN');
      clearMessages();
      setOtpCode('');
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header */}
        <div>
          <button onClick={handleBackToMode} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 13, fontWeight: 600, marginBottom: 16, padding: 0 }}>
            <ArrowLeft size={15} /> Back to Login
          </button>
          <div style={{ width: 56, height: 56, background: `${currentRole.color}15`, border: `1.5px solid ${currentRole.border}`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <ShieldCheck size={26} color={currentRole.color} />
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>
            Enter Security Code
          </h3>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 8, lineHeight: 1.7 }}>
            We sent a 6-digit security verification code to:<br />
            <strong style={{ color: '#111827' }}>{targetEmail}</strong>
          </p>
        </div>

        {renderMessages()}

        <form onSubmit={handleOtpVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ margin: '10px 0 15px 0' }}>
            <OtpInput value={otpCode} onChange={setOtpCode} color={currentRole.color} />
          </div>

          {/* Verify button */}
          <button type="submit" disabled={loading || otpCode.length < 6} style={{
            width: '100%', padding: '13px 20px', borderRadius: 10, border: 'none',
            fontSize: 14, fontWeight: 700, color: '#fff',
            cursor: loading || otpCode.length < 6 ? 'not-allowed' : 'pointer',
            background: otpCode.length === 6 ? `linear-gradient(135deg, ${currentRole.color}, ${currentRole.color}dd)` : '#cbd5e1',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s',
          }}>
            {loading ? <><RefreshCw size={15} style={{ animation: 'ulpSpin 1s linear infinite' }} /> Verifying...</> : <><CheckCircle2 size={15} /> Verify & Authenticate</>}
          </button>

          {/* Resend status */}
          <div style={{ textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
            {otpTimer > 0 ? (
              <>Resend code in <strong style={{ color: currentRole.color }}>{otpTimer}s</strong></>
            ) : (
              <button type="button" onClick={handleResendVerificationCode} style={{ background: 'none', border: 'none', cursor: 'pointer', color: currentRole.color, fontWeight: 700, fontSize: 13, textDecoration: 'underline' }}>
                Resend Code
              </button>
            )}
          </div>
        </form>
      </div>
    );
  };

  /* ── 2. FORGOT PASSWORD EMAIL ENTRY ──────────────────── */
  const renderForgotEmail = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <button onClick={() => { setPageView('LOGIN'); clearMessages(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 13, fontWeight: 600, marginBottom: 16, padding: 0 }}>
          <ArrowLeft size={15} /> Back to Sign In
        </button>
        <div style={{ width: 56, height: 56, background: '#fef3c7', border: '1.5px solid #fde68a', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <KeyRound size={26} color="#d97706" />
        </div>
        <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>Forgot Password?</h3>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 8, lineHeight: 1.7 }}>
          Enter your registered email address. We will send a secure password reset link to your email.
        </p>
      </div>

      {renderMessages()}

      <form onSubmit={handleForgotSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Registered Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={15} color="#9ca3af" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="email"
              required
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
              placeholder="user@hospital.org"
              className="ulp-input"
            />
          </div>
        </div>

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '13px 20px', borderRadius: 10, border: 'none',
          fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer',
          background: 'linear-gradient(135deg, #d97706, #b45309)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s',
        }}>
          {loading ? <><RefreshCw size={15} style={{ animation: 'ulpSpin 1s linear infinite' }} /> Sending Link...</> : <>Send Password Reset Link <ArrowRight size={15} /></>}
        </button>
      </form>
    </div>
  );

  /* ── 3. RESET PASSWORD ENTRY ─────────────────────────── */
  const renderResetPassword = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ width: 56, height: 56, background: '#ecfdf5', border: '1.5px solid #a7f3d0', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <CheckCircle2 size={26} color="#059669" />
        </div>
        <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>Set New Password</h3>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 8, lineHeight: 1.7 }}>
          Identity verified for <strong style={{ color: '#111827' }}>{forgotEmail}</strong>.<br />
          Create a strong new password.
        </p>
      </div>

      {renderMessages()}

      <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>New Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={15} color="#9ca3af" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type={showNewPassword ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="ulp-input"
              style={{ paddingRight: 42 }}
            />
            <button type="button" onClick={() => setShowNewPassword(v => !v)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              {showNewPassword ? <EyeOff size={15} color="#9ca3af" /> : <Eye size={15} color="#9ca3af" />}
            </button>
          </div>
          {/* Password strength bar */}
          {newPassword.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ height: 4, borderRadius: 4, background: '#f0f0f0', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4, transition: 'all 0.3s',
                  width: newPassword.length < 6 ? '25%' : newPassword.length < 8 ? '50%' : newPassword.length < 12 ? '75%' : '100%',
                  background: newPassword.length < 6 ? '#ef4444' : newPassword.length < 8 ? '#f59e0b' : newPassword.length < 12 ? '#3b82f6' : '#10b981',
                }} />
              </div>
              <span style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, display: 'block' }}>
                {newPassword.length < 6 ? 'Too short' : newPassword.length < 8 ? 'Weak' : newPassword.length < 12 ? 'Good' : 'Strong'}
              </span>
            </div>
          )}
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Confirm New Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={15} color="#9ca3af" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmNewPassword}
              onChange={e => setConfirmNewPassword(e.target.value)}
              placeholder="Repeat new password"
              className="ulp-input"
              style={{ paddingRight: 42, borderColor: confirmNewPassword && confirmNewPassword !== newPassword ? '#ef4444' : undefined }}
            />
            <button type="button" onClick={() => setShowConfirmPassword(v => !v)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              {showConfirmPassword ? <EyeOff size={15} color="#9ca3af" /> : <Eye size={15} color="#9ca3af" />}
            </button>
          </div>
          {confirmNewPassword && confirmNewPassword !== newPassword && (
            <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>Passwords do not match</p>
          )}
        </div>

        <button type="submit" disabled={loading || newPassword !== confirmNewPassword || newPassword.length < 6} style={{
          width: '100%', padding: '13px 20px', borderRadius: 10, border: 'none',
          fontSize: 14, fontWeight: 700, color: '#fff',
          cursor: loading || newPassword !== confirmNewPassword || newPassword.length < 6 ? 'not-allowed' : 'pointer',
          background: newPassword === confirmNewPassword && newPassword.length >= 6 ? 'linear-gradient(135deg, #059669, #047857)' : '#d1d5db',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s',
        }}>
          {loading ? <><RefreshCw size={15} style={{ animation: 'ulpSpin 1s linear infinite' }} /> Updating Password...</> : <>Update Password <CheckCircle2 size={15} /></>}
        </button>
      </form>
    </div>
  );

  /* ── 4. MAIN LOGIN / SIGN-UP FORM ────────────────────── */
  const renderLoginForm = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Form header */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: currentRole.bg, border: `1px solid ${currentRole.border}`, borderRadius: 20, padding: '4px 12px', marginBottom: 12 }}>
          {React.createElement(currentRole.icon, { size: 13, color: currentRole.color })}
          <span style={{ fontSize: 11, fontWeight: 700, color: currentRole.color }}>{currentRole.badge}</span>
        </div>
        <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>
          {authMode === 'SIGN_IN' ? `Sign in to ${currentRole.label}` : `Create ${currentRole.label} Account`}
        </h3>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
          {authMode === 'SIGN_IN'
            ? 'Enter your credentials or use Google to access your workspace.'
            : 'Register your account — a verification code will be sent to your email.'}
        </p>
      </div>

      {/* Sign In / Sign Up toggle */}
      <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 10, padding: 4, gap: 4 }}>
        {(['SIGN_IN', 'SIGN_UP'] as AuthMode[]).map((mode) => (
          <button key={mode} type="button" onClick={() => handleModeSwitch(mode)} style={{
            flex: 1, padding: '9px 12px', borderRadius: 7, border: 'none',
            fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            background: authMode === mode ? '#fff' : 'transparent',
            color: authMode === mode ? currentRole.color : '#9ca3af',
            boxShadow: authMode === mode ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
          }}>
            {mode === 'SIGN_IN' ? <><User size={14} /> Sign In</> : <><UserPlus size={14} /> Sign Up</>}
          </button>
        ))}
      </div>

      {renderMessages()}

      {/* ── SIGN IN FORM ── */}
      {authMode === 'SIGN_IN' && (
        <form onSubmit={handleSignInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color="#9ca3af" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="user@hospital.org" className="ulp-input" />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="#9ca3af" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
              <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="ulp-input" style={{ paddingRight: 42 }} />
              <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {showPassword ? <EyeOff size={15} color="#9ca3af" /> : <Eye size={15} color="#9ca3af" />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => { setPageView('FORGOT_EMAIL'); setForgotEmail(email); clearMessages(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: currentRole.color, fontWeight: 600, fontSize: 13 }}>
              Forgot Password?
            </button>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px 20px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', background: `linear-gradient(135deg, ${currentRole.color}, ${currentRole.color}dd)`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s', opacity: loading ? 0.7 : 1 }}>
            {loading ? <><RefreshCw size={15} style={{ animation: 'ulpSpin 1s linear infinite' }} /> Signing In...</> : <>Sign In <ArrowRight size={15} /></>}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
            <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
          </div>

          <button type="button" onClick={handleGoogleSignIn} disabled={loading || googleLoading} style={{ width: '100%', padding: '12px 20px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.2s' }}>
            {googleLoading ? <><RefreshCw size={15} style={{ animation: 'ulpSpin 1s linear infinite' }} /> Connecting...</> : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continue with Google
              </>
            )}
          </button>
        </form>
      )}

      {/* ── SIGN UP FORM ── */}
      {authMode === 'SIGN_UP' && (
        <form onSubmit={handleSignUpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={15} color="#9ca3af" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Dr. John Smith" className="ulp-input" />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color="#9ca3af" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="user@hospital.org" className="ulp-input" />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="#9ca3af" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
              <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" className="ulp-input" style={{ paddingRight: 42 }} />
              <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {showPassword ? <EyeOff size={15} color="#9ca3af" /> : <Eye size={15} color="#9ca3af" />}
              </button>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="#9ca3af" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
              <input type={showConfirmPassword ? 'text' : 'password'} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" className="ulp-input" style={{ paddingRight: 42, borderColor: confirmPassword && confirmPassword !== password ? '#ef4444' : undefined }} />
              <button type="button" onClick={() => setShowConfirmPassword(v => !v)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {showConfirmPassword ? <EyeOff size={15} color="#9ca3af" /> : <Eye size={15} color="#9ca3af" />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>Passwords do not match</p>
            )}
          </div>

          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Mail size={13} />
            A 6-digit verification code will be sent to your email.
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px 20px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', background: `linear-gradient(135deg, ${currentRole.color}, ${currentRole.color}dd)`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s', opacity: loading ? 0.7 : 1 }}>
            {loading ? <><RefreshCw size={15} style={{ animation: 'ulpSpin 1s linear infinite' }} /> Sending Code...</> : <>Send Verification Code <ArrowRight size={15} /></>}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
            <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
          </div>

          <button type="button" onClick={handleGoogleSignIn} disabled={loading || googleLoading} style={{ width: '100%', padding: '12px 20px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.2s' }}>
            {googleLoading ? <><RefreshCw size={15} style={{ animation: 'ulpSpin 1s linear infinite' }} /> Connecting...</> : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Sign up with Google
              </>
            )}
          </button>
        </form>
      )}

      {/* Demo hint */}
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 15 }}>💡</span>
        <div style={{ fontSize: 11, color: '#78350f' }}>
          <strong>Demo:</strong> {currentRole.demo.email} / {currentRole.demo.password}
        </div>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════
     PAGE LAYOUT
  ══════════════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .ulp-root * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
        @keyframes ulpFadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ulpSlide { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes ulpSpin { to { transform: rotate(360deg); } }
        .ulp-fadein { animation: ulpFadeIn 0.5s ease both; }
        .ulp-slide { animation: ulpSlide 0.35s ease both; }
        .ulp-input {
          width: 100%; padding: 11px 14px 11px 40px;
          border: 1.5px solid #e5e7eb; border-radius: 10px;
          font-size: 14px; font-weight: 500; color: #111827;
          background: #f9fafb; transition: all 0.2s; outline: none;
          font-family: 'Inter', sans-serif;
        }
        .ulp-input:focus { border-color: #2563eb; background: #fff; box-shadow: 0 0 0 3px rgba(37,99,235,0.10); }
        .ulp-input::placeholder { color: #9ca3af; font-weight: 400; }
        .ulp-role-tab { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 12px; border: 1.5px solid #f3f4f6; cursor: pointer; transition: all 0.2s; text-align: left; background: #fff; width: 100%; }
        .ulp-role-tab:hover { border-color: #e5e7eb; background: #f9fafb; }
        .ulp-role-tab.active { background: var(--role-bg); border-color: var(--role-border); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
      `}</style>

      <div className="ulp-root" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #fff 50%, #f5feff 100%)', display: 'flex', flexDirection: 'column' }}>

        {/* Welcome Announcement Top Banner */}
        <div style={{ background: 'linear-gradient(90deg, #1e3a8a, #0369a1)', color: '#fff', padding: '10px 24px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, letterSpacing: '0.3px', textAlign: 'center' }}>
          <span style={{ background: '#0284c7', padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', fontSize: '9px', fontWeight: 800 }}>New Release</span>
          <span>Welcome to <strong>Aevora HMS v2.4</strong> — Fully integrated HIPAA-certified clinical workspace. Explore the updated Doctor Consult and Nursing MAR portals.</span>
        </div>

        {/* Header */}
        <header style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyBetween: 'space-between', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #2563eb, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}>
              <Activity size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#111827', letterSpacing: '-0.5px' }}>
                Aevora <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: 6, marginLeft: 4 }}>HMS</span>
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Enterprise Healthcare Operating System</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '5px 12px', borderRadius: 20 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              System Online
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '5px 12px', borderRadius: 20 }}>HIPAA Certified</span>
          </div>
        </header>

        {/* Main */}
        <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <div className="ulp-fadein" style={{
            width: '100%', maxWidth: 980,
            background: '#fff', borderRadius: 20,
            boxShadow: '0 8px 40px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.05)',
            border: '1px solid #f0f0f0', overflow: 'hidden',
            display: 'grid', gridTemplateColumns: '1fr 1.15fr',
            marginBottom: '40px'
          }}>
            {/* Left: Role Selector — always visible */}
            <div style={{ background: '#f9fafb', borderRight: '1px solid #f0f0f0', padding: '36px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Select Your Workspace</div>
                <h2 style={{ fontSize: 19, fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1.3 }}>Choose Your Role</h2>
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 5, lineHeight: 1.6 }}>Each role provides a dedicated workspace with specialized tools.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {ROLES.map((r, idx) => {
                  const Icon = r.icon;
                  const active = selectedRoleIdx === idx;
                  return (
                    <button key={r.role} className={`ulp-role-tab${active ? ' active' : ''}`}
                      style={{ '--role-bg': r.bg, '--role-border': r.border } as React.CSSProperties}
                      onClick={() => { handleRoleSelect(idx); if (pageView !== 'LOGIN') setPageView('LOGIN'); }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: active ? r.color : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                        <Icon size={17} color={active ? '#fff' : r.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: active ? r.color : '#374151' }}>{r.label}</div>
                        <div style={{ fontSize: 10, color: active ? r.color : '#9ca3af', fontWeight: 500 }}>{r.badge}</div>
                      </div>
                      <ChevronRight size={14} color={active ? r.color : '#d1d5db'} />
                    </button>
                  );
                })}
              </div>

              <div style={{ background: currentRole.bg, border: `1px solid ${currentRole.border}`, borderRadius: 12, padding: '14px 16px', marginTop: 'auto' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: currentRole.color, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{currentRole.label} — Features</div>
                {currentRole.features.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                    <CheckCircle2 size={12} color={currentRole.color} />
                    <span style={{ fontSize: 11, color: '#374151', fontWeight: 500 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Dynamic panel based on pageView */}
            <div className="ulp-slide" key={`${pageView}-${selectedRoleIdx}`} style={{ padding: '36px 36px', overflowY: 'auto', maxHeight: '85vh' }}>
              {pageView === 'LOGIN' && renderLoginForm()}
              {pageView === 'OTP_VERIFY' && renderOtpPanel()}
              {pageView === 'FORGOT_EMAIL' && renderForgotEmail()}
              {pageView === 'FORGOT_OTP' && renderOtpPanel()}
              {pageView === 'RESET_PASSWORD' && renderResetPassword()}
            </div>
          </div>

          {/* Platform Features Details Section */}
          <div style={{ maxWidth: 980, width: '100%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '24px 32px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 800, color: '#1e293b', marginBottom: 12, letterSpacing: '-0.2px' }}>
              About Aevora Intelligent Clinical Operating System
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
              <div>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', marginBottom: 4 }}>🤖 Google Gemini AI Core</h4>
                <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
                  Aevora natively integrates Gemini 2.0 to draft digital prescriptions, compile SOAP notes from voice recordings, and automate patient clinical journey tracking.
                </p>
              </div>
              <div>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: '#059669', marginBottom: 4 }}>🏢 Isolated Multi-Tenancy</h4>
                <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
                  Features state-of-the-art tenant isolation with custom white-label capabilities, dynamic branding customizer, and localized Indian currency formatting.
                </p>
              </div>
              <div>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', marginBottom: 4 }}>🩺 Integrated 32-Module Suite</h4>
                <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
                  Connects pathology labs, ward occupancy telemetry, pharmacy dispensing, outpatient booking, and emergency dispatch under a secure HIPAA dashboard.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer style={{ background: '#fff', borderTop: '1px solid #f0f0f0', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>© 2025 Aevora HMS · HIPAA & SOC 2 Certified Healthcare Platform</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy Policy', 'Terms of Use', 'Support'].map(link => (
              <a key={link} href="#" style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none', fontWeight: 500 }}>{link}</a>
            ))}
          </div>
        </footer>

        {/* Google Account Picker Modal */}
        <GoogleAccountModal
          isOpen={isGoogleModalOpen}
          onClose={() => setIsGoogleModalOpen(false)}
          role={currentRole.role}
          onSelectAccount={async (email, name) => {
            const ok = await loginWithGoogle(currentRole.role, email, name);
            if (ok) onSuccessLogin?.();
          }}
        />
      </div>
    </>
  );
};
