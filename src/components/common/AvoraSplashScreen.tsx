import React, { useEffect, useState } from 'react';
import { Activity, Sparkles, ShieldCheck, HeartPulse } from 'lucide-react';

interface AvoraSplashScreenProps {
  onComplete: () => void;
}

export const AvoraSplashScreen: React.FC<AvoraSplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing AVORA AI Telemetry...');

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 300);
          return 100;
        }
        const next = prev + 4;
        if (next === 24) setStatus('Connecting Encrypted Bio-Telemetry Mesh...');
        if (next === 52) setStatus('Syncing NABL & HIPAA Data Nodes...');
        if (next === 84) setStatus('AVORA Operating System Ready');
        return next;
      });
    }, 45);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <>
      <style>{`
        @keyframes ecgDraw {
          0% { stroke-dashoffset: 1200; }
          100% { stroke-dashoffset: -1200; }
        }
        @keyframes logoPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 25px rgba(2, 132, 199, 0.4)); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 50px rgba(2, 132, 199, 0.8)); }
        }
        .ecg-wave-line {
          stroke-dasharray: 1200;
          animation: ecgDraw 3.5s linear infinite;
        }
        .logo-glow-pulse { animation: logoPulse 2.5s ease-in-out infinite; }
      `}</style>

      <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 flex flex-col items-center justify-center p-6 text-white selection:bg-sky-500 overflow-hidden font-sans">
        
        {/* Ambient Radial Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.18)_0,transparent_70%)] pointer-events-none" />

        {/* Animated ECG Heartbeat Line */}
        <svg className="absolute w-full h-48 opacity-30 pointer-events-none" viewBox="0 0 1200 200" preserveAspectRatio="none">
          <path
            d="M 0,100 L 300,100 L 330,40 L 360,160 L 390,70 L 420,130 L 450,100 L 750,100 L 780,30 L 810,170 L 840,60 L 870,140 L 900,100 L 1200,100"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="4"
            className="ecg-wave-line"
          />
        </svg>

        {/* Central Logo Container */}
        <div className="relative z-10 flex flex-col items-center space-y-6 text-center max-w-md">
          
          {/* Logo Badge */}
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 via-sky-500 to-emerald-400 p-0.5 logo-glow-pulse shadow-2xl">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-sky-400 relative overflow-hidden">
                <Activity className="w-12 h-12 text-sky-400 animate-pulse" />
                <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
              </div>
            </div>
          </div>

          {/* Titles */}
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              <span>Enterprise Health Operating System</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">AVORA OS</h1>
            <p className="text-xs text-sky-200/80 font-medium mt-1">AI-Powered Clinical & Hospital Automation Platform</p>
          </div>

          {/* Loading Bar */}
          <div className="w-full space-y-2.5 pt-4">
            <div className="w-full h-2.5 rounded-full bg-slate-800 border border-slate-700/80 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-emerald-400 transition-all duration-150 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="truncate">{status}</span>
              <span className="font-bold text-sky-400">{progress}%</span>
            </div>
          </div>

          {/* Quick Enter Action */}
          <button
            onClick={onComplete}
            className="mt-4 px-6 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-400/30 font-extrabold text-xs transition duration-200 cursor-pointer flex items-center space-x-2"
          >
            <span>Enter Operating System →</span>
          </button>

        </div>

        {/* Footer info */}
        <div className="absolute bottom-6 text-[10px] font-mono text-slate-500 flex items-center space-x-3">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-400" /> HIPAA Compliant</span>
          <span>·</span>
          <span>NABL Certified</span>
          <span>·</span>
          <span>256-Bit Encrypted</span>
        </div>

      </div>
    </>
  );
};
