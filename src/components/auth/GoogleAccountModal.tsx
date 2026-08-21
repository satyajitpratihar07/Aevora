import React, { useState } from 'react';
import { X, UserCheck, Plus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../../types';

interface GoogleAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (email: string, name: string) => Promise<void>;
  role?: UserRole;
}

export const GoogleAccountModal: React.FC<GoogleAccountModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
  role = 'HOSPITAL_ADMIN'
}) => {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  if (!isOpen) return null;

  const defaultAccounts = [
    {
      name: 'Satyajit Pratihar',
      email: 'satyajitpratihar200@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      badge: 'Verified Google Account'
    },
    {
      name: 'Aevora Hospital Administrator',
      email: 'admin@aevorahospital.com',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
      badge: 'Verified Domain Account'
    }
  ];

  const handleSelect = async (email: string, name: string) => {
    try {
      setIsLoading(true);
      setSelectedEmail(email);
      await onSelectAccount(email, name);
      onClose();
    } catch (err) {
      console.error('Google Account select error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    const derivedName = customName.trim() || customEmail.split('@')[0].replace('.', ' ').toUpperCase();
    handleSelect(customEmail.trim(), derivedName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Google Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">Choose a Google Account</h3>
              <p className="text-[11px] font-medium text-slate-500">to continue to Aevora Operating System</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!showCustomInput ? (
            <>
              <p className="text-xs font-semibold text-slate-600">Select an account to register & sign in as <span className="font-extrabold text-sky-600">{role}</span>:</p>

              <div className="space-y-2.5">
                {defaultAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    disabled={isLoading}
                    onClick={() => handleSelect(acc.email, acc.name)}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 ${
                      selectedEmail === acc.email
                        ? 'bg-sky-50 border-sky-400 shadow-md ring-2 ring-sky-200'
                        : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-slate-50 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <img 
                        src={acc.avatar} 
                        alt={acc.name} 
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0" 
                      />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-slate-900 truncate">{acc.name}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 truncate">{acc.email}</p>
                      </div>
                    </div>
                    {selectedEmail === acc.email ? (
                      <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0">
                        <UserCheck className="w-3 h-3" />
                      </div>
                    ) : (
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                ))}

                <button
                  onClick={() => setShowCustomInput(true)}
                  className="w-full p-3.5 rounded-2xl border border-dashed border-slate-300 hover:border-sky-400 bg-slate-50/50 hover:bg-sky-50/40 text-left flex items-center space-x-3 transition"
                >
                  <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">Use another Google account</span>
                    <p className="text-[10px] text-slate-500">Enter custom @gmail.com email</p>
                  </div>
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900">Enter Your Google Account Credentials</h4>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="text-[11px] font-bold text-sky-600 hover:underline"
                >
                  ← Back to account list
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Google Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Satyajit Pratihar"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !customEmail.trim()}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-extrabold text-xs rounded-xl shadow-md transition"
              >
                {isLoading ? 'Registering Google Account...' : 'Continue & Complete Sign In'}
              </button>
            </form>
          )}
        </div>

        {/* Footer Disclaimer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 text-center font-medium">
          Protected by Google OAuth 2.0 & Aevora HIPAA Certified Security Standard.
        </div>
      </div>
    </div>
  );
};
