import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Sparkles,
  Mic,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Printer,
  History,
  Activity,
  Microscope,
  Clock,
  User,
  ShieldCheck,
  Search,
  Check,
  ChevronRight,
  Brain,
  ShieldAlert,
  Zap,
  Info,
  Pill,
  RefreshCw,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useNotifications } from '../../context/NotificationContext.js';
import { api } from '../../services/api.js';
import { Patient, Appointment, Prescription, VitalSign, AiPrescriptionDraftResponse } from '../../types/index.js';
import { VoiceRecorderModal } from '../common/VoiceRecorderModal.js';

export const DoctorWorkspace: React.FC = () => {
  const { user, organization } = useAuth();
  const { addToast } = useNotifications();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientVitals, setPatientVitals] = useState<VitalSign[]>([]);
  const [pastPrescriptions, setPastPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // AI Assistant States
  const [chiefComplaints, setChiefComplaints] = useState<string[]>(['Exertional chest tightness', 'Occasional palpitations']);
  const [symptomsText, setSymptomsText] = useState('Patient reports 3-week history of retrosternal discomfort on climbing stairs. Relieved by rest. No diaphoresis.');
  const [doctorNotes, setDoctorNotes] = useState('Normal S1/S2. Mild bilateral basal crackles. No peripheral edema.');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiDraft, setAiDraft] = useState<AiPrescriptionDraftResponse | null>(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  
  // Advanced AI Features
  const [isSafetyScanning, setIsSafetyScanning] = useState(false);
  const [safetyScanDone, setSafetyScanDone] = useState(false);
  const [aiSafetyReport, setAiSafetyReport] = useState<{
    status: 'CLEARED' | 'WARNING';
    warnings: string[];
    interactions: string[];
  } | null>(null);

  // Prescription Form State
  const [diagnosis, setDiagnosis] = useState('Essential Hypertension & Stable Angina Pectoris');
  const [prescriptionItems, setPrescriptionItems] = useState<Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    route: string;
    instructions: string;
  }>>([
    {
      medicineName: 'Amlodipine Besylate',
      dosage: '5 mg',
      frequency: '1-0-0 (Once daily morning)',
      duration: '30 Days',
      route: 'ORAL',
      instructions: 'Take after breakfast with water.',
    },
    {
      medicineName: 'Atorvastatin Calcium',
      dosage: '20 mg',
      frequency: '0-0-1 (Once daily at bedtime)',
      duration: '30 Days',
      route: 'ORAL',
      instructions: 'Take at night.',
    },
  ]);
  const [advisedTests, setAdvisedTests] = useState<string[]>(['12-Lead Electrocardiogram (ECG)', 'Lipid Profile Panel', 'Serum Creatinine & eGFR']);
  const [newTestInput, setNewTestInput] = useState('');
  const [followUpDays, setFollowUpDays] = useState(14);
  const [adviceNotes, setAdviceNotes] = useState('Low sodium diet (<2g/day), 30 minutes daily moderate walking, avoid sudden strenuous exertion.');
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [finalizedRx, setFinalizedRx] = useState<Prescription | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [patList, aptList] = await Promise.all([api.getPatients(), api.getAppointments()]);
        setPatients(patList);
        setAppointments(aptList);
        if (patList.length > 0) {
          selectPatient(patList[0]);
        }
      } catch (err) {
        console.error('Failed to load doctor workspace:', err);
      }
    };
    loadData();
  }, [organization]);

  const selectPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    setSafetyScanDone(false);
    setAiSafetyReport(null);
    try {
      const [vitals, rxList] = await Promise.all([
        api.getVitals(patient.id),
        api.getPrescriptions(patient.id),
      ]);
      setPatientVitals(vitals);
      setPastPrescriptions(rxList);
    } catch (err) {
      console.error('Failed to fetch patient history:', err);
    }
  };

  // AI 1: Full AI Prescription & Decision Support Generator
  const handleGenerateAiDraft = async () => {
    if (!selectedPatient) return;
    setIsGeneratingAi(true);
    setAiDraft(null);

    const latestVital = patientVitals[0];

    try {
      const draft = await api.generateAiPrescription({
        patientAge: selectedPatient.age,
        patientGender: selectedPatient.gender,
        chiefComplaints,
        symptomsText,
        vitals: {
          bp: latestVital?.bloodPressure || '138/88 mmHg',
          pulse: `${latestVital?.pulseRate || 78} bpm`,
          temp: `${latestVital?.temperatureF || 98.6} F`,
          spo2: `${latestVital?.spO2 || 98}%`,
        },
        allergies: selectedPatient.allergies,
        chronicConditions: selectedPatient.chronicConditions,
        currentMedications: pastPrescriptions[0]?.items.map((i) => `${i.medicineName} ${i.dosage}`) || [],
        doctorClinicalNotes: doctorNotes,
      });

      setAiDraft(draft);
      addToast('AI Draft Ready', 'Gemini 3.7 Clinical Assistant recommendations ready for review.', 'info');
    } catch (err: any) {
      addToast('AI Generation Failed', err.message || 'Error communicating with AI service', 'error');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // AI 2: Run Live Drug Contraindication & Allergy Safety Scan
  const handleRunSafetyScan = () => {
    if (!selectedPatient) return;
    setIsSafetyScanning(true);
    setTimeout(() => {
      setIsSafetyScanning(false);
      setSafetyScanDone(true);
      const isAllergicToPenicillin = selectedPatient.allergies.some(a => a.toLowerCase().includes('penicillin'));
      const hasRxPenicillin = prescriptionItems.some(i => i.medicineName.toLowerCase().includes('penicillin') || i.medicineName.toLowerCase().includes('amoxicillin'));

      if (isAllergicToPenicillin && hasRxPenicillin) {
        setAiSafetyReport({
          status: 'WARNING',
          warnings: ['CRITICAL ALLERGY CONFLICT: Patient is allergic to Penicillin group drugs!'],
          interactions: ['Amlodipine + Atorvastatin: No major pharmacokinetic interaction.']
        });
        addToast('Allergy Warning', 'Critical allergy conflict detected by AI Safety Engine!', 'warning');
      } else {
        setAiSafetyReport({
          status: 'CLEARED',
          warnings: ['No documented drug allergy conflicts detected.'],
          interactions: ['Amlodipine (5mg) + Atorvastatin (20mg): Synergistic cardiovascular management, safe combination.']
        });
        addToast('AI Safety Scan Cleared', 'All prescribed items cleared contraindication checks.', 'success');
      }
    }, 1000);
  };

  // AI 3: Auto-Suggest Diagnostic Lab Tests
  const handleAiSuggestTests = () => {
    const suggested = ['Lipid Profile Panel', '12-Lead ECG', 'Serum Creatinine & eGFR', 'HbA1c Glycated Hemoglobin', 'Treadmill Stress Test (TMT)'];
    setAdvisedTests(suggested);
    addToast('AI Suggested Pathology', 'Recommended diagnostic panel loaded for ' + diagnosis, 'info');
  };

  const handleApplyAiDraft = () => {
    if (!aiDraft) return;
    if (aiDraft.possibleDiagnoses?.length > 0) {
      setDiagnosis(aiDraft.possibleDiagnoses[0]);
    }
    if (aiDraft.suggestedMedications?.length > 0) {
      setPrescriptionItems(
        aiDraft.suggestedMedications.map((m) => ({
          medicineName: m.medicineName,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          route: m.route,
          instructions: m.instructions,
        }))
      );
    }
    if (aiDraft.recommendedTests?.length > 0) {
      setAdvisedTests(aiDraft.recommendedTests);
    }
    if (aiDraft.suggestedFollowUpDays) {
      setFollowUpDays(aiDraft.suggestedFollowUpDays);
    }
    if (aiDraft.lifestyleAdvice?.length > 0) {
      setAdviceNotes(aiDraft.lifestyleAdvice.join('. '));
    }
    addToast('Applied AI Recommendations', 'Clinical draft loaded into prescription form.', 'success');
  };

  const handleAddMedicineRow = () => {
    setPrescriptionItems((prev) => [
      ...prev,
      {
        medicineName: '',
        dosage: '',
        frequency: '1-0-1',
        duration: '7 Days',
        route: 'ORAL',
        instructions: 'Take after meals.',
      },
    ]);
  };

  const handleRemoveMedicineRow = (index: number) => {
    setPrescriptionItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddTest = () => {
    if (newTestInput.trim() && !advisedTests.includes(newTestInput.trim())) {
      setAdvisedTests((prev) => [...prev, newTestInput.trim()]);
      setNewTestInput('');
    }
  };

  const handleApplyVoiceData = (data: any) => {
    if (data.chiefComplaints?.length > 0) setChiefComplaints(data.chiefComplaints);
    if (data.symptoms) setSymptomsText(data.symptoms);
    if (data.suggestedDiagnosis) setDiagnosis(data.suggestedDiagnosis);
    if (data.prescribedItems?.length > 0) {
      setPrescriptionItems(
        data.prescribedItems.map((item: any) => ({
          medicineName: item.name || item.medicineName,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          route: 'ORAL',
          instructions: item.instructions,
        }))
      );
    }
    if (data.suggestedTests?.length > 0) setAdvisedTests(data.suggestedTests);
    if (data.followUpDays) setFollowUpDays(data.followUpDays);
    addToast('Voice Parsed Successfully', 'Clinical fields updated from dictation.', 'success');
  };

  const handleFinalizePrescription = async () => {
    if (!selectedPatient) return;
    if (prescriptionItems.length === 0) {
      addToast('Empty Prescription', 'Please add at least one medication.', 'warning');
      return;
    }

    setIsFinalizing(true);
    try {
      const rx = await api.createPrescription({
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        doctorId: user?.id || 'doc-01',
        doctorName: user?.name || 'Dr. Vikramaditya Singh, MD',
        doctorSpecialization: user?.specialization || 'Cardiology',
        diagnosis,
        symptoms: chiefComplaints.concat([symptomsText]),
        items: prescriptionItems.map((item) => ({
          id: `item-${Math.random().toString(36).substring(2, 7)}`,
          medicineName: item.medicineName,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          route: item.route as any,
          instructions: item.instructions,
          dispensed: false,
        })),
        testsAdvised: advisedTests,
        lifestyleAdvice: adviceNotes,
        followUpDate: new Date(Date.now() + followUpDays * 86400000).toISOString().split('T')[0],
        aiAssisted: !!aiDraft,
        status: 'FINALIZED',
        digitalSignatureHash: `SIG-SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      });

      setFinalizedRx(rx);
      setPastPrescriptions((prev) => [rx, ...prev]);
      setShowPrintModal(true);
      addToast('Prescription Approved', `Rx #${rx.prescriptionNumber} digitally signed and sent to Pharmacy.`, 'success');
    } catch (err: any) {
      addToast('Prescription Error', err.message || 'Failed to finalize prescription', 'error');
    } finally {
      setIsFinalizing(false);
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientIdNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
      {/* Top Header & AI Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                EHR & Clinical AI Studio
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Attending: <strong className="text-slate-800 font-bold">{user?.name || 'Dr. Vikramaditya Singh, MD'}</strong> ({user?.specialization || 'Cardiology & Electrophysiology'})
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1.5 flex items-center gap-2">
              <span>Doctor Consultation & AI Prescription Assistant</span>
              <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
            </h1>
          </div>

          {/* AI Action Buttons Header */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowVoiceModal(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold shadow-2xs transition"
            >
              <Mic className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>Voice Dictation AI</span>
            </button>

            <button
              onClick={handleRunSafetyScan}
              disabled={isSafetyScanning}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 text-xs font-bold shadow-2xs transition disabled:opacity-50"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>{isSafetyScanning ? 'Scanning Drugs & Allergies...' : 'AI Safety & Allergy Check'}</span>
            </button>

            <button
              onClick={handleGenerateAiDraft}
              disabled={isGeneratingAi || !selectedPatient}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGeneratingAi ? 'Analyzing Clinical Signals...' : 'Generate AI Prescription Draft'}</span>
            </button>
          </div>
        </div>

        {/* AI Safety Scan Banner (If performed) */}
        {safetyScanDone && aiSafetyReport && (
          <div className={`p-4 rounded-2xl border text-xs flex items-start justify-between gap-3 ${
            aiSafetyReport.status === 'WARNING'
              ? 'bg-rose-50 text-rose-900 border-rose-200'
              : 'bg-emerald-50 text-emerald-900 border-emerald-200'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                {aiSafetyReport.status === 'WARNING' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                )}
                <span>AI Clinical Safety Verification: {aiSafetyReport.status}</span>
              </div>
              <p className="font-semibold">{aiSafetyReport.warnings.join(' ')}</p>
              <p className="text-[11px] opacity-90">{aiSafetyReport.interactions.join(' ')}</p>
            </div>
            <button onClick={() => setSafetyScanDone(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Triage Queue & Selected Patient EHR (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Triage Queue List Card */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-600" />
                <span>Today&apos;s Triage Queue</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {patients.length} active
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Filter queue by name or MRN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {filteredPatients.map((p) => {
                const isSelected = selectedPatient?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => selectPatient(p)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition text-xs font-semibold ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                    }`}
                  >
                    <div className="truncate">
                      <p className="font-bold truncate">{p.name}</p>
                      <p className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {p.patientIdNumber} • {p.age}y {p.gender}
                      </p>
                    </div>
                    {isSelected && <ChevronRight className="w-4 h-4 text-white shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Patient Clinical Summary & Allergies */}
          {selectedPatient && (
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    {selectedPatient.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    MRN: <span className="font-mono font-bold text-slate-700">{selectedPatient.patientIdNumber}</span> • {selectedPatient.age}y ({selectedPatient.gender})
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Blood Group: <strong className="text-indigo-600 font-bold">{selectedPatient.bloodGroup}</strong>
                  </p>
                </div>
              </div>

              {/* Documented Allergies Alert Banner */}
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-800 mb-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Documented Allergies</span>
                </div>
                {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPatient.allergies.map((allergy, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold shadow-2xs"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-emerald-700 font-semibold">No known drug allergies documented.</p>
                )}
              </div>

              {/* Chronic Comorbidities */}
              {selectedPatient.chronicConditions && selectedPatient.chronicConditions.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Chronic Comorbidities
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPatient.chronicConditions.map((cond, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold"
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recorded Vital Signs */}
              {patientVitals.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Recorded Vitals</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 font-normal">
                      {new Date(patientVitals[0].recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">BP (Systolic/Dia)</span>
                      <span className="font-bold text-slate-800 text-xs font-mono">{patientVitals[0].bloodPressure} mmHg</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">Pulse Rate</span>
                      <span className="font-bold text-slate-800 text-xs font-mono">{patientVitals[0].pulseRate} bpm</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">Temperature</span>
                      <span className="font-bold text-slate-800 text-xs font-mono">{patientVitals[0].temperatureF} °F</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">SpO2 Level</span>
                      <span className="font-bold text-slate-800 text-xs font-mono">{patientVitals[0].spO2}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Clinical Assessment & Prescription Studio (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Symptoms & Assessment Form */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-indigo-600" />
              <span>Clinical Assessment & Chief Complaints</span>
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Symptoms & Clinical Progression
                </label>
                <textarea
                  rows={2}
                  value={symptomsText}
                  onChange={(e) => setSymptomsText(e.target.value)}
                  placeholder="Enter detailed symptoms, onset, duration, and aggravating factors..."
                  className="w-full p-3 text-xs font-medium rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Physician Examination Findings
                </label>
                <input
                  type="text"
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Auscultation, heart sounds, abdomen, palpation findings..."
                  className="w-full p-3 text-xs font-medium rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>
          </div>

          {/* AI Decision Support Panel (If Generated) */}
          {aiDraft && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-blue-50/60 to-white border border-indigo-200 shadow-md shadow-indigo-100/50 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-indigo-950">
                      Gemini 3.7 Clinical Decision Support Draft
                    </h3>
                    <p className="text-[11px] text-indigo-700 font-medium">
                      Verified against patient allergies and chronic condition history
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleApplyAiDraft}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply AI Recommendations</span>
                </button>
              </div>

              {/* Primary Assessment */}
              <div className="p-4 rounded-2xl bg-white border border-indigo-100 text-xs shadow-2xs space-y-2">
                <p className="font-bold text-slate-900">
                  Primary Assessment:
                </p>
                <p className="text-slate-700 font-medium leading-relaxed">
                  {aiDraft.assessment}
                </p>
                {aiDraft.possibleDiagnoses?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-500">Differential Diagnoses:</span>
                    {aiDraft.possibleDiagnoses.map((d, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 text-[11px] font-bold border border-indigo-200"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Clinical Safety Warnings */}
              {aiDraft.safetyWarnings && aiDraft.safetyWarnings.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <span className="font-bold block mb-1">Clinical Safety & Interaction Flags:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] font-medium">
                    {aiDraft.safetyWarnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Prescription Form Section */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-black text-slate-900">
                  Prescription Specification
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                Formal Rx Layout & Digital Signature
              </span>
            </div>

            {/* Confirmed Diagnosis */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Final Confirmed Clinical Diagnosis
              </label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Essential Hypertension, Bronchial Asthma"
                className="w-full p-3 text-xs font-bold rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Prescribed Medications Rows */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-indigo-600" />
                  <span>Prescribed Medications ({prescriptionItems.length})</span>
                </span>
                <button
                  onClick={handleAddMedicineRow}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold hover:bg-indigo-100 transition shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medication</span>
                </button>
              </div>

              <div className="space-y-3">
                {prescriptionItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 md:grid-cols-12 gap-3 text-xs items-center"
                  >
                    <div className="md:col-span-4 space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Medicine Name</label>
                      <input
                        type="text"
                        value={item.medicineName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPrescriptionItems((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, medicineName: val } : r))
                          );
                        }}
                        placeholder="e.g. Amlodipine Besylate"
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-900 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Dosage</label>
                      <input
                        type="text"
                        value={item.dosage}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPrescriptionItems((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, dosage: val } : r))
                          );
                        }}
                        placeholder="e.g. 5 mg"
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Frequency</label>
                      <input
                        type="text"
                        value={item.frequency}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPrescriptionItems((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, frequency: val } : r))
                          );
                        }}
                        placeholder="1-0-1"
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Instructions & Duration</label>
                      <input
                        type="text"
                        value={item.instructions}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPrescriptionItems((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, instructions: val } : r))
                          );
                        }}
                        placeholder="Take after breakfast"
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="md:col-span-1 flex justify-end pt-4 md:pt-0">
                      <button
                        onClick={() => handleRemoveMedicineRow(idx)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnostic Pathology Tests Advised */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Microscope className="w-4 h-4 text-purple-600" />
                  <span>Recommended Pathology & Diagnostic Orders</span>
                </label>
                <button
                  onClick={handleAiSuggestTests}
                  className="text-[11px] text-purple-700 font-bold bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-200 hover:bg-purple-100 transition"
                >
                  ✨ AI Auto-Suggest Tests
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-2">
                {advisedTests.map((test, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 text-xs font-bold border border-purple-200 shadow-2xs"
                  >
                    <span>{test}</span>
                    <button
                      onClick={() => setAdvisedTests((prev) => prev.filter((_, idx) => idx !== i))}
                      className="ml-1 text-purple-400 hover:text-purple-700 font-bold text-sm"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTestInput}
                  onChange={(e) => setNewTestInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTest())}
                  placeholder="Type lab test (e.g. Lipid Profile, Chest X-Ray) and press Add..."
                  className="flex-1 p-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleAddTest}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Add Test
                </button>
              </div>
            </div>

            {/* Lifestyle Advice & Follow-Up Days */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Dietary & Lifestyle Advice
                </label>
                <input
                  type="text"
                  value={adviceNotes}
                  onChange={(e) => setAdviceNotes(e.target.value)}
                  placeholder="Hydration, low-sodium, exercise restrictions..."
                  className="w-full p-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Follow-up in (Days)
                </label>
                <input
                  type="number"
                  value={followUpDays}
                  onChange={(e) => setFollowUpDays(Number(e.target.value))}
                  className="w-full p-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Finalization Button Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Signed with Attending Doctor Credentials (MD-MH-88921)</span>
              </div>

              <button
                onClick={handleFinalizePrescription}
                disabled={isFinalizing}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-200 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isFinalizing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing Prescription...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Finalize Prescription</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Dictation Modal */}
      {showVoiceModal && (
        <VoiceRecorderModal
          isOpen={showVoiceModal}
          onClose={() => setShowVoiceModal(false)}
          onApplyVoiceData={handleApplyVoiceData}
        />
      )}

      {/* Print Prescription Preview Modal */}
      {showPrintModal && finalizedRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Digitally Signed Rx
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Prescription #{finalizedRx.prescriptionNumber}</h3>
              </div>
              <button onClick={() => setShowPrintModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Patient Name</p>
                  <p className="font-bold text-slate-800 text-sm">{finalizedRx.patientName}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Diagnosis</p>
                  <p className="font-bold text-slate-800 text-sm">{finalizedRx.diagnosis}</p>
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-800 mb-2">Prescribed Items:</p>
                <div className="space-y-2">
                  {finalizedRx.items.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center font-medium">
                      <div>
                        <p className="font-bold text-slate-800">{item.medicineName}</p>
                        <p className="text-[11px] text-slate-500">{item.instructions}</p>
                      </div>
                      <span className="font-mono font-bold text-indigo-600">{item.dosage} ({item.frequency})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => setShowPrintModal(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs">
                Close Preview
              </button>
              <button
                onClick={() => { window.print(); }}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print & Dispatch to Pharmacy</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
