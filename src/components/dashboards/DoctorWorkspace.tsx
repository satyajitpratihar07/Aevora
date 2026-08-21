import React, { useState, useEffect } from 'react';
import { NotificationBell } from '../common/NotificationBell.js';
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
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Download,
  Syringe,
  Users,
  LayoutDashboard,
  Send,
  Radio,
  FileSpreadsheet,
  CheckSquare,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useNotifications } from '../../context/NotificationContext.js';
import { api } from '../../services/api.js';
import { Patient, Appointment, Prescription, VitalSign, AiPrescriptionDraftResponse } from '../../types/index.js';
import { VoiceRecorderModal } from '../common/VoiceRecorderModal.js';

interface LabReportDetail {
  id: string;
  testName: string;
  category: string;
  date: string;
  specimen: string;
  status: 'COMPLETED' | 'PENDING' | 'CRITICAL';
  parameters: Array<{
    name: string;
    value: string;
    unit: string;
    referenceRange: string;
    flag: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';
  }>;
  doctorNotes: string;
}

interface NurseInjectionOrder {
  id: string;
  patientName: string;
  bed: string;
  medicationName: string;
  dosage: string;
  route: 'IV Push' | 'IV Infusion' | 'IM Injection' | 'SubQ';
  urgency: 'STAT Immediate' | 'Routine' | 'PRN Pain';
  assignedNurse: string;
  scheduledTime: string;
  status: 'Pending' | 'Administered' | 'Held';
  administeredAt?: string;
  nurseNotes?: string;
}

interface NurseAssignment {
  nurseId: string;
  nurseName: string;
  ward: string;
  assignedBeds: string[];
  shift: string;
  activeOrdersCount: number;
  status: 'On Duty' | 'In Ward' | 'On Break';
}

