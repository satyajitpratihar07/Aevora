import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Sparkles,
  X,
  Volume2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
} from 'lucide-react';
import { api } from '../../services/api.js';

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyParsedData: (data: {
    chiefComplaints?: string[];
    symptoms?: string;
    suggestedDiagnosis?: string;
    prescribedItems?: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
    }>;
    suggestedTests?: string[];
    followUpDays?: number;
  }) => void;
}

export const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({
  isOpen,
  onClose,
  onApplyParsedData,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let timer: any;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  if (!isOpen) return null;

  const sampleClinicalDictations = [
    'Patient has exertional chest tightness for 2 days. Start Amlodipine 10mg once daily in morning, Atorvastatin 20mg at bedtime, order Lipid Profile panel, follow up in 14 days.',
    'Acute onset throbbing hemicranial headache with photophobia and nausea. Prescribe Sumatriptan 50mg PRN, advise MRI brain scan, avoid bright lights and follow up in 7 days.',
    'High fever 38.5C with productive cough and sore throat for 3 days. Prescribe Amoxicillin-Clavulanate 625mg twice daily for 5 days with meals, Paracetamol 650mg SOS, order Complete Blood Count, follow up in 5 days.',
  ];

  const handleStartRecording = () => {
    setIsRecording(true);
    setParsedResult(null);
    setErrorMsg('');
    // If Web Speech API is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          setTranscript(currentTranscript);
        };
        recognition.onerror = (e: any) => {
          console.warn('Speech recognition fallback enabled:', e);
        };
        recognition.start();
      } catch (err) {
        console.warn('Voice API initialization fallback:', err);
      }
    } else {
      // Simulate live dictation sample if browser Speech API not active in sandboxed iframe
      if (!transcript) {
        setTranscript(sampleClinicalDictations[0]);
      }
    }
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    if (!transcript.trim()) {
      setErrorMsg('No speech detected. Please speak or pick a clinical sample below.');
      return;
    }

    setIsParsing(true);
    try {
      const parsed = await api.parseVoiceAudio(transcript);
      setParsedResult(parsed);
    } catch (err: any) {
      setErrorMsg(err.message || 'AI dictation parsing error');
    } finally {
      setIsParsing(false);
    }
  };

  const handleApply = () => {
    if (parsedResult) {
      onApplyParsedData(parsedResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 border-slate-200">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-700">
                Voice Clinical Dictation & AI Parser
              </h3>
              <p className="text-[11px] text-slate-500">
                Speak naturally — Gemini extracts diagnoses, medicines, dosages & tests
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-500 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Visualizer & Record Button */}
        <div className="p-6 bg-slate-50 bg-slate-100/60 rounded-2xl border border-slate-200/60 text-center mb-4">
          <div className="flex items-center justify-center space-x-1 mb-4 h-10">
            {isRecording ? (
              <>
                <span className="w-1 bg-red-500 rounded-full animate-bounce h-4" />
                <span className="w-1 bg-red-500 rounded-full animate-bounce h-8 [animation-delay:0.15s]" />
                <span className="w-1 bg-red-500 rounded-full animate-bounce h-10 [animation-delay:0.3s]" />
                <span className="w-1 bg-red-500 rounded-full animate-bounce h-6 [animation-delay:0.45s]" />
                <span className="w-1 bg-red-500 rounded-full animate-bounce h-9 [animation-delay:0.2s]" />
                <span className="w-1 bg-red-500 rounded-full animate-bounce h-5 [animation-delay:0.35s]" />
              </>
            ) : (
              <span className="text-xs text-slate-500">Click below to start voice recording</span>
            )}
          </div>

          <div className="flex items-center justify-center space-x-3">
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-slate-900 font-semibold text-xs shadow-md shadow-red-600/30 transition active:scale-95"
              >
                <Mic className="w-4 h-4 animate-pulse" />
                <span>Start Clinical Dictation</span>
              </button>
            ) : (
              <button
                onClick={handleStopRecording}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-900 text-slate-900 font-semibold text-xs shadow-md transition active:scale-95"
              >
                <Square className="w-4 h-4 text-red-400" />
                <span>Stop & Extract Fields ({recordingSeconds}s)</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Transcript Box */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-700 text-slate-600">
              Spoken Transcript (Editable)
            </span>
            <span className="text-[10px] text-slate-500">Speech-to-Text Stream</span>
          </div>
          <textarea
            rows={3}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Audio transcript will appear here as you speak..."
            className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500 leading-relaxed"
          />
        </div>

        {/* Quick Clinical Sample Dictation Pickers */}
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Or Test with Clinical Voice Presets:
          </p>
          <div className="space-y-1">
            {sampleClinicalDictations.map((dict, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTranscript(dict);
                  setParsedResult(null);
                }}
                className="w-full text-left text-[11px] p-2 rounded-lg bg-slate-50 bg-slate-100/50 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 text-slate-600 border border-slate-100 border-slate-200/50 transition truncate"
              >
                &ldquo;{dict}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Parsed Result Preview */}
        {isParsing && (
          <div className="p-4 rounded-xl bg-blue-50 bg-blue-50/40 border border-blue-200 border-blue-200 flex items-center space-x-3 text-xs text-blue-700 text-blue-700">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Gemini AI is parsing voice into prescription items and clinical diagnosis...</span>
          </div>
        )}

        {parsedResult && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2 mb-4">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>Parsed Structured Prescription Ready</span>
            </div>
            <p className="text-xs text-slate-700">
              <strong>Assessment:</strong> {parsedResult.suggestedDiagnosis}
            </p>
            {parsedResult.prescribedItems?.length > 0 && (
              <div className="text-[11px] text-slate-600 text-slate-600 space-y-1">
                <strong>Extracted Medicines:</strong>
                <ul className="list-disc list-inside">
                  {parsedResult.prescribedItems.map((item: any, i: number) => (
                    <li key={i}>
                      {item.name} {item.dosage} — {item.frequency} ({item.duration})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {parsedResult.suggestedTests?.length > 0 && (
              <p className="text-[11px] text-slate-600 text-slate-600">
                <strong>Advised Tests:</strong> {parsedResult.suggestedTests.join(', ')}
              </p>
            )}
          </div>
        )}

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-600 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 text-slate-500 hover:bg-slate-100 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          {!parsedResult ? (
            <button
              onClick={handleStopRecording}
              disabled={!transcript.trim() || isParsing}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-slate-900 font-semibold text-xs shadow-xs transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Parse with AI</span>
            </button>
          ) : (
            <button
              onClick={handleApply}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-slate-900 font-semibold text-xs shadow-xs transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply to Prescription</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};



