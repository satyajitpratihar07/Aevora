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
      addToast('AI Draft Generated', 'Clinical decision support recommendations ready for review.', 'info');
    } catch (err: any) {
      addToast('AI Generation Failed', err.message || 'Error communicating with AI service', 'error');
    } finally {
      setIsGeneratingAi(false);
    }
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
    addToast('Applied AI Recommendations', 'Draft items loaded into prescription workspace.', 'success');
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

  const handleApplyVoiceData = (data: any) => {
    if (data.chiefComplaints?.length > 0) setChiefComplaints(data.chiefComplaints);
    if (data.symptoms) setSymptomsText(data.symptoms);
    if (data.suggestedDiagnosis) setDiagnosis(data.suggestedDiagnosis);
    if (data.prescribedItems?.length > 0) {
      setPrescriptionItems(
        data.prescribedItems.map((item: any) => ({
          medicineName: item.name,
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

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientIdNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Bar / Doctor Workspace Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 bg-blue-50 text-blue-700 text-blue-700">
              EHR & Clinical Studio
            </span>
            <span className="text-xs text-slate-500">
              Attending: <strong className="text-slate-700">{user?.name || 'Dr. Vikramaditya Singh, MD'}</strong> ({user?.specialization || 'Cardiology'})
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 text-slate-800 tracking-tight mt-1">
            Doctor Consultation & AI Prescription Assistant
          </h1>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowVoiceModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 hover:bg-red-100 text-xs font-semibold shadow-xs transition"
          >
            <Mic className="w-4 h-4 animate-pulse" />
            <span>Voice Dictation</span>
          </button>
          <button
            onClick={handleGenerateAiDraft}
            disabled={isGeneratingAi || !selectedPatient}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGeneratingAi ? 'Analyzing Clinical Signals...' : 'Generate AI Prescription Draft'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Patient Queue & EHR Left / Prescription Studio Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Patient Triage & EHR Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Patient Selector Card */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Today&apos;s Triage Queue
              </h2>
              <span className="text-[11px] font-medium text-blue-600">
                {patients.length} active
              </span>
            </div>

            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter queue by name or MRN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 bg-slate-100 text-slate-700 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {filteredPatients.map((p) => {
                const isSelected = selectedPatient?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => selectPatient(p)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition text-xs ${
                      isSelected
                        ? 'bg-blue-600 text-slate-900 shadow-xs'
                        : 'hover:bg-slate-100 hover:bg-slate-100 text-slate-700 text-slate-600'
                    }`}
                  >
                    <div className="truncate">
                      <p className="font-semibold truncate">{p.name}</p>
                      <p className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                        {p.patientIdNumber} • {p.age}y {p.gender}
                      </p>
                    </div>
                    {isSelected && <ChevronRight className="w-4 h-4 text-slate-900 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Patient EHR Profile & Allergy Card */}
          {selectedPatient && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 text-slate-800">
                    {selectedPatient.name}
                  </h2>
                  <p className="text-xs text-slate-500">
                    MRN: <span className="font-mono">{selectedPatient.patientIdNumber}</span> • {selectedPatient.age}y ({selectedPatient.gender})
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Blood Group: <strong className="text-slate-700 text-slate-600">{selectedPatient.bloodGroup}</strong>
                  </p>
                </div>
              </div>

              {/* CRITICAL ALLERGY ALERT BANNER */}
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-red-800 dark:text-red-300 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Documented Allergies</span>
                </div>
                {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedPatient.allergies.map((allergy, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-red-600 text-slate-900 text-[10px] font-bold"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-red-600/80">No documented drug allergies.</p>
                )}
              </div>

              {/* Chronic Conditions */}
              {selectedPatient.chronicConditions && selectedPatient.chronicConditions.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Chronic Comorbidities
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedPatient.chronicConditions.map((cond, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-slate-600 text-[11px] font-medium"
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Latest Vitals */}
              {patientVitals.length > 0 && (
                <div className="pt-2 border-t border-slate-100 border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Recorded Vitals</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      {new Date(patientVitals[0].recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 bg-slate-100">
                      <span className="text-slate-500 text-[10px] block">BP (Systolic/Dia)</span>
                      <span className="font-bold text-slate-700">{patientVitals[0].bloodPressure} mmHg</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 bg-slate-100">
                      <span className="text-slate-500 text-[10px] block">Pulse</span>
                      <span className="font-bold text-slate-700">{patientVitals[0].pulseRate} bpm</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 bg-slate-100">
                      <span className="text-slate-500 text-[10px] block">Temperature</span>
                      <span className="font-bold text-slate-700">{patientVitals[0].temperatureF} °F</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 bg-slate-100">
                      <span className="text-slate-500 text-[10px] block">Oxygen (SpO2)</span>
                      <span className="font-bold text-slate-700">{patientVitals[0].spO2}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: AI Assistant Review + Prescription Builder (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Clinical Complaints & Symptoms Entry */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Clinical Assessment & Chief Complaints
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 text-slate-600 mb-1">
                  Symptoms & Clinical Progression
                </label>
                <textarea
                  rows={2}
                  value={symptomsText}
                  onChange={(e) => setSymptomsText(e.target.value)}
                  placeholder="Enter detailed symptoms, onset, duration, and aggravating factors..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 bg-slate-100 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 text-slate-600 mb-1">
                  Physician Examination Findings
                </label>
                <input
                  type="text"
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Auscultation, heart sounds, abdomen, palpation findings..."
                  className="w-full p-2 text-xs rounded-xl border border-slate-200 bg-slate-50 bg-slate-100 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* AI Decision Support Panel (If generated) */}
          {aiDraft && (
            <div className="p-5 rounded-2xl bg-gradient-to-b from-blue-50/70 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-200 border-blue-200 shadow-xs space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-slate-900 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-blue-900 text-blue-600">
                      Gemini 3.7 Flash Decision Support Draft
                    </h3>
                    <p className="text-[10px] text-blue-700 text-blue-700">
                      Verified against patient allergies and chronic conditions
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleApplyAiDraft}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-slate-900 text-xs font-semibold shadow-xs transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply Recommendations</span>
                </button>
              </div>

              {/* Assessment Summary */}
              <div className="p-3 rounded-xl bg-white border border-blue-100 border-blue-200 text-xs">
                <p className="font-semibold text-slate-700 mb-1">
                  Primary Assessment:
                </p>
                <p className="text-slate-600 text-slate-600 leading-relaxed">
                  {aiDraft.assessment}
                </p>
                {aiDraft.possibleDiagnoses?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-[10px] font-bold text-slate-500">Differentials:</span>
                    {aiDraft.possibleDiagnoses.map((d, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 text-blue-600 text-[10px] font-medium"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Drug Cautions & Safety Warnings */}
              {aiDraft.safetyWarnings && aiDraft.safetyWarnings.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-600">
                  <span className="font-bold block mb-1">Clinical Safety & Interaction Flags:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {aiDraft.safetyWarnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Prescription Studio Form */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 border-slate-200">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 text-slate-800">
                  Prescription Specification
                </h2>
              </div>
              <span className="text-[11px] text-slate-500">
                Formal Rx Layout & Pharmacy Dispatch
              </span>
            </div>

            {/* Confirmed Diagnosis */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 text-slate-600 mb-1">
                Final Confirmed Clinical Diagnosis
              </label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Essential Hypertension, Bronchial Asthma"
                className="w-full p-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white bg-slate-100 text-slate-900 text-slate-800 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Prescribed Medications Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 text-slate-600">
                  Prescribed Medications ({prescriptionItems.length})
                </span>
                <button
                  onClick={handleAddMedicineRow}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-50 bg-blue-50 text-blue-600 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medication</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {prescriptionItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 bg-slate-100/60 border border-slate-200/80 border-slate-200/80 grid grid-cols-1 md:grid-cols-12 gap-2 text-xs items-center"
                  >
                    <div className="md:col-span-4">
                      <label className="block text-[10px] text-slate-500 mb-0.5">Medicine Name</label>
                      <input
                        type="text"
                        value={item.medicineName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPrescriptionItems((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, medicineName: val } : r))
                          );
                        }}
                        placeholder="e.g. Amlodipine"
                        className="w-full p-1.5 text-xs rounded-lg border border-slate-200 bg-white font-semibold"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-slate-500 mb-0.5">Dosage</label>
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
                        className="w-full p-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-slate-500 mb-0.5">Frequency</label>
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
                        className="w-full p-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-[10px] text-slate-500 mb-0.5">Instructions & Duration</label>
                      <input
                        type="text"
                        value={item.instructions}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPrescriptionItems((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, instructions: val } : r))
                          );
                        }}
                        placeholder="After meal, 30 days"
                        className="w-full p-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div className="md:col-span-1 flex justify-end">
                      <button
                        onClick={() => handleRemoveMedicineRow(idx)}
                        className="p-1.5 text-slate-500 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnostic Tests Advised */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 text-slate-600 mb-1.5">
                Recommended Pathology & Diagnostic Orders
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {advisedTests.map((test, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-600 text-xs border border-purple-200 dark:border-purple-900"
                  >
                    <Microscope className="w-3 h-3" />
                    <span>{test}</span>
                    <button
                      onClick={() => setAdvisedTests((prev) => prev.filter((_, idx) => idx !== i))}
                      className="ml-1 text-purple-400 hover:text-purple-700"
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
                  className="flex-1 p-2 text-xs rounded-xl border border-slate-200 bg-slate-50 bg-slate-100"
                />
                <button
                  onClick={handleAddTest}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-slate-900 rounded-xl text-xs font-semibold transition"
                >
                  Add Test
                </button>
              </div>
            </div>

            {/* Lifestyle Advice & Follow-Up Days */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 text-slate-600 mb-1">
                  Dietary & Lifestyle Advice
                </label>
                <input
                  type="text"
                  value={adviceNotes}
                  onChange={(e) => setAdviceNotes(e.target.value)}
                  placeholder="Hydration, low-sodium, exercise restrictions..."
                  className="w-full p-2 text-xs rounded-xl border border-slate-200 bg-white bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 text-slate-600 mb-1">
                  Follow-up in (Days)
                </label>
                <input
                  type="number"
                  value={followUpDays}
                  onChange={(e) => setFollowUpDays(Number(e.target.value))}
                  className="w-full p-2 text-xs rounded-xl border border-slate-200 bg-white bg-slate-100"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 border-slate-200">
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Signed with Attending Doctor Credentials ({user?.licenseNumber || 'MD-78901'})</span>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleFinalizePrescription}
                  disabled={isFinalizing || !selectedPatient}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-slate-900 text-xs font-bold shadow-md shadow-emerald-600/30 transition disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isFinalizing ? 'Authorizing...' : 'Approve & Finalize Prescription'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Dictation Modal */}
      <VoiceRecorderModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onApplyParsedData={handleApplyVoiceData}
      />

      {/* Prescription Printable Modal */}
      {showPrintModal && finalizedRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 bg-slate-100/60">
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-700">
                  Prescription Document Preview (Rx #{finalizedRx.prescriptionNumber})
                </h3>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-xs px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 text-slate-700 font-medium"
              >
                Close
              </button>
            </div>

            {/* Prescription Letterhead Preview */}
            <div className="p-8 overflow-y-auto space-y-6 text-xs text-slate-700">
              {/* Hospital Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold tracking-tight text-slate-900 text-slate-800" style={{ color: organization?.brandColor }}>
                    {organization?.name}
                  </h2>
                  <p className="text-slate-500 text-[11px]">{organization?.address}, {organization?.city}, {organization?.state}</p>
                  <p className="text-slate-500 text-[11px]">Phone: {organization?.phone} • Email: {organization?.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 text-slate-800">{finalizedRx.doctorName}</p>
                  <p className="text-slate-500">{finalizedRx.doctorSpecialization}</p>
                  <p className="text-[10px] text-slate-500">Date: {new Date(finalizedRx.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Patient Info Row */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 bg-slate-100/50 rounded-xl text-[11px]">
                <p><strong>Patient:</strong> {finalizedRx.patientName}</p>
                <p><strong>Diagnosis:</strong> {finalizedRx.diagnosis}</p>
                <p><strong>Rx #:</strong> <span className="font-mono">{finalizedRx.prescriptionNumber}</span></p>
              </div>

              {/* Medication Table */}
              <div>
                <div className="flex items-center space-x-2 mb-2 text-sm font-bold text-blue-600 font-serif">
                  <span className="text-xl italic">℞</span>
                  <span>Prescribed Medicines</span>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 divide-slate-100">
                  {finalizedRx.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-900 text-slate-800">
                          {idx + 1}. {item.medicineName} ({item.dosage})
                        </p>
                        <p className="text-slate-500 text-[11px]">{item.instructions}</p>
                      </div>
                      <div className="text-right font-medium">
                        <span className="px-2 py-0.5 rounded bg-blue-50 bg-blue-50 text-blue-700 text-blue-700 text-[11px]">
                          {item.frequency}
                        </span>
                        <span className="text-slate-500 text-[11px] block">{item.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tests & Advice */}
              {finalizedRx.testsAdvised && finalizedRx.testsAdvised.length > 0 && (
                <div className="p-3 bg-slate-50 bg-slate-100/50 rounded-xl text-[11px]">
                  <strong>Diagnostics Advised:</strong> {finalizedRx.testsAdvised.join(', ')}
                </div>
              )}

              {finalizedRx.lifestyleAdvice && (
                <div className="text-[11px] text-slate-600 text-slate-600">
                  <strong>Advice:</strong> {finalizedRx.lifestyleAdvice}
                </div>
              )}

              {/* Signature Block */}
              <div className="flex justify-between items-end pt-8 border-t border-slate-200">
                <div className="text-[10px] text-slate-500">
                  <p>Electronically generated via PulseCloud HMS</p>
                  <p className="font-mono">{finalizedRx.digitalSignatureHash}</p>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 pb-1 mb-1 font-serif italic text-blue-700 text-blue-700">
                    Vikramaditya Singh, MD
                  </div>
                  <p className="text-[10px] text-slate-500">Authorized Physician Signature</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 bg-slate-100/60 border-t border-slate-200 flex justify-end space-x-3">
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-slate-900 text-xs font-semibold transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Prescription</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};





