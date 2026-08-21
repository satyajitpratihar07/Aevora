import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Lightbulb,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({ isOpen, onClose }) => {
  const { organization, user } = useAuth();
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: `Hello ${user?.name || 'Doctor'}! I am **Aevora Assistant**, your certified clinical and hospital operations AI for ${organization?.name || 'Aevora Medical Centre'}. How can I assist you with clinical guidelines, ICU bed telemetry, pharmacy stock, or diagnostic interpretations today?`,
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input;
    setInput('');
    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg, time: userTime }]);
    setIsTyping(true);

    try {
      const chatHistory = messages.map(m => ({
        role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        content: m.text
      }));
      chatHistory.push({ role: 'user', content: userMsg });

      const res = await api.chatWithGemini(chatHistory, {
        hospitalName: organization?.name,
        role: user?.role
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.reply || 'Aevora Assistant is online. How can I assist you with clinical guidelines, bed occupancy, or patient care?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Aevora Assistant is active. Please ask your clinical or operational question.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const samplePrompts = [
    'Summarize current ICU bed occupancy and critical patient alerts',
    'Which medications are currently at low-stock threshold?',
    'What are first-line guidelines for Stage 2 Hypertension with Penicillin allergy?',
    'Explain recent laboratory turnaround time metrics',
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sky-400/30 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 border border-sky-400/40 flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white tracking-tight">Aevora Assistant</h3>
            <p className="text-[10px] text-sky-300 font-semibold flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Certified Clinical & Operational Hospital AI</span>
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/15 transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Safety Notice */}
      <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 flex items-start space-x-2 text-[11px] text-amber-900 font-medium">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
        <span>Assistive support only. All clinical treatment decisions require licensed physician verification.</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="flex items-start space-x-2 max-w-[90%]">
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-br-none font-medium'
                    : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">
                  {m.text}
                </div>
                <span className={`block text-[9px] mt-2 text-right ${m.sender === 'user' ? 'text-white/80' : 'text-slate-400'}`}>
                  {m.time}
                </span>
              </div>
              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <div className="w-7 h-7 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-bl-none flex items-center space-x-1.5 shadow-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts */}
      <div className="px-4 py-2.5 border-t border-slate-200 bg-white">
        <p className="text-[10px] uppercase font-extrabold text-slate-400 mb-2 flex items-center space-x-1 tracking-wider">
          <Lightbulb className="w-3 h-3 text-amber-500" />
          <span>Quick Prompts</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => setInput(prompt)}
              className="text-[10px] font-semibold text-slate-700 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 px-2.5 py-1.5 rounded-xl border border-slate-200 transition truncate max-w-[220px] text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="p-3.5 border-t border-slate-200 bg-white flex items-center space-x-2">
        <input
          type="text"
          placeholder="Ask Aevora Assistant anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white shadow-md transition flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};



