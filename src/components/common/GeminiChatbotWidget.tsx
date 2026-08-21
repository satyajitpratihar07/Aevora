import React from 'react';
import { Sparkles, Bot, Brain } from 'lucide-react';

interface Props {
  onClick: () => void;
}

export const GeminiChatbotWidget: React.FC<Props> = ({ onClick }) => {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {/* Tooltip Pill */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-bold shadow-lg border border-slate-700 backdrop-blur-md animate-bounce">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>Ask Gemini AI</span>
      </div>

      {/* Main Floating Pulse Button */}
      <button
        onClick={onClick}
        className="group relative w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 border-2 border-white/40 cursor-pointer"
        title="Open AVORA Gemini AI Clinical Assistant"
      >
        <Brain className="w-7 h-7 group-hover:rotate-12 transition-transform" />
        <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
      </button>
    </div>
  );
};