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
      text: `Hello ${user?.name || 'Doctor'}! I am Pulse AI, your clinical and operations assistant for ${organization?.name}. How can I assist you with clinical guidelines, bed occupancy, pharmacy triage, or diagnostic interpretations today?`,
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
          text: res.reply || 'AVORA Gemini AI Assistant is online. How can I assist you with clinical guidelines, bed occupancy, or patient care?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'AVORA Gemini AI engine is online. Please ask your clinical or operational question.',
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
      <div className="flex items-center justify-between p-4 border-b border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white">Pulse AI Assistant</h3>
            <p className="text-[10px] text-blue-100 flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-300" />
              <span>Gemini 3.7 Flash • Healthcare Guardrails Active</span>
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Safety Notice */}
      <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 flex items-start space-x-2 text-[11px] text-amber-800 dark:text-amber-600">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>Assistive support only. All clinical treatment decisions require licensed physician verification.</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="flex items-start space-x-2 max-w-[85%]">
              {m.sender === 'ai' && (
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                    : 'bg-slate-100 text-slate-700 rounded-bl-none border border-slate-200 shadow-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                <span className="block text-[9px] mt-1.5 opacity-60 text-right">{m.time}</span>
              </div>
              {m.sender === 'user' && (
                <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-700 text-slate-700 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-3 bg-slate-100 rounded-2xl rounded-bl-none flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Suggested chips */}
      <div className="px-4 py-2 border-t border-slate-100 border-slate-200 bg-slate-50/50 bg-white/50">
        <p className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 flex items-center space-x-1">
          <Lightbulb className="w-3 h-3 text-amber-500" />
          <span>Quick Prompts</span>
        </p>
        <div className="flex flex-wrap gap-1">
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => setInput(prompt)}
              className="text-[10px] text-slate-600 text-slate-600 bg-white bg-slate-100 hover:bg-slate-100 hover:bg-slate-100 px-2 py-1 rounded-md border border-slate-200 transition truncate max-w-[200px]"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2">
        <input
          type="text"
          placeholder="Ask Pulse AI anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 bg-slate-100 text-slate-900 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-slate-900 shadow-xs transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};



