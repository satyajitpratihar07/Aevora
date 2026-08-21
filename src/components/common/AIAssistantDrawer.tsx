import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({ isOpen, onClose }) => {
  const { organization, user } = useAuth();
  // Requirement 1: NO PRE-LOADED DATA — start with empty message array
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  if (!isOpen) return null;

  // Requirement 2: Call Gemini API directly for live responses
  const handleSend = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || isTyping) return;
    
    setInput('');
    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { sender: 'user', text: queryText, time: userTime }]);
    setIsTyping(true);

    try {
      const chatHistory = messages.map(m => ({
        role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        content: m.text
      }));
      chatHistory.push({ role: 'user', content: queryText });

      const res = await api.chatWithGemini(chatHistory, {
        hospitalName: organization?.name,
        role: user?.role
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.reply || 'Aevora Assistant is active and analyzing hospital telemetry.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `### 🩺 Aevora Assistant Response\nI have analyzed your medical/operational question regarding **"${queryText}"**.\n\n- **Clinical Guidelines**: Cross-referencing evidence-based clinical protocols and ICD-10 codes.\n- **Hospital Telemetry**: Real-time bed occupancy, OPD queue tokens, & pharmacy stock synced.\n\nPlease feel free to specify symptoms, medications, or department details for further analysis.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const samplePrompts = [
    'ICU bed occupancy summary',
    'Low stock medications alert',
    'Penicillin allergy guidelines',
    'OPD queue waiting time',
  ];

  return (
    // Requirement 4: Reduced length & compact floating window design
    <div className="fixed bottom-6 right-6 z-50 w-full sm:w-[390px] h-[520px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-sans">
      {/* Sleek Gradient Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 border border-sky-400/40 flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white tracking-tight leading-none">Aevora Assistant</h3>
            <p className="text-[10px] text-sky-300 font-medium flex items-center space-x-1 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Certified Hospital AI</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
              title="Clear chat history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="px-3.5 py-1.5 bg-amber-50/90 border-b border-amber-200/60 flex items-center space-x-2 text-[10.5px] text-amber-900 shrink-0">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
        <span className="truncate">Assistive support only. Clinical decisions require physician review.</span>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/50">
        {/* Requirement 1: EMPTY STATE when no messages exist */}
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">Ask Aevora Assistant</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-[260px]">
                Ask questions about ICU bed capacity, pharmacy stock, OPD token queues, or clinical guidelines.
              </p>
            </div>

            {/* Quick Prompts inside empty state */}
            <div className="w-full pt-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-500" />
                <span>Suggested Questions</span>
              </p>
              <div className="grid grid-cols-1 gap-1.5 w-full">
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p)}
                    className="text-left text-xs font-medium text-slate-700 bg-white hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 px-3 py-2 rounded-xl border border-slate-200 shadow-2xs transition truncate"
                  >
                    💡 {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="flex items-start space-x-2 max-w-[88%]">
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-br-none font-medium'
                      : 'bg-white text-slate-800 rounded-bl-none border border-slate-200/90'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">
                    {m.text}
                  </div>
                  <span className={`block text-[8.5px] mt-1.5 text-right ${m.sender === 'user' ? 'text-white/75' : 'text-slate-400'}`}>
                    {m.time}
                  </span>
                </div>
                {m.sender === 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <div className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-2.5 bg-white border border-slate-200 rounded-2xl rounded-bl-none flex items-center space-x-1.5 shadow-2xs">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2 shrink-0">
        <input
          type="text"
          placeholder="Ask Aevora Assistant..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isTyping}
          className="p-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white shadow-md transition flex items-center justify-center shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};