export const DoctorWorkspace: React.FC = () => {
  const { user, organization, logout } = useAuth();
  const { addToast } = useNotifications();

  // Active Navigation Tab inside Doctor Workspace
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CONSULTATION' | 'NURSE_ASSIGNMENTS' | 'TEST_REPORTS' | 'INJECTION_ORDERS' | 'ELEVENLABS_VOICE' | 'REPORT_CARDS'>('CONSULTATION');

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientVitals, setPatientVitals] = useState<VitalSign[]>([]);
  const [pastPrescriptions, setPastPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // AI & Voice States
  const [chiefComplaints, setChiefComplaints] = useState<string[]>(['Exertional chest tightness', 'Occasional palpitations']);
  const [symptomsText, setSymptomsText] = useState('Patient reports 3-week history of retrosternal discomfort on climbing stairs. Relieved by rest. No diaphoresis.');
  const [doctorNotes, setDoctorNotes] = useState('Normal S1/S2. Mild bilateral basal crackles. No peripheral edema.');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiDraft, setAiDraft] = useState<AiPrescriptionDraftResponse | null>(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  
  // ElevenLabs Voice Command & Synthesis States
  const [elevenLabsVoice, setElevenLabsVoice] = useState<'Dr. Adam (Clinical Male)' | 'Rachel (Executive Female)' | 'Domi (Urgent Telemetry)'>('Dr. Adam (Clinical Male)');
  const [elevenLabsText, setElevenLabsText] = useState('Nurse Sunita, please monitor patient Ramesh Kumar on Bed B-101. Administer 40mg IV Pantoprazole and record vitals every 2 hours.');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [vocalLogs, setVocalLogs] = useState<Array<{ id: string; time: string; target: string; text: string; voice: string }>>([
    { id: 'VOC-901', time: '14:10', target: 'Nurse Sunita (Ward A)', text: 'Prepare Bed B-102 for post-op appendectomy monitoring. Give Inj. Tramadol 50mg IV if VAS pain > 5.', voice: 'Dr. Adam (Clinical Male)' },
    { id: 'VOC-898', time: '12:30', target: 'ICU Nursing Team', text: 'STAT Arterial Blood Gas (ABG) sample required for Bed B-104.', voice: 'Rachel (Executive Female)' }
  ]);

  // Comprehensive Lab Test Reports Data
  const [selectedLabTest, setSelectedLabTest] = useState<LabReportDetail | null>(null);
  const [labReports, setLabReports] = useState<LabReportDetail[]>([
    {
      id: 'LAB-2026-8801',
      testName: 'Complete Blood Count (CBC) + Differential',
      category: 'Hematology',
      date: '2026-08-20 09:30',
      specimen: 'Venous Whole Blood (EDTA)',
      status: 'COMPLETED',
      doctorNotes: 'Mild leukocytosis noted, likely reactive. Hemoglobin and platelet count within normal physiological limits.',
      parameters: [
        { name: 'Hemoglobin (Hb)', value: '14.2', unit: 'g/dL', referenceRange: '13.5 - 17.5', flag: 'NORMAL' },
        { name: 'Total Leukocyte Count (WBC)', value: '11.8', unit: 'x10^3 / µL', referenceRange: '4.5 - 11.0', flag: 'HIGH' },
        { name: 'Absolute Neutrophil Count', value: '7.8', unit: 'x10^3 / µL', referenceRange: '2.0 - 7.5', flag: 'HIGH' },
        { name: 'Platelet Count', value: '280', unit: 'x10^3 / µL', referenceRange: '150 - 450', flag: 'NORMAL' },
        { name: 'Packed Cell Volume (PCV)', value: '42.5', unit: '%', referenceRange: '40 - 50', flag: 'NORMAL' },
      ]
    },
    {
      id: 'LAB-2026-8805',
      testName: 'Comprehensive Lipid & Cardiac Risk Profile',
      category: 'Biochemistry',
      date: '2026-08-20 10:15',
      specimen: 'Serum (Fasting 12h)',
      status: 'COMPLETED',
      doctorNotes: 'Elevated LDL Cholesterol and Triglycerides. High risk cardiovascular profile. Statin therapy recommended.',
      parameters: [
        { name: 'Total Serum Cholesterol', value: '242', unit: 'mg/dL', referenceRange: '< 200', flag: 'HIGH' },
        { name: 'LDL Cholesterol (Calculated)', value: '164', unit: 'mg/dL', referenceRange: '< 100', flag: 'CRITICAL' },
        { name: 'HDL Cholesterol (Good)', value: '38', unit: 'mg/dL', referenceRange: '> 40', flag: 'LOW' },
        { name: 'Serum Triglycerides', value: '210', unit: 'mg/dL', referenceRange: '< 150', flag: 'HIGH' },
        { name: 'Fasting Blood Glucose', value: '118', unit: 'mg/dL', referenceRange: '70 - 99', flag: 'HIGH' },
        { name: 'Serum Creatinine', value: '0.9', unit: 'mg/dL', referenceRange: '0.7 - 1.3', flag: 'NORMAL' }
      ]
    }
  ]);

  // Nurse Injection & Medication Orders Data
  const [injectionOrders, setInjectionOrders] = useState<NurseInjectionOrder[]>([
    {
      id: 'INJ-102',
      patientName: 'Ramesh Kumar',
      bed: 'Bed B-101 (Ward A)',
      medicationName: 'Inj. Pantoprazole 40mg',
      dosage: '40 mg IV Slow Push',
      route: 'IV Push',
      urgency: 'Routine',
      assignedNurse: 'Sunita Sharma, RN',
      scheduledTime: '14:00',
      status: 'Administered',
      administeredAt: '14:05',
      nurseNotes: 'Tolerated well. No phlebitis at IV site.'
    },
    {
      id: 'INJ-105',
      patientName: 'Sunita Devi',
      bed: 'Bed B-102 (Ward A)',
      medicationName: 'Inj. Tramadol 50mg in 100ml NS',
      dosage: '50 mg IV Infusion',
      route: 'IV Infusion',
      urgency: 'STAT Immediate',
      assignedNurse: 'Sunita Sharma, RN',
      scheduledTime: '14:30',
      status: 'Pending',
      nurseNotes: 'Awaiting nurse execution'
    },
    {
      id: 'INJ-109',
      patientName: 'Mohan Lal',
      bed: 'Bed B-105 (Ward A)',
      medicationName: 'Inj. Hydrocortisone 100mg',
      dosage: '100 mg IV Bolus',
      route: 'IV Push',
      urgency: 'STAT Immediate',
      assignedNurse: 'Anjali Nair, RN',
      scheduledTime: '15:00',
      status: 'Pending'
    }
  ]);

  // Nurse Assignments Roster State
  const [nurseRoster, setNurseRoster] = useState<NurseAssignment[]>([
    { nurseId: 'NSE-0042', nurseName: 'Sunita Sharma, RN', ward: 'General Ward A', assignedBeds: ['B-101', 'B-102', 'B-103'], shift: 'Afternoon (15-23h)', activeOrdersCount: 4, status: 'On Duty' },
    { nurseId: 'NSE-0015', nurseName: 'Anjali Nair, RN', ward: 'General Ward A / ICU', assignedBeds: ['B-104', 'B-105'], shift: 'Morning (07-15h)', activeOrdersCount: 2, status: 'In Ward' },
    { nurseId: 'NSE-0089', nurseName: 'Kiran Patel, RN', ward: 'Pediatrics Ward', assignedBeds: ['P-201', 'P-202'], shift: 'Night (23-07h)', activeOrdersCount: 1, status: 'On Duty' }
  ]);

  // New Injection Order Modal Form State
  const [showAddInjectionModal, setShowAddInjectionModal] = useState(false);
  const [newInjection, setNewInjection] = useState({
    patientName: 'Ramesh Kumar',
    bed: 'Bed B-101',
    medicationName: 'Inj. Ceftriaxone 1g',
    dosage: '1 g in 100ml NS over 30 mins',
    route: 'IV Infusion' as NurseInjectionOrder['route'],
    urgency: 'STAT Immediate' as NurseInjectionOrder['urgency'],
    assignedNurse: 'Sunita Sharma, RN'
  });

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
  const [showReportCardModal, setShowReportCardModal] = useState(false);
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

  // Play ElevenLabs Vocal Audio Simulation
  const handlePlayElevenLabsVoice = () => {
    setIsPlayingAudio(true);
    addToast('ElevenLabs AI Speech', `Playing synthetic speech via ${elevenLabsVoice} audio engine...`, 'info');
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 3500);
  };

  // Send Vocal Command to Nurse Station
  const handleSendVoiceCommandToNurse = () => {
    if (!elevenLabsText) return;
    const newLog = {
      id: `VOC-${Math.floor(Math.random() * 900 + 100)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      target: 'Sunita Sharma, RN (Ward A)',
      text: elevenLabsText,
      voice: elevenLabsVoice
    };
    setVocalLogs([newLog, ...vocalLogs]);
    addToast('Vocal Directive Sent', 'ElevenLabs voice command dispatched to Nurse Mobile Telemetry Station.', 'success');
  };

  // Add Injection Order to Nurse
  const handleAddInjectionOrder = () => {
    if (!newInjection.medicationName) return;
    const created: NurseInjectionOrder = {
      id: `INJ-${Math.floor(Math.random() * 900 + 100)}`,
      patientName: newInjection.patientName,
      bed: newInjection.bed,
      medicationName: newInjection.medicationName,
      dosage: newInjection.dosage,
      route: newInjection.route,
      urgency: newInjection.urgency,
      assignedNurse: newInjection.assignedNurse,
      scheduledTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Pending'
    };
    setInjectionOrders([created, ...injectionOrders]);
    setShowAddInjectionModal(false);
    addToast('Nurse Injection Order Created', `Order #${created.id} assigned to ${created.assignedNurse}.`, 'success');
  };

  // AI Full Prescription Generator
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

  const handleFinalizePrescription = async () => {
    if (!selectedPatient) return;
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
      setShowReportCardModal(true);
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

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientIdNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Professional Header Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 sticky top-0 z-40 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-base tracking-tight">AVORA</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Doctor Panel Studio
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Attending: <strong className="text-slate-800">{user?.name || 'Dr. Vikramaditya Singh, MD'}</strong> ({user?.specialization || 'Cardiology'})
            </p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('ELEVENLABS_VOICE')}
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold hover:bg-purple-100 transition"
          >
            <Volume2 className="w-4 h-4 text-purple-600" />
            <span>ElevenLabs Voice Engine</span>
          </button>

          <button
            onClick={() => setShowVoiceModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition"
          >
            <Mic className="w-4 h-4 text-rose-600 animate-pulse" />
            <span>Voice Dictation</span>
          </button>

          <NotificationBell dark={false} />

          <button
            onClick={logout}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold hover:bg-slate-200 transition"
          >
            <LogOut className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Layout Container with Doctor Navigation Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* DOCTOR FUNCTIONS NAVIGATION SIDEBAR */}
        <aside className="w-64 bg-white border-r border-slate-200 p-4 space-y-6 shrink-0 hidden md:block">
          <div>
            <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Doctor Functions</p>
            <nav className="space-y-1">
              {[
                { id: 'OVERVIEW', label: 'Dashboard Overview', icon: LayoutDashboard },
                { id: 'CONSULTATION', label: 'AI EHR & Consult Studio', icon: Stethoscope },
                { id: 'NURSE_ASSIGNMENTS', label: 'Nurse Duty Assignments', icon: Users },
                { id: 'TEST_REPORTS', label: 'Detailed Blood Tests', icon: Microscope },
                { id: 'INJECTION_ORDERS', label: 'Nurse Injections & Meds', icon: Syringe },
                { id: 'ELEVENLABS_VOICE', label: 'ElevenLabs Voice Studio', icon: Volume2 },
                { id: 'REPORT_CARDS', label: 'Patient Report Cards', icon: FileSpreadsheet }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Active Patient Box */}
          {selectedPatient && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2 text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">Selected Patient</span>
              <div>
                <p className="font-black text-slate-900">{selectedPatient.name}</p>
                <p className="text-[11px] text-slate-500 font-mono">{selectedPatient.patientIdNumber} • {selectedPatient.age}y {selectedPatient.gender}</p>
              </div>
              <button
                onClick={() => setActiveTab('REPORT_CARDS')}
                className="w-full py-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-700 font-bold text-[11px] hover:bg-indigo-100 transition shadow-2xs"
              >
                Generate Report Card
              </button>
            </div>
          )}
        </aside>

        {/* Mobile Navigation Tabs Header */}
        <div className="md:hidden flex overflow-x-auto gap-2 p-3 bg-white border-b border-slate-200 text-xs w-full">
          {[
            { id: 'OVERVIEW', label: 'Overview' },
            { id: 'CONSULTATION', label: 'Consult Studio' },
            { id: 'NURSE_ASSIGNMENTS', label: 'Nurse Duty' },
            { id: 'TEST_REPORTS', label: 'Blood Tests' },
            { id: 'INJECTION_ORDERS', label: 'Nurse Injections' },
            { id: 'ELEVENLABS_VOICE', label: 'ElevenLabs Voice' },
            { id: 'REPORT_CARDS', label: 'Report Cards' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap ${
                activeTab === t.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* MAIN VIEWPORT FRAME */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* TAB 1: CLEAN DASHBOARD OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Stat Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Consultations Today', value: '18 Patients', icon: User, color: 'text-indigo-600', sub: '4 Queue Active' },
                  { label: 'Pending Lab Test Reviews', value: '4 Reports', icon: Microscope, color: 'text-purple-600', sub: '2 STAT Urgent' },
                  { label: 'Nurse Injection Orders', value: `${injectionOrders.filter(i=>i.status==='Pending').length} Pending`, icon: Syringe, color: 'text-rose-600', sub: '3 Administered' },
                  { label: 'Voice Directives Sent', value: `${vocalLogs.length} Directives`, icon: Volume2, color: 'text-cyan-600', sub: 'ElevenLabs Engine' }
                ].map(card => {
                  const Icon = card.icon;
                  return (
                    <div key={card.label} className="rounded-3xl border border-slate-200/80 bg-white p-5 space-y-2 shadow-xs">
                      <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                        <span>{card.label}</span>
                        <Icon className={`w-4 h-4 ${card.color}`} />
                      </div>
                      <p className="text-2xl font-black text-slate-900">{card.value}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{card.sub}</p>
                    </div>
                  );
                })}
              </div>

              {/* Quick Consultation Queue & Live Nurse Directives Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Consultation Queue */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-indigo-600" />
                      <span>Today&apos;s Triage Consultation Queue</span>
                    </h3>
                    <button onClick={() => setActiveTab('CONSULTATION')} className="text-xs text-indigo-600 font-bold hover:underline">
                      Open Consult Studio →
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {patients.slice(0, 4).map(p => (
                      <div key={p.id} onClick={() => { selectPatient(p); setActiveTab('CONSULTATION'); }} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-indigo-50/50 cursor-pointer transition flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{p.name}</p>
                            <p className="text-[11px] text-slate-500">{p.patientIdNumber} • {p.age}y {p.gender}</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-600">
                          {p.bloodGroup}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ElevenLabs Eleven Voice Log Feed */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-purple-600" />
                      <span>Nurse Voice Directives (ElevenLabs Engine)</span>
                    </h3>
                    <button onClick={() => setActiveTab('ELEVENLABS_VOICE')} className="text-xs text-purple-600 font-bold hover:underline">
                      Launch Studio →
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {vocalLogs.map(log => (
                      <div key={log.id} className="p-3.5 rounded-2xl border border-purple-100 bg-purple-50/40 text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono font-bold text-purple-700">{log.id} • {log.target}</span>
                          <span className="text-slate-400">{log.time}</span>
                        </div>
                        <p className="text-slate-700 font-medium italic">&ldquo;{log.text}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI EHR & CONSULTATION ASSISTANT */}
          {activeTab === 'CONSULTATION' && (
            <div className="space-y-6">
              {/* Doctor Consultation Studio UI */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Queue (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Triage Queue</h2>
                      <span className="text-xs text-indigo-600 font-bold">{patients.length} active</span>
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
                            <div>
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

                  {selectedPatient && (
                    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
                          {selectedPatient.name.charAt(0)}
                        </div>
                        <div>
                          <h2 className="text-base font-black text-slate-900">{selectedPatient.name}</h2>
                          <p className="text-xs text-slate-500">MRN: <span className="font-mono font-bold text-slate-700">{selectedPatient.patientIdNumber}</span> • {selectedPatient.age}y</p>
                          <p className="text-[11px] text-slate-500">Blood Group: <strong className="text-indigo-600">{selectedPatient.bloodGroup}</strong></p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-800 mb-1">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Documented Allergies</span>
                        </div>
                        {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {selectedPatient.allergies.map((allergy, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold">{allergy}</span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-emerald-700 font-semibold">No known allergies</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Prescription Studio (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-indigo-600" />
                      <span>Clinical Assessment & Chief Complaints</span>
                    </h2>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Symptoms & Clinical Progression</label>
                        <textarea
                          rows={2}
                          value={symptomsText}
                          onChange={(e) => setSymptomsText(e.target.value)}
                          className="w-full p-3 text-xs font-medium rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Physician Examination Findings</label>
                        <input
                          type="text"
                          value={doctorNotes}
                          onChange={(e) => setDoctorNotes(e.target.value)}
                          className="w-full p-3 text-xs font-medium rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h2 className="text-base font-black text-slate-900">Prescription Specification</h2>
                      <button onClick={handleGenerateAiDraft} disabled={isGeneratingAi} className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold hover:bg-indigo-100">
                        ✨ Generate AI Draft
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Diagnosis</label>
                      <input
                        type="text"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        className="w-full p-3 text-xs font-bold rounded-2xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Medications Table */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Prescribed Oral Medications</span>
                        <button onClick={handleAddMedicineRow} className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
                          + Add Med
                        </button>
                      </div>
                      <div className="space-y-2.5">
                        {prescriptionItems.map((item, idx) => (
                          <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-2 text-xs items-center">
                            <input type="text" value={item.medicineName} onChange={e => { const val=e.target.value; setPrescriptionItems(p=>p.map((r,i)=>i===idx?{...r,medicineName:val}:r)); }} className="md:col-span-4 p-2 rounded-xl border border-slate-200 bg-white font-bold" placeholder="Medicine" />
                            <input type="text" value={item.dosage} onChange={e => { const val=e.target.value; setPrescriptionItems(p=>p.map((r,i)=>i===idx?{...r,dosage:val}:r)); }} className="md:col-span-2 p-2 rounded-xl border border-slate-200 bg-white font-semibold" placeholder="Dose" />
                            <input type="text" value={item.frequency} onChange={e => { const val=e.target.value; setPrescriptionItems(p=>p.map((r,i)=>i===idx?{...r,frequency:val}:r)); }} className="md:col-span-2 p-2 rounded-xl border border-slate-200 bg-white font-semibold" placeholder="Freq" />
                            <input type="text" value={item.instructions} onChange={e => { const val=e.target.value; setPrescriptionItems(p=>p.map((r,i)=>i===idx?{...r,instructions:val}:r)); }} className="md:col-span-3 p-2 rounded-xl border border-slate-200 bg-white" placeholder="Instructions" />
                            <button onClick={() => handleRemoveMedicineRow(idx)} className="md:col-span-1 p-1 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <button onClick={handleFinalizePrescription} disabled={isFinalizing} className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200">
                        Approve & Sign Prescription
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MANAGE NURSE ASSIGNMENTS */}
          {activeTab === 'NURSE_ASSIGNMENTS' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Nurse Assignments & Duty Roster</h2>
                  <p className="text-xs text-slate-500">Assign attending nurses to ward beds and dispatch shift instructions</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {nurseRoster.map(nurse => (
                  <div key={nurse.nurseId} className="rounded-3xl border border-slate-200/80 bg-white p-6 space-y-4 shadow-xs">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shadow-xs">
                          {nurse.nurseName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{nurse.nurseName}</h3>
                          <p className="text-[10px] text-slate-400 font-mono">{nurse.nurseId} • {nurse.ward}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {nurse.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 border-t border-b border-slate-100 py-3">
                      <div className="flex justify-between"><span>Assigned Beds:</span><span className="font-mono font-bold text-slate-800">{nurse.assignedBeds.join(', ')}</span></div>
                      <div className="flex justify-between"><span>Shift:</span><span className="font-semibold text-slate-700">{nurse.shift}</span></div>
                      <div className="flex justify-between"><span>Active Med Orders:</span><span className="font-mono font-bold text-indigo-600">{nurse.activeOrdersCount} Pending</span></div>
                    </div>

                    <button
                      onClick={() => {
                        setElevenLabsText(`Nurse ${nurse.nurseName.split(' ')[0]}, please review vitals for ${nurse.assignedBeds.join(' and ')}.`);
                        setActiveTab('ELEVENLABS_VOICE');
                      }}
                      className="w-full py-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 font-bold text-xs hover:bg-purple-100 transition flex items-center justify-center gap-2"
                    >
                      <Volume2 className="w-4 h-4 text-purple-600" />
                      <span>Send Voice Instruction</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: COMPREHENSIVE LAB TEST REPORTS */}
          {activeTab === 'TEST_REPORTS' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Detailed Patient Lab & Diagnostic Reports</h2>
                  <p className="text-xs text-slate-500">Comprehensive hematology, lipid profiles, metabolic panels & ECG waveforms</p>
                </div>
              </div>

              <div className="space-y-6">
                {labReports.map(report => (
                  <div key={report.id} className="rounded-3xl border border-slate-200/80 bg-white p-6 space-y-4 shadow-xs">
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-purple-600 uppercase tracking-wider">{report.id} • {report.category}</span>
                        <h3 className="text-base font-black text-slate-900 mt-0.5">{report.testName}</h3>
                        <p className="text-xs text-slate-400">Specimen: {report.specimen} • Collected: {report.date}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {report.status}
                      </span>
                    </div>

                    {/* Detailed Parameter Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-500 font-mono border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-2.5">Parameter Name</th>
                            <th className="px-4 py-2.5">Result Value</th>
                            <th className="px-4 py-2.5">Reference Range</th>
                            <th className="px-4 py-2.5">Status Flag</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {report.parameters.map((p, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-4 py-2.5 font-semibold text-slate-800">{p.name}</td>
                              <td className="px-4 py-2.5 font-bold font-mono text-slate-900">{p.value} {p.unit}</td>
                              <td className="px-4 py-2.5 text-slate-500 font-mono">{p.referenceRange} {p.unit}</td>
                              <td className="px-4 py-2.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  p.flag === 'CRITICAL' ? 'bg-rose-600 text-white' :
                                  p.flag === 'HIGH' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                  p.flag === 'LOW' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                  'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}>
                                  {p.flag}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 text-xs text-purple-900">
                      <strong className="font-bold">Attending Doctor Interpretation Notes:</strong>
                      <p className="mt-1 text-slate-700">{report.doctorNotes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PRESCRIBING & MANAGING MEDICATION & INJECTIONS FOR NURSES */}
          {activeTab === 'INJECTION_ORDERS' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Nurse Medication & Injection Execution Orders</h2>
                  <p className="text-xs text-slate-500">Order intravenous (IV) push, infusions, and IM injections for nurse administration</p>
                </div>
                <button
                  onClick={() => setShowAddInjectionModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Order New IV / Injection</span>
                </button>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-mono border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5">Order ID</th>
                      <th className="px-5 py-3.5">Patient & Bed</th>
                      <th className="px-5 py-3.5">Medication / Injection</th>
                      <th className="px-5 py-3.5">Route</th>
                      <th className="px-5 py-3.5">Assigned Nurse</th>
                      <th className="px-5 py-3.5">Urgency</th>
                      <th className="px-5 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {injectionOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="px-5 py-4 font-mono font-bold text-indigo-600">{order.id}</td>
                        <td className="px-5 py-4 font-bold text-slate-900">{order.patientName}<br/><span className="text-[10px] font-normal text-slate-400">{order.bed}</span></td>
                        <td className="px-5 py-4 font-bold text-slate-800">{order.medicationName}<br/><span className="text-[10px] font-normal text-slate-500">{order.dosage}</span></td>
                        <td className="px-5 py-4"><span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[10px]">{order.route}</span></td>
                        <td className="px-5 py-4 font-semibold">{order.assignedNurse}</td>
                        <td className="px-5 py-4 font-bold text-rose-600">{order.urgency}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            order.status === 'Administered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: ELEVENLABS VOICE-COMMAND STUDIO */}
          {activeTab === 'ELEVENLABS_VOICE' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
                  <Volume2 className="w-4 h-4 text-purple-600 animate-pulse" />
                  <span>ElevenLabs Voice AI Technology</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">ElevenLabs Vocal Directive & Report Studio</h2>
                <p className="text-xs text-slate-500">Synthesize realistic physician voice instructions for nurse stations & clinical reports</p>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 space-y-6 shadow-sm">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Select ElevenLabs Synthetic Physician Voice</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      'Dr. Adam (Clinical Male)',
                      'Rachel (Executive Female)',
                      'Domi (Urgent Telemetry)'
                    ].map(v => (
                      <button
                        key={v}
                        onClick={() => setElevenLabsVoice(v as any)}
                        className={`p-3 rounded-2xl border text-xs font-bold text-left transition ${
                          elevenLabsVoice === v ? 'bg-purple-600 text-white shadow-md shadow-purple-200 border-purple-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Physician Vocal Directive / Clinical Summary</label>
                  <textarea
                    rows={4}
                    value={elevenLabsText}
                    onChange={(e) => setElevenLabsText(e.target.value)}
                    placeholder="Type or dictate spoken instructions..."
                    className="w-full p-4 text-xs font-medium rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handlePlayElevenLabsVoice}
                    disabled={isPlayingAudio}
                    className="flex-1 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isPlayingAudio ? (
                      <>
                        <Volume2 className="w-4 h-4 animate-bounce" />
                        <span>Playing ElevenLabs Voice Audio...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Synthesize & Play Voice Audio</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSendVoiceCommandToNurse}
                    className="flex-1 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Dispatch Voice Directive to Nurse Station</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PATIENT REPORT CARD GENERATOR & DOWNLOADER */}
          {activeTab === 'REPORT_CARDS' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Patient Medical Report Card Studio</h2>
                  <p className="text-xs text-slate-500">Official medical summary card with diagnostics, medications & digital doctor signature</p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download / Print Report Card</span>
                </button>
              </div>

              {selectedPatient && (
                <div className="rounded-3xl border border-slate-300 bg-white p-8 space-y-6 shadow-xl relative">
                  {/* Watermark Logo */}
                  <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-6 h-6 text-indigo-600" />
                        <span className="font-black text-2xl text-slate-900">AVORA Hospital</span>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold">Institutional Health System & Medical Research Center</p>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-mono font-bold">
                        OFFICIAL MEDICAL CARD
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">Generated: 2026-08-20</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                    <div><p className="text-slate-400 font-bold uppercase text-[10px]">Patient Name</p><p className="font-bold text-slate-900 text-sm">{selectedPatient.name}</p></div>
                    <div><p className="text-slate-400 font-bold uppercase text-[10px]">Medical Record Number (MRN)</p><p className="font-mono font-bold text-slate-900 text-sm">{selectedPatient.patientIdNumber}</p></div>
                    <div><p className="text-slate-400 font-bold uppercase text-[10px]">Age / Gender</p><p className="font-bold text-slate-800">{selectedPatient.age} Years / {selectedPatient.gender}</p></div>
                    <div><p className="text-slate-400 font-bold uppercase text-[10px]">Attending Doctor</p><p className="font-bold text-slate-800">Dr. Vikramaditya Singh, MD</p></div>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Confirmed Clinical Diagnosis</h3>
                    <p className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs font-bold text-indigo-900">{diagnosis}</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Prescribed Oral & IV Medications</h3>
                    <div className="space-y-1.5">
                      {prescriptionItems.map((item, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex justify-between text-xs font-medium">
                          <span>{item.medicineName} ({item.dosage})</span>
                          <span className="font-bold font-mono text-indigo-600">{item.frequency}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs font-semibold">
                    <div className="space-y-1">
                      <p className="text-slate-400 text-[10px] font-bold">DIGITAL VERIFICATION QR</p>
                      <div className="w-16 h-16 bg-slate-900 rounded-xl text-white font-mono text-[8px] flex items-center justify-center p-1 text-center">
                        QR-VERIFIED SIG-2026
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-bold text-slate-900">Dr. Vikramaditya Singh, MD (AIIMS)</p>
                      <p className="text-[10px] text-slate-400 font-mono">Digital Signature Hash: SIG-SHA256-88091A</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* New Nurse Injection Order Modal */}
      {showAddInjectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Order Nurse Medication / Injection</h3>
              <button onClick={() => setShowAddInjectionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Medication / Injection Name</label>
                <input
                  type="text"
                  value={newInjection.medicationName}
                  onChange={e => setNewInjection({ ...newInjection, medicationName: e.target.value })}
                  placeholder="e.g. Inj. Pantoprazole 40mg IV"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Route</label>
                  <select
                    value={newInjection.route}
                    onChange={e => setNewInjection({ ...newInjection, route: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  >
                    <option value="IV Push">IV Push</option>
                    <option value="IV Infusion">IV Infusion</option>
                    <option value="IM Injection">IM Injection</option>
                    <option value="SubQ">SubQ</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Urgency</label>
                  <select
                    value={newInjection.urgency}
                    onChange={e => setNewInjection({ ...newInjection, urgency: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  >
                    <option value="STAT Immediate">STAT Immediate</option>
                    <option value="Routine">Routine</option>
                    <option value="PRN Pain">PRN Pain</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowAddInjectionModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs">
                Cancel
              </button>
              <button onClick={handleAddInjectionOrder} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md">
                Dispatch Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
