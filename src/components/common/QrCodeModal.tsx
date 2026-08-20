import React from 'react';
import { QrCode, X, ShieldCheck, Check, Copy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentData?: {
    patientName: string;
    appointmentNumber: string;
    doctorName: string;
    timeSlot: string;
    date: string;
    token: string;
  };
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  appointmentData,
}) => {
  const { organization } = useAuth();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const sampleToken = appointmentData?.token || 'qr-tok-apt001-sec782';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    JSON.stringify({
      org: organization?.code,
      token: sampleToken,
      type: 'APPOINTMENT_CHECKIN',
    })
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-center">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-700">
              Touchless Check-in QR
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-500 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-slate-50 bg-slate-100 rounded-xl inline-block mx-auto mb-4 border border-slate-200">
          <img
            src={qrUrl}
            alt="Appointment QR Code"
            className="w-44 h-44 rounded-lg mix-blend-multiply dark:mix-blend-normal"
          />
        </div>

        <div className="text-xs text-left space-y-1.5 bg-slate-50 bg-slate-100/60 p-3 rounded-xl mb-4 border border-slate-100 border-slate-200/50">
          <p className="font-semibold text-slate-700">
            {appointmentData?.patientName || 'Aarav Sharma'}
          </p>
          <p className="text-slate-500">
            Appointment: <span className="font-mono text-slate-700 text-slate-600">{appointmentData?.appointmentNumber || 'APT-2026-0819-01'}</span>
          </p>
          <p className="text-slate-500">
            Doctor: <span className="text-slate-700 text-slate-600">{appointmentData?.doctorName || 'Dr. Vikramaditya Singh, MD'}</span>
          </p>
          <p className="text-slate-500">
            Slot: <span className="text-slate-700 text-slate-600">{appointmentData?.timeSlot || '09:00 AM - 09:30 AM'}</span>
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-4 px-1">
          <span className="flex items-center space-x-1 text-emerald-600 text-emerald-600 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Short-Lived Cryptographic Token</span>
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 text-blue-600 hover:underline"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-slate-900 font-semibold text-xs transition shadow-xs"
        >
          Done & Close
        </button>
      </div>
    </div>
  );
};




