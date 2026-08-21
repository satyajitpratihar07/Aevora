import React, { useState } from 'react';
import { ShieldCheck, QrCode, Key, AlertCircle, CheckCircle2, X, Copy, RefreshCw, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'SETUP' | 'VERIFY' | 'CONFIRMED'>('SETUP');
  const [loading, setLoading] = useState(false);
  const [secretData, setSecretData] = useState<{
    secret: string;
    qrCodeUrl: string;
    recoveryCodes: string[];
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  if (!isOpen) return null;

  const handleGenerateSecret = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/auth/2fa/generate-secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email || 'user@aevora.org' }),
      });
      const data = await res.json();
      if (data.success) {
        setSecretData(data);
        setStep('VERIFY');
      } else {
        setError(data.message || 'Failed to generate 2FA secret.');
      }
    } catch (err: any) {
      setError('Network error generating TOTP secret.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.trim().length !== 6) {
      setError('Please enter a 6-digit TOTP code.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/auth/2fa/verify-enrollment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: secretData?.secret,
          token: verificationCode.trim(),
          email: user?.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('CONFIRMED');
      } else {
        setError(data.message || 'Invalid 6-digit verification code.');
      }
    } catch (err: any) {
      setError('Error verifying 2FA code.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Two-Factor Authentication (2FA)</h3>
              <p className="text-xs text-slate-500 font-medium">RFC 6238 Standard TOTP Authenticator Security</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-5 space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 'SETUP' && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto ring-4 ring-indigo-50/50">
                <Lock className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Protect Your Account with 2FA</h4>
                <p className="text-xs text-slate-600 font-normal mt-1 leading-relaxed">
                  Enhance your medical portal security by linking an authenticator app (Google Authenticator, Authy, Microsoft Authenticator, or Bitwarden).
                </p>
              </div>
              <button
                onClick={handleGenerateSecret}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                <span>Generate QR Code & Secret Key</span>
              </button>
            </div>
          )}

          {step === 'VERIFY' && secretData && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-xs font-bold text-slate-700">1. Scan QR Code using Authenticator App</p>
                <div className="inline-block p-3 bg-white rounded-2xl border-2 border-indigo-100 shadow-md">
                  <img src={secretData.qrCodeUrl} alt="2FA QR Code" className="w-44 h-44 mx-auto rounded-lg" />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Manual Setup Secret Key</p>
                  <p className="text-xs font-mono font-bold text-slate-800 truncate">{secretData.secret}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(secretData.secret)}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedKey ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <form onSubmit={handleVerifyEnrollment} className="space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  2. Enter 6-Digit Code from Authenticator App
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] text-xl font-mono py-2.5 rounded-xl border border-slate-300 font-black focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 focus:bg-white transition"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-200 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Verify Code & Enable 2FA</span>
                </button>
              </form>
            </div>
          )}

          {step === 'CONFIRMED' && secretData && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-4 ring-emerald-50/50">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">2FA Active & Protection Enabled!</h4>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Save your single-use recovery codes in a secure password manager.
                </p>
              </div>

              <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs space-y-2 border border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Emergency Recovery Codes</p>
                <div className="grid grid-cols-2 gap-2 text-left pt-1">
                  {secretData.recoveryCodes.map((code, idx) => (
                    <div key={idx} className="bg-slate-800 px-2.5 py-1 rounded-md text-emerald-400 font-bold text-center">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition cursor-pointer"
              >
                Close Security Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
