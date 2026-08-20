import React, { useState } from 'react';
import {
  LayoutDashboard, CalendarDays, Clock, Pill, Users, UserPlus,
  FileText, User, Settings, LogOut, Menu, X, Bell, Search,
  BedDouble, Heart, Activity, CheckCircle2, AlertTriangle,
  ChevronRight, ChevronLeft, Plus, Download, Printer, Eye,
  Calendar, Edit, Save, TrendingUp, Info, CheckCircle, Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useNotifications } from '../../context/NotificationContext.js';

type NurseView =
  | 'DASHBOARD' | 'SCHEDULE' | 'ATTENDANCE' | 'MAR'
  | 'PATIENTS' | 'ADMIT' | 'REPORTS' | 'PROFILE' | 'SETTINGS' | 'MANAGE_NURSE';

interface StaffNurse {
  id: string;
  name: string;
  email: string;
  phone: string;
  ward: string;
  shift: string;
  regNo: string;
  status: 'Active' | 'On Leave' | 'Off Duty';
}

interface NursePatient {
  id: string; name: string; age: number; gender: string;
  bed: string; ward: string; admissionDate: string; diagnosis: string;
  doctor: string; condition: 'Stable' | 'Critical' | 'Improving' | 'Serious';
  priority: 'High' | 'Medium' | 'Low'; allergies: string[]; phone: string;
  bloodGroup: string; weight: number; height: number;
}
interface MAREntry {
  id: string; patientName: string; patientId: string; bed: string;
  medicine: string; dosage: string; route: string; frequency: string;
  scheduledTime: string; doctor: string; instructions: string;
  status: 'Given' | 'Pending' | 'Missed' | 'Refused' | 'Held';
  givenAt?: string; notes?: string;
}
interface NurseAssignment {
  id: string;
  date: string;
  ward: string;
  beds: string[];
  nurses: string[];
}
interface DailyAttendance {
  nurseId: string;
  nurseName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hours: number;
  overtime: number;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
}

const NURSE_PATIENTS: NursePatient[] = [
  { id: 'P001', name: 'Ramesh Kumar', age: 58, gender: 'Male', bed: 'B-101', ward: 'General Ward A', admissionDate: '2026-08-15', diagnosis: 'Hypertension + Diabetes', doctor: 'Dr. Anjali Mehta', condition: 'Stable', priority: 'Medium', allergies: ['Penicillin'], phone: '+91 98765 43210', bloodGroup: 'O+', weight: 78, height: 172 },
  { id: 'P002', name: 'Sunita Devi', age: 45, gender: 'Female', bed: 'B-102', ward: 'General Ward A', admissionDate: '2026-08-18', diagnosis: 'Post-op Appendectomy', doctor: 'Dr. Vikram Singh', condition: 'Improving', priority: 'High', allergies: ['Sulfa'], phone: '+91 87654 32109', bloodGroup: 'A+', weight: 62, height: 158 },
  { id: 'P003', name: 'Arjun Reddy', age: 32, gender: 'Male', bed: 'B-103', ward: 'General Ward A', admissionDate: '2026-08-19', diagnosis: 'Pneumonia', doctor: 'Dr. Anjali Mehta', condition: 'Serious', priority: 'High', allergies: [], phone: '+91 76543 21098', bloodGroup: 'B-', weight: 70, height: 175 },
  { id: 'P004', name: 'Priya Sharma', age: 27, gender: 'Female', bed: 'B-104', ward: 'General Ward A', admissionDate: '2026-08-20', diagnosis: 'Gastroenteritis', doctor: 'Dr. Rohit Gupta', condition: 'Improving', priority: 'Low', allergies: ['Aspirin'], phone: '+91 65432 10987', bloodGroup: 'AB+', weight: 55, height: 162 },
  { id: 'P005', name: 'Mohan Lal', age: 71, gender: 'Male', bed: 'B-105', ward: 'General Ward A', admissionDate: '2026-08-14', diagnosis: 'COPD Exacerbation', doctor: 'Dr. Anjali Mehta', condition: 'Critical', priority: 'High', allergies: ['Codeine', 'NSAIDs'], phone: '+91 54321 09876', bloodGroup: 'O-', weight: 65, height: 168 },
];
const SCHEDULE_DATA = [
  { day: 'Monday', date: '2026-08-17', shift: 'Morning', start: '07:00', end: '15:00', ward: 'General Ward A', status: 'Completed' },
  { day: 'Tuesday', date: '2026-08-18', shift: 'Morning', start: '07:00', end: '15:00', ward: 'General Ward A', status: 'Completed' },
  { day: 'Wednesday', date: '2026-08-19', shift: 'Afternoon', start: '15:00', end: '23:00', ward: 'General Ward A', status: 'Completed' },
  { day: 'Thursday', date: '2026-08-20', shift: 'Afternoon', start: '15:00', end: '23:00', ward: 'General Ward A', status: 'Active' },
  { day: 'Friday', date: '2026-08-21', shift: 'Night', start: '23:00', end: '07:00', ward: 'General Ward A', status: 'Upcoming' },
  { day: 'Saturday', date: '2026-08-22', shift: 'Off', start: '-', end: '-', ward: '-', status: 'Leave' },
  { day: 'Sunday', date: '2026-08-23', shift: 'Morning', start: '07:00', end: '15:00', ward: 'General Ward A', status: 'Upcoming' },
];
const ATTENDANCE_DATA = [
  { date: '2026-08-20', checkIn: '14:52', checkOut: '-', hours: 0, status: 'Present', overtime: 0 },
  { date: '2026-08-19', checkIn: '14:58', checkOut: '23:05', hours: 8.1, status: 'Present', overtime: 0.1 },
  { date: '2026-08-18', checkIn: '07:03', checkOut: '15:07', hours: 8.1, status: 'Present', overtime: 0.1 },
  { date: '2026-08-17', checkIn: '07:15', checkOut: '15:20', hours: 8.1, status: 'Late', overtime: 0 },
  { date: '2026-08-16', checkIn: '-', checkOut: '-', hours: 0, status: 'Leave', overtime: 0 },
  { date: '2026-08-15', checkIn: '22:58', checkOut: '07:02', hours: 8.1, status: 'Present', overtime: 0.1 },
  { date: '2026-08-14', checkIn: '07:00', checkOut: '15:00', hours: 8, status: 'Present', overtime: 0 },
];
const INITIAL_MAR: MAREntry[] = [
  { id: 'M001', patientName: 'Ramesh Kumar', patientId: 'P001', bed: 'B-101', medicine: 'Metformin 500mg', dosage: '500mg', route: 'Oral', frequency: 'BD', scheduledTime: '14:00', doctor: 'Dr. Anjali Mehta', instructions: 'Give with meals', status: 'Pending' },
  { id: 'M002', patientName: 'Ramesh Kumar', patientId: 'P001', bed: 'B-101', medicine: 'Amlodipine 5mg', dosage: '5mg', route: 'Oral', frequency: 'OD', scheduledTime: '08:00', doctor: 'Dr. Anjali Mehta', instructions: 'Morning dose', status: 'Given', givenAt: '08:05', notes: 'Patient tolerated well' },
  { id: 'M003', patientName: 'Sunita Devi', patientId: 'P002', bed: 'B-102', medicine: 'Tramadol 50mg', dosage: '50mg', route: 'IV', frequency: 'TDS', scheduledTime: '14:00', doctor: 'Dr. Vikram Singh', instructions: 'Administer slowly over 15 min', status: 'Pending' },
  { id: 'M004', patientName: 'Arjun Reddy', patientId: 'P003', bed: 'B-103', medicine: 'Azithromycin 500mg', dosage: '500mg', route: 'IV', frequency: 'OD', scheduledTime: '12:00', doctor: 'Dr. Anjali Mehta', instructions: 'Infuse over 60 min', status: 'Missed' },
  { id: 'M005', patientName: 'Mohan Lal', patientId: 'P005', bed: 'B-105', medicine: 'Prednisolone 20mg', dosage: '20mg', route: 'Oral', frequency: 'BD', scheduledTime: '14:00', doctor: 'Dr. Anjali Mehta', instructions: 'Give with food', status: 'Pending' },
  { id: 'M006', patientName: 'Priya Sharma', patientId: 'P004', bed: 'B-104', medicine: 'ORS Sachets', dosage: '200ml', route: 'Oral', frequency: 'QID', scheduledTime: '16:00', doctor: 'Dr. Rohit Gupta', instructions: 'After each loose stool', status: 'Held' },
];

const badge = (status: string) => {
  const m: Record<string,string> = {
    Stable:'bg-emerald-50 text-emerald-700 border-emerald-200',Critical:'bg-red-50 text-red-700 border-red-200',
    Improving:'bg-blue-50 text-blue-700 border-blue-200',Serious:'bg-orange-50 text-orange-700 border-orange-200',
    Completed:'bg-emerald-50 text-emerald-700 border-emerald-200',Active:'bg-sky-50 text-sky-700 border-sky-200',
    Upcoming:'bg-indigo-50 text-indigo-700 border-indigo-200',Leave:'bg-amber-50 text-amber-700 border-amber-200',
    Absent:'bg-red-50 text-red-700 border-red-200',Present:'bg-emerald-50 text-emerald-700 border-emerald-200',
    Late:'bg-amber-50 text-amber-700 border-amber-200',Given:'bg-emerald-50 text-emerald-700 border-emerald-200',
    Pending:'bg-amber-50 text-amber-700 border-amber-200',Missed:'bg-red-50 text-red-700 border-red-200',
    Refused:'bg-orange-50 text-orange-700 border-orange-200',Held:'bg-slate-100 text-slate-600 border-slate-200',
    High:'bg-red-50 text-red-700 border-red-200',Medium:'bg-amber-50 text-amber-700 border-amber-200',Low:'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  return `inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${m[status]||'bg-slate-100 text-slate-600 border-slate-200'}`;
};

export const NurseDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { addToast } = useNotifications();
  const [activeView, setActiveView] = useState<NurseView>('DASHBOARD');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<NursePatient | null>(null);
  const [marData, setMarData] = useState<MAREntry[]>(INITIAL_MAR);
  const [selectedMar, setSelectedMar] = useState<MAREntry | null>(null);
  const [showMARModal, setShowMARModal] = useState(false);
  const [marNote, setMarNote] = useState('');
  const [marStatus, setMarStatus] = useState<MAREntry['status']>('Given');
  const [admitStep, setAdmitStep] = useState(1);
  const [showNotif, setShowNotif] = useState(false);
  const [admitForm, setAdmitForm] = useState({
    firstName: '', lastName: '', dob: '', gender: '', phone: '', email: '',
    address: '', emergencyName: '', emergencyPhone: '', bloodGroup: '',
    allergies: '', medHistory: '', diagnosis: '', doctor: '', admitDate: '',
    ward: 'General Ward A', bed: 'B-106',
  });

  const [nursesList, setNursesList] = useState<StaffNurse[]>([
    { id: 'NSE-2024-0042', name: 'Sunita Sharma', email: 'sunita.s@hospital.org', phone: '+91 98765 43210', ward: 'General Ward A', shift: 'Afternoon (15-23h)', regNo: 'MNC-2020-4892', status: 'Active' },
    { id: 'NSE-2024-0015', name: 'Anjali Nair', email: 'anjali.n@hospital.org', phone: '+91 98765 11223', ward: 'ICU', shift: 'Morning (07-15h)', regNo: 'MNC-2018-9921', status: 'Active' },
    { id: 'NSE-2024-0089', name: 'Kiran Patel', email: 'kiran.p@hospital.org', phone: '+91 98765 55667', ward: 'Pediatrics', shift: 'Night (23-07h)', regNo: 'MNC-2021-3141', status: 'On Leave' },
    { id: 'NSE-2024-0102', name: 'Merlin Joseph', email: 'merlin.j@hospital.org', phone: '+91 98765 99887', ward: 'Maternity', shift: 'Morning (07-15h)', regNo: 'MNC-2022-8091', status: 'Off Duty' }
  ]);
  const [showAddNurse, setShowAddNurse] = useState(false);
  const [newNurse, setNewNurse] = useState<Partial<StaffNurse>>({
    name: '', email: '', phone: '', ward: 'General Ward A', shift: 'Morning (07-15h)', status: 'Active'
  });

  const [assignments, setAssignments] = useState<NurseAssignment[]>([
    { id: 'A1', date: '2026-08-20', ward: 'General Ward A', beds: ['B-101', 'B-102'], nurses: ['Sunita Sharma'] },
    { id: 'A2', date: '2026-08-20', ward: 'ICU', beds: ['B-201'], nurses: ['Anjali Nair'] },
  ]);
  const [patients, setPatients] = useState<NursePatient[]>(NURSE_PATIENTS);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [editingNurseId, setEditingNurseId] = useState<string | null>(null);
  const [assignForm, setAssignForm] = useState({
    date: '2026-08-20',
    ward: 'General Ward A',
    customWard: '',
    selectedBeds: [] as string[],
    selectedNurses: [] as string[],
  });
  const [wardsList, setWardsList] = useState<string[]>(['General Ward A', 'ICU', 'Pediatrics', 'Maternity']);
  const [bedsList, setBedsList] = useState<string[]>(['B-101', 'B-102', 'B-103', 'B-104']);
  const [newWardInput, setNewWardInput] = useState('');
  const [newBedInput, setNewBedInput] = useState('');
  const [showAssignForm, setShowAssignForm] = useState(false);

  const [attendanceRecords, setAttendanceRecords] = useState<DailyAttendance[]>([
    { nurseId: 'NSE-2024-0042', nurseName: 'Sunita Sharma', date: '2026-08-20', checkIn: '14:52', checkOut: '-', hours: 0, overtime: 0, status: 'Present' },
    { nurseId: 'NSE-2024-0015', nurseName: 'Anjali Nair', date: '2026-08-20', checkIn: '07:05', checkOut: '15:10', hours: 8, overtime: 0.1, status: 'Present' },
    { nurseId: 'NSE-2024-0089', nurseName: 'Kiran Patel', date: '2026-08-20', checkIn: '-', checkOut: '-', hours: 0, overtime: 0, status: 'Leave' },
    { nurseId: 'NSE-2024-0102', nurseName: 'Merlin Joseph', date: '2026-08-20', checkIn: '-', checkOut: '-', hours: 0, overtime: 0, status: 'Absent' },
  ]);
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState('2026-08-20');

  const navItems = [
    { id: 'DASHBOARD' as NurseView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'SCHEDULE' as NurseView, label: 'Duty Schedule', icon: CalendarDays },
    { id: 'ATTENDANCE' as NurseView, label: 'Attendance', icon: Clock },
    { id: 'MAR' as NurseView, label: 'Medicine Admin.', icon: Pill },
    { id: 'PATIENTS' as NurseView, label: 'Patients', icon: Users },
    { id: 'ADMIT' as NurseView, label: 'Admit New Patient', icon: UserPlus },
    { id: 'REPORTS' as NurseView, label: 'Reports', icon: FileText },
    { id: 'MANAGE_NURSE' as NurseView, label: 'Manage Nurses', icon: Users },
    { id: 'PROFILE' as NurseView, label: 'Profile', icon: User },
    { id: 'SETTINGS' as NurseView, label: 'Settings', icon: Settings },
  ];

  const pendingMeds = marData.filter(m => m.status === 'Pending').length;
  const criticalPts = patients.filter(p => p.condition === 'Critical').length;
  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [medNameEdit, setMedNameEdit] = useState('');
  const [medDoseEdit, setMedDoseEdit] = useState('');
  const [medRouteEdit, setMedRouteEdit] = useState('');
  const [medFreqEdit, setMedFreqEdit] = useState('');
  const [medTimeEdit, setMedTimeEdit] = useState('');

  // Option lists for MAR Modal dropdown selectors
  const [medNamesList, setMedNamesList] = useState<string[]>(['Metformin 500mg', 'Amlodipine 5mg', 'Tramadol 50mg', 'Azithromycin 500mg', 'Prednisolone 20mg', 'ORS Sachets']);
  const [dosagesList, setDosagesList] = useState<string[]>(['500mg', '5mg', '50mg', '250mg', '20mg', '200ml']);
  const [routesList, setRoutesList] = useState<string[]>(['Oral', 'IV', 'IM', 'Subcut', 'Inhaled']);
  const [frequenciesList, setFrequenciesList] = useState<string[]>(['OD', 'BD', 'TDS', 'QID', 'PRN']);
  const [timesList, setTimesList] = useState<string[]>(['08:00', '12:00', '14:00', '16:00', '20:00', '22:00']);

  // Inputs for adding new options
  const [newMedNameOpt, setNewMedNameOpt] = useState('');
  const [newDosageOpt, setNewDosageOpt] = useState('');
  const [newRouteOpt, setNewRouteOpt] = useState('');
  const [newFreqOpt, setNewFreqOpt] = useState('');
  const [newTimeOpt, setNewTimeOpt] = useState('');

  const openMAR = (m: MAREntry) => {
    setSelectedMar(m);
    setMarStatus(m.status === 'Pending' ? 'Given' : m.status);
    setMarNote(m.notes || '');
    setMedNameEdit(m.medicine);
    setMedDoseEdit(m.dosage);
    setMedRouteEdit(m.route);
    setMedFreqEdit(m.frequency);
    setMedTimeEdit(m.scheduledTime);
    setShowMARModal(true);
  };

  const saveMAR = () => {
    if (!selectedMar) return;
    const now = new Date();
    const t = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    setMarData(prev => prev.map(m => m.id === selectedMar.id
      ? { 
          ...m, 
          status: marStatus, 
          givenAt: marStatus === 'Given' ? t : m.givenAt, 
          notes: marNote,
          medicine: medNameEdit,
          dosage: medDoseEdit,
          route: medRouteEdit,
          frequency: medFreqEdit,
          scheduledTime: medTimeEdit
        }
      : m
    ));
    setShowMARModal(false);
    addToast('MAR Updated', `Medication administration saved for ${selectedMar.patientName}`, 'success');
  };

  const handleAdmit = () => {
    const newId = `P0${Math.floor(10 + Math.random() * 90)}`;
    const newPatient: NursePatient = {
      id: newId,
      name: `${admitForm.firstName} ${admitForm.lastName}`,
      age: admitForm.dob ? new Date().getFullYear() - new Date(admitForm.dob).getFullYear() : 35,
      gender: admitForm.gender || 'Male',
      bed: admitForm.bed,
      ward: admitForm.ward,
      admissionDate: admitForm.admitDate || new Date().toISOString().split('T')[0],
      diagnosis: admitForm.diagnosis || 'General Observation',
      doctor: admitForm.doctor || 'Dr. Anjali Mehta',
      condition: 'Stable',
      priority: 'Medium',
      allergies: admitForm.allergies ? admitForm.allergies.split(',').map(a => a.trim()) : [],
      phone: admitForm.phone || '+91 99999 88888',
      bloodGroup: admitForm.bloodGroup || 'O+',
      weight: 70,
      height: 170
    };

    setPatients(p => [...p, newPatient]);
    addToast('Patient Admitted', `${admitForm.firstName} ${admitForm.lastName} admitted to ${admitForm.bed}`, 'success');
    setAdmitStep(1);
    setAdmitForm({ firstName:'',lastName:'',dob:'',gender:'',phone:'',email:'',address:'',emergencyName:'',emergencyPhone:'',bloodGroup:'',allergies:'',medHistory:'',diagnosis:'',doctor:'',admitDate:'',ward:'General Ward A',bed:'B-106' });
    setActiveView('PATIENTS');
  };

  // â”€â”€ Sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const SidebarEl = () => (
    <>
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col bg-white border-r border-slate-200 shadow-xl lg:shadow-none transition-transform duration-300 h-full shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-sky-600 to-indigo-700 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-black text-white text-sm">PulseCloud</p>
              <p className="text-[10px] text-sky-200 font-semibold">Nurse Portal</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 py-3.5 border-b border-slate-100 bg-sky-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0 ring-2 ring-sky-200">
              {(user?.name || 'Sunita Sharma').charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{user?.name || 'Sunita Sharma'}</p>
              <p className="text-[11px] text-sky-600 font-semibold truncate">Staff Nurse, RN · Ward A</p>
              <p className="text-[10px] text-slate-400 font-mono">NSE-2024-0042</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveView(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-sky-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <Icon style={{width:18,height:18}} className="shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === 'MAR' && pendingMeds > 0 && <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{pendingMeds}</span>}
                {item.id === 'PATIENTS' && criticalPts > 0 && <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{criticalPts}</span>}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-100 shrink-0">
          <button onClick={() => { if (window.confirm('Logout?')) logout(); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all">
            <LogOut style={{width:18,height:18}} className="shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );

  // â”€â”€ TopBar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const TopBarEl = () => (
    <header className="flex items-center justify-between h-14 px-4 md:px-6 border-b border-slate-200 bg-white shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-slate-800 text-base hidden sm:block">{navItems.find(n => n.id === activeView)?.label}</h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search patients..." className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-sky-400 w-48" />
        </div>
        <div className="relative">
          <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-800 text-sm">Notifications</span>
                <button onClick={() => setShowNotif(false)}><X className="w-4 h-4 text-slate-400" /></button>
              </div>
              {[
                { msg: 'Mohan Lal vitals critical â€“ check immediately', type: 'critical', time: '5m ago' },
                { msg: 'Medication due for Ramesh Kumar at 14:00', type: 'warning', time: '10m ago' },
                { msg: 'New patient admitted to B-106', type: 'info', time: '1h ago' },
              ].map((n, i) => (
                <div key={i} className={`px-4 py-3 border-b border-slate-50 flex gap-3 ${n.type==='critical'?'bg-red-50':n.type==='warning'?'bg-amber-50':'bg-sky-50'}`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type==='critical'?'bg-red-500 animate-pulse':n.type==='warning'?'bg-amber-500':'bg-sky-500'}`} />
                  <div><p className="text-xs text-slate-700 font-medium">{n.msg}</p><p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p></div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 pl-1">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-slate-800 leading-none">{user?.name || 'Sunita Sharma'}</p>
            <p className="text-[11px] text-sky-600 font-semibold mt-0.5">Staff Nurse · RN</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md ring-2 ring-sky-200">
            {(user?.name || 'Sunita Sharma').charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );

  // â”€â”€ Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const DashboardV = () => (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-3xl font-black shadow-xl">
            {(user?.name || 'Sunita Sharma').charAt(0)}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-black text-white">{user?.name || 'Sunita Sharma'}</h2>
              <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full border border-white/30">Staff Nurse</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[{label:'Nurse ID',value:'NSE-2024-0042'},{label:'Ward',value:'General Ward A'},{label:'Shift',value:'Afternoon (15-23h)'},{label:'Department',value:'General Medicine'}].map(item => (
                <div key={item.label} className="bg-white/10 rounded-xl p-2 border border-white/15">
                  <p className="text-sky-200 text-[10px] font-semibold uppercase">{item.label}</p>
                  <p className="text-white text-xs font-bold mt-0.5 truncate">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {label:'Total Beds',value:8,icon:BedDouble,c:'sky'},
          {label:'Patients',value:5,icon:Users,c:'blue'},
          {label:'Beds Free',value:3,icon:BedDouble,c:'emerald'},
          {label:'Meds Due',value:pendingMeds,icon:Pill,c:'amber'},
          {label:'Missed',value:marData.filter(m=>m.status==='Missed').length,icon:AlertTriangle,c:'red'},
          {label:'Critical',value:criticalPts,icon:Heart,c:'rose'},
        ].map(s => {
          const Icon = s.icon;
          const bgs: Record<string,string> = {sky:'bg-sky-50 border-sky-200',blue:'bg-blue-50 border-blue-200',emerald:'bg-emerald-50 border-emerald-200',amber:'bg-amber-50 border-amber-200',red:'bg-red-50 border-red-200',rose:'bg-rose-50 border-rose-200'};
          const ics: Record<string,string> = {sky:'text-sky-600',blue:'text-blue-600',emerald:'text-emerald-600',amber:'text-amber-600',red:'text-red-600',rose:'text-rose-600'};
          return (
            <div key={s.label} className={`rounded-2xl border p-4 ${bgs[s.c]}`}>
              <Icon className={`w-5 h-5 mb-2 ${ics[s.c]}`} />
              <p className="text-2xl font-black text-slate-800">{s.value}</p>
              <p className="text-[11px] font-bold text-slate-500 uppercase">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2"><Users className="w-4 h-4 text-sky-600" />Assigned Patients</h3>
            <button onClick={() => setActiveView('PATIENTS')} className="text-xs text-sky-600 font-semibold flex items-center gap-1">View All<ChevronRight className="w-3 h-3" /></button>
          </div>
          <div className="divide-y divide-slate-50">
            {NURSE_PATIENTS.slice(0,5).map(p => (
              <div key={p.id} onClick={() => { setSelectedPatient(p); setActiveView('PATIENTS'); }} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${p.condition==='Critical'?'bg-red-100 text-red-700':p.condition==='Stable'?'bg-emerald-100 text-emerald-700':'bg-sky-100 text-sky-700'}`}>{p.name.charAt(0)}</div>
                  <div><p className="text-sm font-semibold text-slate-800">{p.name}</p><p className="text-[11px] text-slate-400">{p.bed} Â· {p.diagnosis}</p></div>
                </div>
                <span className={badge(p.condition)}>{p.condition}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2"><Pill className="w-4 h-4 text-amber-600" />Medications Due</h3>
            <button onClick={() => setActiveView('MAR')} className="text-xs text-sky-600 font-semibold flex items-center gap-1">Open MAR<ChevronRight className="w-3 h-3" /></button>
          </div>
          <div className="divide-y divide-slate-50">
            {marData.filter(m => m.status === 'Pending' || m.status === 'Missed').map(m => (
              <div key={m.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-8 rounded-full ${m.status==='Missed'?'bg-red-400':'bg-amber-400'}`} />
                  <div><p className="text-sm font-semibold text-slate-800">{m.medicine}</p><p className="text-[11px] text-slate-400">{m.patientName} Â· {m.bed} Â· {m.scheduledTime}</p></div>
                </div>
                <button onClick={() => openMAR(m)} className="text-[11px] bg-sky-50 text-sky-700 border border-sky-200 px-2 py-1 rounded-lg font-semibold hover:bg-sky-100 transition">Administer</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2"><CalendarDays className="w-4 h-4 text-indigo-600" />This Week Schedule</h3>
          <button onClick={() => setActiveView('SCHEDULE')} className="text-xs text-sky-600 font-semibold flex items-center gap-1">Full Schedule<ChevronRight className="w-3 h-3" /></button>
        </div>
        <div className="grid grid-cols-7 divide-x divide-slate-100">
          {SCHEDULE_DATA.map((s, i) => (
            <div key={i} className={`p-3 text-center ${s.status==='Active'?'bg-sky-50':''}`}>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{s.day.slice(0,3)}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{s.date.slice(8)}</p>
              <div className={`w-8 h-8 rounded-full mx-auto mt-2 flex items-center justify-center text-[10px] font-black ${s.status==='Active'?'bg-sky-600 text-white':s.status==='Completed'?'bg-emerald-100 text-emerald-700':s.status==='Leave'?'bg-amber-100 text-amber-700':s.status==='Absent'?'bg-red-100 text-red-700':'bg-slate-100 text-slate-600'}`}>
                {s.shift==='Off'?'OFF':s.shift.charAt(0)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );


  // ── Schedule ─────────────────────────────────────────────────────────────────
  const ScheduleV = () => {
    const handleAddAssignment = (e: React.FormEvent) => {
      e.preventDefault();
      const finalWard = assignForm.ward === 'Other' ? assignForm.customWard : assignForm.ward;
      if (!finalWard) {
        alert('Please specify a Ward name!');
        return;
      }
      if (assignForm.selectedBeds.length === 0 || assignForm.selectedNurses.length === 0) {
        alert('Please select or add at least one bed and select one nurse!');
        return;
      }

      if (editingAssignmentId) {
        // Edit existing assignment
        setAssignments(p => p.map(a => a.id === editingAssignmentId
          ? {
              ...a,
              date: assignForm.date,
              ward: finalWard,
              beds: assignForm.selectedBeds,
              nurses: assignForm.selectedNurses
            }
          : a
        ));
        setEditingAssignmentId(null);
        addToast('Assignment Updated', 'Duty assignment updated successfully.', 'success');
      } else {
        // Add new assignment
        const newAssign: NurseAssignment = {
          id: `A${Date.now()}`,
          date: assignForm.date,
          ward: finalWard,
          beds: assignForm.selectedBeds,
          nurses: assignForm.selectedNurses,
        };
        setAssignments(p => [...p, newAssign]);
        addToast('Assignment Saved', 'Nurses assigned successfully to Wards and Beds.', 'success');
      }

      setAssignForm({ date: '2026-08-20', ward: 'General Ward A', customWard: '', selectedBeds: [], selectedNurses: [] });
      setShowAssignForm(false);
    };

    const handleToggleBed = (bed: string) => {
      setAssignForm(prev => {
        const alreadySelected = prev.selectedBeds.includes(bed);
        return {
          ...prev,
          selectedBeds: alreadySelected 
            ? prev.selectedBeds.filter(b => b !== bed)
            : [...prev.selectedBeds, bed]
        };
      });
    };

    const handleToggleNurse = (nurseName: string) => {
      setAssignForm(prev => {
        const alreadySelected = prev.selectedNurses.includes(nurseName);
        return {
          ...prev,
          selectedNurses: alreadySelected 
            ? prev.selectedNurses.filter(n => n !== nurseName)
            : [...prev.selectedNurses, nurseName]
        };
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-800">Duty Schedule & Ward Assignments</h2>
            <p className="text-sm text-slate-500">Day-wise shift planning and bed assignments for nursing staff</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAssignForm(!showAssignForm)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-sm font-bold rounded-xl hover:bg-sky-700 transition shadow-md"
            >
              {showAssignForm ? 'View Schedule' : 'Assign Nurses to Beds'}
            </button>
            <div className="flex items-center gap-1 border border-slate-200 rounded-xl bg-white p-1">
              <button className="p-1.5 hover:bg-slate-50 text-slate-600 rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
              <span className="px-2 text-xs font-bold text-slate-700">This Week</span>
              <button className="p-1.5 hover:bg-slate-50 text-slate-600 rounded-lg"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {showAssignForm ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl mx-auto shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 text-base">Assign Nurses to Beds</h3>
            <form onSubmit={handleAddAssignment} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-1 uppercase"><Calendar className="w-4 h-4 text-sky-600" />Select Day (August 2026)</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="text-xs font-black text-slate-700">August 2026</span>
                      <span className="text-[10px] text-slate-400 font-semibold">Click a day to assign</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5 text-center">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(w => (
                        <div key={w} className="text-[10px] font-bold text-slate-400 uppercase py-0.5">{w}</div>
                      ))}
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={`empty-${i}`} />
                      ))}
                      {Array.from({ length: 31 }).map((_, idx) => {
                        const dayNum = idx + 1;
                        const dateStr = `2026-08-${String(dayNum).padStart(2, '0')}`;
                        const isSelected = assignForm.date === dateStr;
                        return (
                          <button
                            type="button"
                            key={dayNum}
                            onClick={() => setAssignForm(p => ({ ...p, date: dateStr }))}
                            className={`h-9 w-9 mx-auto rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                              isSelected
                                ? 'bg-sky-600 text-white shadow-md scale-110'
                                : 'text-slate-700 hover:bg-slate-200 bg-white border border-slate-100'
                            }`}
                          >
                            {dayNum}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 block">Select or Add Ward</label>
                  <div className="flex gap-2">
                    <select
                      value={assignForm.ward}
                      onChange={e => setAssignForm(p => ({ ...p, ward: e.target.value }))}
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-sky-400 text-slate-800"
                    >
                      {wardsList.map(ward => (
                        <option key={ward}>{ward}</option>
                      ))}
                    </select>
                    {wardsList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete ward "${assignForm.ward}"?`)) {
                            const newWards = wardsList.filter(w => w !== assignForm.ward);
                            setWardsList(newWards);
                            setAssignForm(p => ({ ...p, ward: newWards[0] }));
                            addToast('Ward Deleted', 'Ward option removed.', 'info');
                          }
                        }}
                        className="p-2.5 text-red-500 border border-red-200 hover:bg-red-50 rounded-xl transition"
                        title="Delete selected ward"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={newWardInput}
                        onChange={e => setNewWardInput(e.target.value)}
                        placeholder="Add Ward..."
                        className="w-28 border border-slate-200 rounded-xl px-2 py-2 text-xs text-slate-800 outline-none focus:border-sky-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const w = newWardInput.trim();
                          if (w) {
                            if (wardsList.includes(w)) {
                              alert('Ward already exists!');
                              return;
                            }
                            setWardsList(p => [...p, w]);
                            setAssignForm(p => ({ ...p, ward: w }));
                            setNewWardInput('');
                          }
                        }}
                        className="p-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all flex items-center justify-center shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Beds Selector */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-600">Select Bed(s) *</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newBedInput}
                      onChange={e => setNewBedInput(e.target.value)}
                      placeholder="Add Bed No..."
                      className="w-32 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const b = newBedInput.trim();
                        if (b) {
                          if (bedsList.includes(b)) {
                            alert('Bed already exists!');
                            return;
                          }
                          setBedsList(p => [...p, b]);
                          setAssignForm(p => ({ ...p, selectedBeds: [...p.selectedBeds, b] }));
                          setNewBedInput('');
                        }
                      }}
                      className="p-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-2xl">
                  {bedsList.map(bed => {
                    const isSelected = assignForm.selectedBeds.includes(bed);
                    return (
                      <div
                        key={bed}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition ${
                          isSelected ? 'bg-sky-600 border-sky-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleBed(bed)}
                          className="focus:outline-none"
                        >
                          {bed}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete bed option "${bed}"?`)) {
                              setBedsList(p => p.filter(b => b !== bed));
                              setAssignForm(p => ({ ...p, selectedBeds: p.selectedBeds.filter(b => b !== bed) }));
                              addToast('Bed Deleted', 'Bed option removed.', 'info');
                            }
                          }}
                          className={`hover:bg-black/10 rounded p-0.5 ml-0.5 text-[10px] ${
                            isSelected ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          &times;
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Nurses Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 block">Assign Nurse(s) * (Select one or more)</label>
                <div className="grid grid-cols-2 gap-2">
                  {nursesList.map(nurse => {
                    const isSelected = assignForm.selectedNurses.includes(nurse.name);
                    return (
                      <button
                        type="button"
                        key={nurse.id}
                        onClick={() => handleToggleNurse(nurse.name)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs font-bold transition ${
                          isSelected ? 'bg-sky-50 border-sky-500 text-sky-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <p>{nurse.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{nurse.ward} · {nurse.shift.split(' ')[0]}</p>
                        </div>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 transition shadow-md"
              >
                Save Nurse Duty Assignment
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Day wise current Bed assignments */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-3">Day-wise Ward & Bed Nurse Assignments</h3>
              {assignments.length === 0 ? (
                <p className="text-xs text-slate-400">No specific nurse-to-bed assignments registered yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignments.map(a => (
                    <div key={a.id} className="p-4 rounded-xl border-2 border-slate-200 bg-white shadow-sm hover:border-sky-300 transition-all relative">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="px-2 py-0.5 rounded bg-sky-600 text-white text-[10px] font-bold font-mono">{a.date}</span>
                          <h4 className="font-bold text-slate-800 text-sm mt-1">{a.ward}</h4>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingAssignmentId(a.id);
                              setAssignForm({
                                date: a.date,
                                ward: a.ward,
                                customWard: '',
                                selectedBeds: a.beds,
                                selectedNurses: a.nurses
                              });
                              setShowAssignForm(true);
                            }}
                            className="text-[10px] text-sky-600 font-bold hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setAssignments(p => p.filter(as => as.id !== a.id));
                              addToast('Assignment Removed', 'Duty assignment cleared.', 'info');
                            }}
                            className="text-[10px] text-red-500 font-bold hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Beds</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {a.beds.map(b => (
                              <span key={b} className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-semibold">{b}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">On-duty Nurses</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {a.nurses.map(n => (
                              <span key={n} className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-sky-700 font-bold">{n}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                <div className="grid grid-cols-7 gap-2 text-[11px] font-bold text-slate-500 uppercase"><span>Day</span><span>Date</span><span>Shift</span><span>Start</span><span>End</span><span>Ward</span><span>Status</span></div>
              </div>
              <div className="divide-y divide-slate-100">
                {SCHEDULE_DATA.map((s, i) => (
                  <div key={i} className={`grid grid-cols-7 gap-2 px-5 py-4 text-sm ${s.status==='Active'?'bg-sky-50 border-l-2 border-sky-500':'hover:bg-slate-50'}`}>
                    <span className="font-bold text-slate-700">{s.day}</span>
                    <span className="text-slate-600 text-xs">{s.date}</span>
                    <span className={`font-semibold ${s.shift==='Morning'?'text-amber-600':s.shift==='Afternoon'?'text-blue-600':s.shift==='Night'?'text-indigo-600':'text-slate-400'}`}>{s.shift}</span>
                    <span className="text-slate-600 font-mono text-xs">{s.start}</span>
                    <span className="text-slate-600 font-mono text-xs">{s.end}</span>
                    <span className="text-slate-600 text-xs truncate">{s.ward}</span>
                    <span className={badge(s.status)}>{s.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <p className="font-bold text-slate-700 text-sm mb-3">Shift Legend</p>
              <div className="flex flex-wrap gap-3">
                {[{l:'Morning (M)',c:'bg-amber-100 text-amber-700',d:'07:00–15:00'},{l:'Afternoon (A)',c:'bg-blue-100 text-blue-700',d:'15:00–23:00'},{l:'Night (N)',c:'bg-indigo-100 text-indigo-700',d:'23:00–07:00'},{l:'Off',c:'bg-slate-100 text-slate-600',d:'No Duty'}].map(l=>(
                  <div key={l.l} className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${l.c}`}>{l.l}</span>
                    <span className="text-xs text-slate-400">{l.d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Attendance ───────────────────────────────────────────────────────────────
  const AttendanceV = () => {
    // Dynamically ensure all nurses in nursesList have an attendance entry for the selected date
    const dailyRecords = nursesList.map(nurse => {
      const existing = attendanceRecords.find(a => a.nurseId === nurse.id && a.date === selectedAttendanceDate);
      if (existing) return existing;
      // Default entry if none exists
      return {
        nurseId: nurse.id,
        nurseName: nurse.name,
        date: selectedAttendanceDate,
        checkIn: '-',
        checkOut: '-',
        hours: 0,
        overtime: 0,
        status: 'Absent' as const
      };
    });

    const presentCount = dailyRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
    const absentCount = dailyRecords.filter(r => r.status === 'Absent').length;
    const leaveCount = dailyRecords.filter(r => r.status === 'Leave').length;

    const handleUpdateStatus = (nurseId: string, status: DailyAttendance['status']) => {
      setAttendanceRecords(prev => {
        const match = prev.find(a => a.nurseId === nurseId && a.date === selectedAttendanceDate);
        if (match) {
          return prev.map(a => (a.nurseId === nurseId && a.date === selectedAttendanceDate)
            ? { 
                ...a, 
                status, 
                checkIn: status === 'Present' ? '08:00' : status === 'Late' ? '08:45' : '-',
                hours: (status === 'Present' || status === 'Late') ? 8 : 0
              }
            : a
          );
        } else {
          // Add new entry
          const nurse = nursesList.find(n => n.id === nurseId);
          const newEntry: DailyAttendance = {
            nurseId,
            nurseName: nurse?.name || 'Staff Nurse',
            date: selectedAttendanceDate,
            checkIn: status === 'Present' ? '08:00' : status === 'Late' ? '08:45' : '-',
            checkOut: '-',
            hours: (status === 'Present' || status === 'Late') ? 8 : 0,
            overtime: 0,
            status
          };
          return [...prev, newEntry];
        }
      });
      addToast('Attendance Updated', `Status updated to ${status} for this staff nurse.`, 'success');
    };

    return (
      <div className="space-y-5">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-800">Attendance Records</h2>
            <p className="text-sm text-slate-500">View and mark daily attendance checklist for all registered nursing staff</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Date:</span>
            <input
              type="date"
              value={selectedAttendanceDate}
              onChange={e => setSelectedAttendanceDate(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none bg-white focus:border-sky-400 font-mono font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[{label:'Present Staff',value:`${presentCount}/${dailyRecords.length}`,icon:CheckCircle,c:'text-emerald-600'},{label:'Absent Staff',value:`${absentCount}`,icon:AlertTriangle,c:'text-red-500'},{label:'On Leave',value:`${leaveCount}`,icon:Clock,c:'text-amber-500'},{label:'Present Rate',value:`${Math.round((presentCount/dailyRecords.length)*100 || 0)}%`,icon:TrendingUp,c:'text-sky-600'}].map(s => {
            const Icon = s.icon;
            return <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm"><Icon className={`w-5 h-5 ${s.c} mb-2`}/><p className="text-2xl font-black text-slate-800">{s.value}</p><p className="text-xs text-slate-500 font-semibold">{s.label}</p></div>;
          })}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Attendance Checklist</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>{['Nurse Name & ID', 'Date', 'Check In', 'Check Out', 'Hours', 'Status Option Toggle'].map(h=><th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {dailyRecords.map((r,i)=>(
                <tr key={i} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-bold text-slate-800">{r.nurseName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{r.nurseId}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-slate-600 font-mono">{r.date}</td>
                  <td className="px-5 py-3 font-mono text-slate-600">{r.checkIn}</td>
                  <td className="px-5 py-3 font-mono text-slate-600">{r.checkOut}</td>
                  <td className="px-5 py-3 font-semibold text-slate-700">{r.hours>0?`${r.hours}h`:'-'}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      {(['Present', 'Absent', 'Late', 'Leave'] as const).map(st => {
                        const isCurrent = r.status === st;
                        const colors: Record<string, string> = {
                          Present: isCurrent ? 'bg-emerald-600 text-white shadow-sm scale-105' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50',
                          Absent: isCurrent ? 'bg-red-600 text-white shadow-sm scale-105' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50',
                          Late: isCurrent ? 'bg-amber-500 text-white shadow-sm scale-105' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50',
                          Leave: isCurrent ? 'bg-slate-500 text-white shadow-sm scale-105' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        };
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleUpdateStatus(r.nurseId, st)}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${colors[st]}`}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // â”€â”€ MAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const MARV = () => (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-start justify-between">
        <div><h2 className="text-xl font-black text-slate-800">Medicine Administration Record</h2><p className="text-sm text-slate-500">Medication assignments for ward patients</p></div>
        <div className="flex gap-2 flex-wrap">
          {[{l:`${marData.filter(m=>m.status==='Pending').length} Pending`,c:'amber'},{l:`${marData.filter(m=>m.status==='Missed').length} Missed`,c:'red'},{l:`${marData.filter(m=>m.status==='Given').length} Given`,c:'emerald'}].map(s=>(
            <span key={s.l} className={`px-3 py-1.5 rounded-xl text-xs font-bold bg-${s.c}-50 text-${s.c}-700 border border-${s.c}-200`}>{s.l}</span>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 min-w-[800px]">
          <div className="grid grid-cols-8 gap-2 text-[11px] font-bold text-slate-500 uppercase">
            <span className="col-span-2">Patient / Bed</span><span>Medicine</span><span>Dose / Route</span><span>Freq.</span><span>Time</span><span>Status</span><span>Action</span>
          </div>
        </div>
        <div className="divide-y divide-slate-100 min-w-[800px]">
          {marData.map(m => (
            <div key={m.id} className={`grid grid-cols-8 gap-2 px-5 py-4 items-center text-sm ${m.status==='Missed'?'bg-red-50':m.status==='Held'?'bg-slate-50':'hover:bg-slate-50'}`}>
              <div className="col-span-2"><p className="font-semibold text-slate-800">{m.patientName}</p><p className="text-[11px] text-slate-400 font-mono">{m.patientId} · {m.bed}</p></div>
              <div><p className="font-semibold text-slate-700">{m.medicine}</p><p className="text-[10px] text-slate-400">{m.doctor}</p></div>
              <span className="text-slate-600 text-xs font-mono">{m.dosage}/{m.route}</span>
              <span className="text-slate-600 text-xs">{m.frequency}</span>
              <span className={`font-mono font-bold text-xs ${m.status==='Missed'?'text-red-600':'text-slate-700'}`}>{m.scheduledTime}</span>
              <span className={badge(m.status)}>{m.status}</span>
              <button onClick={() => openMAR(m)} className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition">{m.status==='Given'?'View':'Update'}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // â”€â”€ Patients â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const PatientsV = () => (
    <div className="space-y-5">
      {selectedPatient ? (
        <div className="space-y-6">
          {/* Header Action Row */}
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedPatient(null)} className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 bg-white transition"><ChevronLeft className="w-4 h-4" /></button>
            <div>
              <h2 className="text-xl font-black text-slate-800">Patient File & EMR</h2>
              <p className="text-xs text-slate-500">Electronic health record sheet</p>
            </div>
            <span className={`ml-auto ${badge(selectedPatient.condition)}`}>{selectedPatient.condition}</span>
          </div>

          {/* Premium Profile & QR Summary Card */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-950 rounded-3xl p-6 text-white border-2 border-slate-700 shadow-md flex flex-wrap justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-3xl font-black text-white shadow-inner">
                {selectedPatient.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black">{selectedPatient.name}</h3>
                <p className="text-xs text-slate-300 font-medium">EMR Access Token: <span className="font-mono text-sky-400 font-bold">{selectedPatient.id}</span></p>
                <div className="flex gap-2 items-center flex-wrap pt-1">
                  <span className="bg-white/15 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Bed: {selectedPatient.bed}</span>
                  <span className="bg-white/15 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Blood: {selectedPatient.bloodGroup}</span>
                  <span className="bg-white/15 px-2.5 py-0.5 rounded-full text-[10px] font-bold">{selectedPatient.age} yrs / {selectedPatient.gender}</span>
                </div>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200 flex flex-col items-center gap-1.5 shadow-sm">
              <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center relative overflow-hidden border border-slate-200">
                {/* Mock Vector QR Code Pattern */}
                <div className="absolute inset-2 grid grid-cols-5 gap-0.5 opacity-90">
                  {[1,1,0,1,1, 1,0,0,0,1, 0,0,1,0,0, 1,0,1,0,1, 1,1,0,1,1, 0,1,0,1,0, 1,0,1,1,0].map((v, i) => (
                    <div key={i} className={`rounded-sm ${v === 1 ? 'bg-slate-900' : 'bg-transparent'}`} />
                  ))}
                  {/* QR square corners */}
                  <div className="absolute top-0 left-0 w-4 h-4 bg-slate-900 border border-white rounded-sm" />
                  <div className="absolute top-0 right-0 w-4 h-4 bg-slate-900 border border-white rounded-sm" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 bg-slate-900 border border-white rounded-sm" />
                </div>
              </div>
              <span className="text-[9px] font-black text-slate-500 uppercase font-mono tracking-wider">Patient ID QR</span>
            </div>
          </div>

          {/* Vitals Summary Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Temp (Core)', value: '98.6 °F', desc: 'Normal', icon: Activity, col: 'text-emerald-500 bg-emerald-50' },
              { label: 'Blood Pressure', value: '120/80 mmHg', desc: 'Stable', icon: Activity, col: 'text-sky-500 bg-sky-50' },
              { label: 'Heart Rate', value: '72 bpm', desc: 'Normal', icon: Heart, col: 'text-rose-500 bg-rose-50' },
              { label: 'SpO2 Oxygen', value: '98%', desc: 'Optimal', icon: Activity, col: 'text-indigo-500 bg-indigo-50' },
            ].map(v => {
              const Icon = v.icon;
              return (
                <div key={v.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{v.label}</span>
                    <span className={`p-1 rounded-lg ${v.col}`}><Icon className="w-3.5 h-3.5" /></span>
                  </div>
                  <p className="text-xl font-black text-slate-800 mt-1">{v.value}</p>
                  <p className="text-[10px] font-semibold text-slate-500">{v.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
              <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2"><User className="w-4 h-4 text-sky-600"/>Demographics</h3>
              {[['Age / Gender',`${selectedPatient.age}y / ${selectedPatient.gender}`],['Blood Group',selectedPatient.bloodGroup],['Phone',selectedPatient.phone],['Weight / Height',`${selectedPatient.weight}kg / ${selectedPatient.height}cm`]].map(([k,v]) => (
                <div key={k as string} className="flex justify-between border-b border-slate-50 pb-1.5 last:border-0"><span className="text-xs text-slate-400 font-semibold">{k}</span><span className="text-xs font-bold text-slate-700">{v as string}</span></div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
              <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2"><BedDouble className="w-4 h-4 text-sky-600"/>Admission Details</h3>
              {[['Date',selectedPatient.admissionDate],['Ward',selectedPatient.ward],['Bed',selectedPatient.bed],['Doctor',selectedPatient.doctor],['Diagnosis',selectedPatient.diagnosis],['Priority',selectedPatient.priority]].map(([k,v]) => (
                <div key={k as string} className="flex justify-between border-b border-slate-50 pb-1.5 last:border-0"><span className="text-xs text-slate-400 font-semibold">{k}</span><span className="text-xs font-bold text-slate-700 text-right max-w-[60%]">{v as string}</span></div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
              <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500"/>Allergies</h3>
              {selectedPatient.allergies.length===0?<p className="text-xs text-slate-400">No known allergies</p>:selectedPatient.allergies.map(a=><div key={a} className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700">{a}</div>)}
              <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2 pt-2"><Pill className="w-4 h-4 text-amber-600"/>Medications</h3>
              {marData.filter(m=>m.patientId===selectedPatient.id).map(m=>(
                <div key={m.id} className="flex justify-between border-b border-slate-50 pb-1.5 last:border-0">
                  <div><p className="text-xs font-bold text-slate-700">{m.medicine}</p><p className="text-[10px] text-slate-400">{m.dosage} · {m.route}</p></div>
                  <span className={badge(m.status)}>{m.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <h2 className="text-xl font-black text-slate-800">Patients ({filteredPatients.length})</h2>
            <div className="flex gap-2">
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-slate-400"/>
                <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-sky-400 w-44"/>
              </div>
              <button onClick={()=>setActiveView('ADMIT')} className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-sm font-bold rounded-xl hover:bg-sky-700 transition shadow-md"><Plus className="w-4 h-4"/>Admit</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredPatients.map(p => (
              <div key={p.id} onClick={()=>setSelectedPatient(p)} className={`bg-white rounded-2xl border shadow-sm p-5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${p.condition==='Critical'?'border-red-200 bg-red-50/20':'border-slate-200'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-black ${p.condition==='Critical'?'bg-red-100 text-red-700':p.condition==='Stable'?'bg-emerald-100 text-emerald-700':'bg-sky-100 text-sky-700'}`}>{p.name.charAt(0)}</div>
                    <div><p className="font-bold text-slate-800">{p.name}</p><p className="text-xs text-slate-400 font-mono">{p.id}</p></div>
                  </div>
                  <span className={badge(p.priority)}>{p.priority}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-50 rounded-lg p-2"><p className="text-slate-400">Bed</p><p className="font-bold text-slate-700">{p.bed}</p></div>
                  <div className="bg-slate-50 rounded-lg p-2"><p className="text-slate-400">Age/Gender</p><p className="font-bold text-slate-700">{p.age}y/{p.gender.charAt(0)}</p></div>
                  <div className="bg-slate-50 rounded-lg p-2 col-span-2"><p className="text-slate-400">Diagnosis</p><p className="font-bold text-slate-700 truncate">{p.diagnosis}</p></div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 truncate">{p.doctor}</span>
                  <span className={badge(p.condition)}>{p.condition}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // â”€â”€ Admit Patient â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const AdmitV = () => {
    const steps = ['Personal Info','Medical Details','Admission Info','Confirm'];
    return (
      <div className="space-y-5 max-w-2xl mx-auto">
        <div><h2 className="text-xl font-black text-slate-800">Admit New Patient</h2><p className="text-sm text-slate-500">Complete all steps to admit the patient</p></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            {steps.map((s,i) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${admitStep>i+1?'bg-emerald-500 text-white':admitStep===i+1?'bg-sky-600 text-white shadow-md':'bg-slate-100 text-slate-500'}`}>
                    {admitStep>i+1?<CheckCircle2 className="w-4 h-4"/>:i+1}
                  </div>
                  <span className={`text-[10px] font-bold hidden sm:block ${admitStep===i+1?'text-sky-600':admitStep>i+1?'text-emerald-600':'text-slate-400'}`}>{s}</span>
                </div>
                {i<steps.length-1&&<div className={`flex-1 h-0.5 mx-2 ${admitStep>i+1?'bg-emerald-300':'bg-slate-200'}`}/>}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          {admitStep===1 && (
            <><h3 className="font-bold text-slate-800">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              {[{l:'First Name *',k:'firstName',p:'Rajesh'},{l:'Last Name *',k:'lastName',p:'Verma'},{l:'Phone *',k:'phone',p:'+91 98765...'},{l:'Email',k:'email',p:'patient@mail.com'},{l:'Emergency Name',k:'emergencyName',p:'Sunita Verma'},{l:'Emergency Phone',k:'emergencyPhone',p:'+91 87654...'},{l:'Address',k:'address',p:'123 Street, City'}].map(f=>(
                <div key={f.k} className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">{f.l}</label>
                  <input value={(admitForm as any)[f.k]} onChange={e=>setAdmitForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.p||''} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-sky-400"/>
                </div>
              ))}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Date of Birth</label>
                <input type="date" value={admitForm.dob} onChange={e=>setAdmitForm(p=>({...p,dob:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-sky-400"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Gender</label>
                <select value={admitForm.gender} onChange={e=>setAdmitForm(p=>({...p,gender:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-sky-400 text-slate-800">
                  <option value="">Select...</option>{['Male','Female','Other'].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            </div></>
          )}
          {admitStep===2 && (
            <><h3 className="font-bold text-slate-800">Medical Details</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Blood Group</label>
                <select value={admitForm.bloodGroup} onChange={e=>setAdmitForm(p=>({...p,bloodGroup:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-sky-400 text-slate-800">
                  <option value="">Select...</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-600">Known Allergies</label><input value={admitForm.allergies} onChange={e=>setAdmitForm(p=>({...p,allergies:e.target.value}))} placeholder="Penicillin, Sulfa..." className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-sky-400"/></div>
              <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-600">Past Medical History</label><textarea value={admitForm.medHistory} onChange={e=>setAdmitForm(p=>({...p,medHistory:e.target.value}))} rows={3} placeholder="Hypertension (2018)..." className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-sky-400 resize-none"/></div>
            </div></>
          )}
          {admitStep===3 && (
            <><h3 className="font-bold text-slate-800">Admission Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-600">Diagnosis *</label><input value={admitForm.diagnosis} onChange={e=>setAdmitForm(p=>({...p,diagnosis:e.target.value}))} placeholder="Acute Appendicitis" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-sky-400"/></div>
              <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-600">Doctor *</label><select value={admitForm.doctor} onChange={e=>setAdmitForm(p=>({...p,doctor:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-sky-400 text-slate-800"><option value="">Select...</option>{['Dr. Anjali Mehta','Dr. Vikram Singh','Dr. Rohit Gupta'].map(o=><option key={o}>{o}</option>)}</select></div>
              <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-600">Admission Date/Time</label><input type="datetime-local" value={admitForm.admitDate} onChange={e=>setAdmitForm(p=>({...p,admitDate:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-sky-400"/></div>
              <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-600">Ward</label><select value={admitForm.ward} onChange={e=>setAdmitForm(p=>({...p,ward:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-sky-400 text-slate-800"><option>General Ward A</option><option>ICU</option><option>Maternity</option><option>Pediatrics</option></select></div>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-bold text-emerald-700 mb-3">Available Beds</p>
              <div className="grid grid-cols-4 gap-2">
                {['B-106','B-107','B-108','B-110'].map(b=>(
                  <button key={b} onClick={()=>setAdmitForm(p=>({...p,bed:b}))} className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${admitForm.bed===b?'border-sky-500 bg-sky-600 text-white':'border-emerald-200 bg-white text-emerald-700 hover:border-sky-300'}`}>{b}</button>
                ))}
                {['B-101','B-102','B-103','B-104','B-105'].map(b=>(
                  <div key={b} className="py-2.5 rounded-xl text-sm font-bold border-2 border-slate-200 bg-slate-100 text-slate-400 text-center">{b}</div>
                ))}
              </div>
            </div></>
          )}
          {admitStep===4 && (
            <><h3 className="font-bold text-slate-800">Review & Confirm</h3>
            <div className="space-y-4">
              {[
                {title:'Personal',items:[['Name',`${admitForm.firstName} ${admitForm.lastName}`],['Gender',admitForm.gender],['Phone',admitForm.phone]]},
                {title:'Medical',items:[['Blood Group',admitForm.bloodGroup],['Allergies',admitForm.allergies||'None']]},
                {title:'Admission',items:[['Diagnosis',admitForm.diagnosis],['Doctor',admitForm.doctor],['Ward',admitForm.ward],['Bed',admitForm.bed]]},
              ].map(section=>(
                <div key={section.title} className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-black text-slate-500 uppercase mb-3">{section.title}</p>
                  <div className="grid grid-cols-2 gap-2">{section.items.map(([k,v])=>(
                    <div key={k as string}><p className="text-[10px] text-slate-400">{k}</p><p className="text-sm font-bold text-slate-800">{(v as string)||'-'}</p></div>
                  ))}</div>
                </div>
              ))}
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-4"><p className="text-sm font-bold text-sky-700 flex items-center gap-2"><Info className="w-4 h-4"/>Patient ID will be auto-generated on admission</p></div>
            </div></>
          )}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            {admitStep>1&&<button onClick={()=>setAdmitStep(s=>Math.max(1,s-1) as any)} className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition">Back</button>}
            {admitStep<4
              ?<button onClick={()=>setAdmitStep(s=>Math.min(4,s+1) as any)} className="flex-1 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition shadow-md flex items-center justify-center gap-2">Continue<ChevronRight className="w-4 h-4"/></button>
              :<button onClick={handleAdmit} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition shadow-md flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4"/>Confirm Admission</button>
            }
          </div>
        </div>
      </div>
    );
  };

  // â”€â”€ Reports â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const ReportsV = () => (
    <div className="space-y-5">
      <h2 className="text-xl font-black text-slate-800">Report Generation</h2>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h3 className="font-bold text-slate-700">Generate Patient Medical Report</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[{l:'Patient',t:'select',opts:NURSE_PATIENTS.map(p=>p.name)},{l:'Date From',t:'date'},{l:'Date To',t:'date'},{l:'Ward',t:'select',opts:['All Wards','General Ward A','ICU']},{l:'Doctor',t:'select',opts:['All Doctors','Dr. Anjali Mehta','Dr. Vikram Singh','Dr. Rohit Gupta']},{l:'Report Type',t:'select',opts:['Full Summary','Medication Report','Vitals Report','Nursing Notes']}].map(f=>(
            <div key={f.l} className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">{f.l}</label>
              {f.t==='select'
                ?<select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-sky-400 text-slate-800">{f.opts?.map(o=><option key={o}>{o}</option>)}</select>
                :<input type={f.t} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-sky-400"/>
              }
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
          {[{l:'Preview',icon:Eye,c:'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'},{l:'Generate PDF',icon:Download,c:'bg-sky-600 text-white hover:bg-sky-700 shadow-md'},{l:'Print',icon:Printer,c:'bg-slate-700 text-white hover:bg-slate-800 shadow-md'}].map(b=>{const Icon=b.icon;return(
            <button key={b.l} onClick={()=>addToast('Report',`${b.l} initiated`,'success')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${b.c}`}><Icon className="w-4 h-4"/>{b.l}</button>
          );})}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <p className="font-bold text-slate-700 text-sm mb-3">Report Sections Included</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {['Patient Demographics','Admission Details','Diagnosis & ICD Codes','Medication History (MAR)','Nursing Notes','Vital Signs Records','Doctor Visits & Orders','Lab Results','Procedures','Progress Notes','Discharge Summary','Follow-up Instructions'].map(s=>(
            <div key={s} className="flex items-center gap-2 p-2.5 rounded-xl bg-sky-50 border border-sky-100">
              <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0"/><span className="text-xs font-semibold text-slate-700">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // â”€â”€ Profile â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const ProfileV = () => (
    <div className="space-y-5 max-w-2xl">
      <h2 className="text-xl font-black text-slate-800">My Profile</h2>
      <div className="bg-gradient-to-r from-sky-600 to-indigo-700 rounded-2xl p-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-3xl font-black shadow-xl">{(user?.name || 'Sunita Sharma').charAt(0)}</div>
        <div><h3 className="text-2xl font-black text-white">{user?.name || 'Sunita Sharma'}</h3><p className="text-sky-200 text-sm font-semibold">Staff Nurse · General Ward A</p><p className="text-sky-300 text-xs font-mono mt-1">NSE-2024-0042 · Reg: MNC-2020-4892</p></div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h3 className="font-bold text-slate-700">Professional Details</h3>
        <div className="grid grid-cols-2 gap-4">
          {[['Full Name', user?.name || 'Sunita Sharma'], ['Email', user?.email || 'nurse@hospital.org'], ['Phone', '+91 98765 43210'], ['Department', 'General Medicine'], ['Ward', 'General Ward A'], ['Shift', 'Afternoon (15:00–23:00)'], ['Nurse ID', 'NSE-2024-0042'], ['Registration No.', 'MNC-2020-4892']].map(([l, v]) => (
            <div key={l as string} className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">{l}</label><p className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-1">{v as string}</p></div>
          ))}
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white text-sm font-bold rounded-xl hover:bg-sky-700 transition shadow-md"><Edit className="w-4 h-4"/>Edit Profile</button>
      </div>
    </div>
  );

  // â”€â”€ MAR Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const MARModalEl = () => {
    const [medSearch, setMedSearch] = useState('');
    if (!showMARModal || !selectedMar) return null;

    // Filter medicine names based on search input
    const filteredMeds = medNamesList.filter(name =>
      name.toLowerCase().includes(medSearch.toLowerCase())
    );

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60" onClick={()=>setShowMARModal(false)}/>
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between">
            <div><h3 className="font-black text-slate-800 text-lg">Update Medication</h3><p className="text-sm text-slate-500">{selectedMar.medicine} · {selectedMar.patientName}</p></div>
            <button onClick={()=>setShowMARModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"><X className="w-4 h-4"/></button>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3 text-sm">
            {/* Medicine Name Select & Add */}
            <div className="space-y-2 bg-white rounded-xl border border-slate-100 p-3 shadow-sm">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Medicine Name</label>
                <div className="relative w-44">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search medicine..."
                    value={medSearch}
                    onChange={e => setMedSearch(e.target.value)}
                    className="w-full pl-6 pr-2 py-0.5 text-[11px] border border-slate-200 rounded-md outline-none focus:border-sky-400 bg-slate-50/50"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={medNameEdit}
                  onChange={e => setMedNameEdit(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-400 bg-white"
                >
                  {!filteredMeds.includes(medNameEdit) && <option value={medNameEdit}>{medNameEdit}</option>}
                  {filteredMeds.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                {medNamesList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Remove "${medNameEdit}" from options?`)) {
                        const newList = medNamesList.filter(n => n !== medNameEdit);
                        setMedNamesList(newList);
                        setMedNameEdit(newList[0] || '');
                      }
                    }}
                    className="p-1.5 text-red-500 border border-red-200 hover:bg-red-50 rounded-lg"
                    title="Delete Option"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="flex gap-1 items-center">
                  <input
                    type="text"
                    placeholder="New..."
                    value={newMedNameOpt}
                    onChange={e => setNewMedNameOpt(e.target.value)}
                    className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-sky-400 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = newMedNameOpt.trim();
                      if (val) {
                        if (!medNamesList.includes(val)) setMedNamesList(p => [...p, val]);
                        setMedNameEdit(val);
                        setNewMedNameOpt('');
                      }
                    }}
                    className="p-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Dosage & Route Select & Add */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Dosage</label>
                <div className="flex gap-1.5 items-center">
                  <select
                    value={medDoseEdit}
                    onChange={e => setMedDoseEdit(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-400 bg-white font-mono"
                  >
                    {!dosagesList.includes(medDoseEdit) && <option value={medDoseEdit}>{medDoseEdit}</option>}
                    {dosagesList.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {dosagesList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Remove dosage "${medDoseEdit}"?`)) {
                          const newList = dosagesList.filter(d => d !== medDoseEdit);
                          setDosagesList(newList);
                          setMedDoseEdit(newList[0] || '');
                        }
                      }}
                      className="p-1.5 text-red-500 border border-red-200 hover:bg-red-50 rounded-lg"
                      title="Delete Option"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                  <input
                    type="text"
                    placeholder="Add..."
                    value={newDosageOpt}
                    onChange={e => setNewDosageOpt(e.target.value)}
                    className="w-14 border border-slate-200 rounded-lg px-1 py-1 text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = newDosageOpt.trim();
                      if (val) {
                        if (!dosagesList.includes(val)) setDosagesList(p => [...p, val]);
                        setMedDoseEdit(val);
                        setNewDosageOpt('');
                      }
                    }}
                    className="p-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Route</label>
                <div className="flex gap-1.5 items-center">
                  <select
                    value={medRouteEdit}
                    onChange={e => setMedRouteEdit(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-400 bg-white"
                  >
                    {!routesList.includes(medRouteEdit) && <option value={medRouteEdit}>{medRouteEdit}</option>}
                    {routesList.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  {routesList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Remove route "${medRouteEdit}"?`)) {
                          const newList = routesList.filter(r => r !== medRouteEdit);
                          setRoutesList(newList);
                          setMedRouteEdit(newList[0] || '');
                        }
                      }}
                      className="p-1.5 text-red-500 border border-red-200 hover:bg-red-50 rounded-lg"
                      title="Delete Option"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                  <input
                    type="text"
                    placeholder="Add..."
                    value={newRouteOpt}
                    onChange={e => setNewRouteOpt(e.target.value)}
                    className="w-14 border border-slate-200 rounded-lg px-1 py-1 text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = newRouteOpt.trim();
                      if (val) {
                        if (!routesList.includes(val)) setRoutesList(p => [...p, val]);
                        setMedRouteEdit(val);
                        setNewRouteOpt('');
                      }
                    }}
                    className="p-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Frequency & Scheduled Time Select & Add */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Frequency</label>
                <div className="flex gap-1.5 items-center">
                  <select
                    value={medFreqEdit}
                    onChange={e => setMedFreqEdit(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-400 bg-white"
                  >
                    {!frequenciesList.includes(medFreqEdit) && <option value={medFreqEdit}>{medFreqEdit}</option>}
                    {frequenciesList.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  {frequenciesList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Remove frequency "${medFreqEdit}"?`)) {
                          const newList = frequenciesList.filter(f => f !== medFreqEdit);
                          setFrequenciesList(newList);
                          setMedFreqEdit(newList[0] || '');
                        }
                      }}
                      className="p-1.5 text-red-500 border border-red-200 hover:bg-red-50 rounded-lg"
                      title="Delete Option"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                  <input
                    type="text"
                    placeholder="Add..."
                    value={newFreqOpt}
                    onChange={e => setNewFreqOpt(e.target.value)}
                    className="w-14 border border-slate-200 rounded-lg px-1 py-1 text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = newFreqOpt.trim();
                      if (val) {
                        if (!frequenciesList.includes(val)) setFrequenciesList(p => [...p, val]);
                        setMedFreqEdit(val);
                        setNewFreqOpt('');
                      }
                    }}
                    className="p-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Scheduled Time</label>
                <div className="flex gap-1.5 items-center">
                  <select
                    value={medTimeEdit}
                    onChange={e => setMedTimeEdit(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-400 bg-white font-mono font-bold"
                  >
                    {!timesList.includes(medTimeEdit) && <option value={medTimeEdit}>{medTimeEdit}</option>}
                    {timesList.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {timesList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Remove scheduled time "${medTimeEdit}"?`)) {
                          const newList = timesList.filter(t => t !== medTimeEdit);
                          setTimesList(newList);
                          setMedTimeEdit(newList[0] || '');
                        }
                      }}
                      className="p-1.5 text-red-500 border border-red-200 hover:bg-red-50 rounded-lg"
                      title="Delete Option"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                  <input
                    type="text"
                    placeholder="Add..."
                    value={newTimeOpt}
                    onChange={e => setNewTimeOpt(e.target.value)}
                    className="w-14 border border-slate-200 rounded-lg px-1 py-1 text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = newTimeOpt.trim();
                      if (val) {
                        if (!timesList.includes(val)) setTimesList(p => [...p, val]);
                        setMedTimeEdit(val);
                        setNewTimeOpt('');
                      }
                    }}
                    className="p-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase">Administration Status</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Given','Pending','Missed','Refused','Held'] as MAREntry['status'][]).map(s=>(
                <button key={s} onClick={()=>setMarStatus(s)} className={`py-2 rounded-xl text-sm font-bold border-2 transition-all ${marStatus===s?s==='Given'?'border-emerald-500 bg-emerald-600 text-white':s==='Missed'?'border-red-500 bg-red-600 text-white':s==='Refused'?'border-orange-500 bg-orange-500 text-white':s==='Held'?'border-slate-400 bg-slate-600 text-white':'border-amber-500 bg-amber-500 text-white':'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase">Notes</label>
            <textarea value={marNote} onChange={e=>setMarNote(e.target.value)} rows={2} placeholder="Observations..." className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-sky-400 resize-none"/>
          </div>
          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <button onClick={()=>setShowMARModal(false)} className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50">Cancel</button>
            <button onClick={saveMAR} className="flex-1 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 shadow-md flex items-center justify-center gap-2"><Save className="w-4 h-4"/>Save & Record</button>
          </div>
        </div>
      </div>
    );
  };

  const renderView = () => {
    switch(activeView) {
      case 'DASHBOARD': return DashboardV();
      case 'SCHEDULE': return ScheduleV();
      case 'ATTENDANCE': return AttendanceV();
      case 'MAR': return MARV();
      case 'PATIENTS': return PatientsV();
      case 'ADMIT': return AdmitV();
      case 'REPORTS': return ReportsV();
      case 'PROFILE': return ProfileV();
      case 'SETTINGS': return <div className="bg-white rounded-2xl border border-slate-200 p-6"><h2 className="text-xl font-black text-slate-800 mb-2">Settings</h2><p className="text-slate-500">Account and notification preferences will be available here.</p></div>;
      case 'MANAGE_NURSE': return ManageNursesV();
      default: return DashboardV();
    }
  };

  // ── Manage Nurses View ───────────────────────────────────────────────────────
  const ManageNursesV = () => {
    const handleAddNurse = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newNurse.name || !newNurse.email) return;

      if (editingNurseId) {
        // Edit existing nurse
        setNursesList(prev => prev.map(n => n.id === editingNurseId
          ? {
              ...n,
              name: newNurse.name || '',
              email: newNurse.email || '',
              phone: newNurse.phone || '+91 99999 99999',
              ward: newNurse.ward || 'General Ward A',
              shift: newNurse.shift || 'Morning (07-15h)',
              regNo: newNurse.regNo || n.regNo,
              status: newNurse.status as any || 'Active'
            }
          : n
        ));
        setEditingNurseId(null);
        addToast('Nurse Updated', `${newNurse.name} details updated successfully.`, 'success');
      } else {
        // Add new nurse
        const id = `NSE-2024-0${Math.floor(100 + Math.random() * 900)}`;
        const reg = `MNC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const created: StaffNurse = {
          id,
          name: newNurse.name,
          email: newNurse.email,
          phone: newNurse.phone || '+91 99999 99999',
          ward: newNurse.ward || 'General Ward A',
          shift: newNurse.shift || 'Morning (07-15h)',
          regNo: reg,
          status: newNurse.status as any || 'Active'
        };
        setNursesList(prev => [...prev, created]);
        addToast('Nurse Added', `${created.name} registered successfully.`, 'success');
      }

      setShowAddNurse(false);
      setNewNurse({ name: '', email: '', phone: '', ward: 'General Ward A', shift: 'Morning (07-15h)', status: 'Active' });
    };

    return (
      <div className="space-y-5">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-800">Nurse Management</h2>
            <p className="text-sm text-slate-500">Overview, shifts, and ward assignments of nursing staff</p>
          </div>
          <button
            onClick={() => {
              setEditingNurseId(null);
              setNewNurse({ name: '', email: '', phone: '', ward: 'General Ward A', shift: 'Morning (07-15h)', status: 'Active' });
              setShowAddNurse(!showAddNurse);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-sm font-bold rounded-xl hover:bg-sky-700 transition shadow-md"
          >
            {showAddNurse ? 'View List' : 'Add Staff Nurse'}
          </button>
        </div>

        {showAddNurse ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-xl mx-auto shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 text-base">
              {editingNurseId ? 'Edit Staff Nurse Details' : 'Add New Staff Nurse'}
            </h3>
            <form onSubmit={handleAddNurse} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Full Name *</label>
                <input
                  required
                  value={newNurse.name}
                  onChange={e => setNewNurse(p => ({ ...p, name: e.target.value }))}
                  placeholder="Kavita Sharma"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-sky-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Email Address *</label>
                  <input
                    required
                    type="email"
                    value={newNurse.email}
                    onChange={e => setNewNurse(p => ({ ...p, email: e.target.value }))}
                    placeholder="kavita.s@hospital.org"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-sky-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Phone Number</label>
                  <input
                    value={newNurse.phone}
                    onChange={e => setNewNurse(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 98765 XXXXX"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-sky-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Assigned Ward</label>
                  <select
                    value={newNurse.ward}
                    onChange={e => setNewNurse(p => ({ ...p, ward: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-sky-400 text-slate-800"
                  >
                    <option>General Ward A</option>
                    <option>ICU</option>
                    <option>Pediatrics</option>
                    <option>Maternity</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Shift Schedule</label>
                  <div className="flex gap-2">
                    <select
                      value={newNurse.shift?.startsWith('Custom:') ? 'Custom' : newNurse.shift}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === 'Custom') {
                          setNewNurse(p => ({ ...p, shift: 'Custom: 09:00 - 17:00' }));
                        } else {
                          setNewNurse(p => ({ ...p, shift: val }));
                        }
                      }}
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-sky-400 text-slate-800"
                    >
                      <option>Morning (07-15h)</option>
                      <option>Noon (12-20h)</option>
                      <option>Afternoon (15-23h)</option>
                      <option>Night (23-07h)</option>
                      <option>Custom</option>
                    </select>
                    {newNurse.shift?.startsWith('Custom:') && (
                      <input
                        type="text"
                        value={newNurse.shift.replace('Custom: ', '')}
                        onChange={e => setNewNurse(p => ({ ...p, shift: `Custom: ${e.target.value}` }))}
                        placeholder="e.g. 09:00 - 17:00"
                        className="w-40 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-sky-400 bg-white"
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Registration Number</label>
                  <input
                    value={newNurse.regNo || ''}
                    onChange={e => setNewNurse(p => ({ ...p, regNo: e.target.value }))}
                    placeholder="MNC-2026-XXXX"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-sky-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Status</label>
                  <select
                    value={newNurse.status || 'Active'}
                    onChange={e => setNewNurse(p => ({ ...p, status: e.target.value as any }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-sky-400 text-slate-800"
                  >
                    <option>Active</option>
                    <option>On Leave</option>
                    <option>Off Duty</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 transition shadow-md"
              >
                {editingNurseId ? 'Save Changes' : 'Register Staff Nurse'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Nurses Roster</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Nurse Name & ID', 'Email', 'Phone', 'Ward Assignment', 'Shift', 'Reg Number', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {nursesList.map((nurse, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-bold text-slate-800">{nurse.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{nurse.id}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600 text-xs">{nurse.email}</td>
                    <td className="px-5 py-3 text-slate-600 text-xs font-mono">{nurse.phone}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-1 bg-sky-50 text-sky-700 border border-sky-100 rounded-lg text-xs font-semibold">
                        {nurse.ward}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-700 font-medium text-xs">{nurse.shift}</td>
                    <td className="px-5 py-3 text-slate-400 text-xs font-mono">{nurse.regNo}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        nurse.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : nurse.status === 'On Leave'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {nurse.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-left">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingNurseId(nurse.id);
                            setNewNurse({
                              name: nurse.name,
                              email: nurse.email,
                              phone: nurse.phone,
                              ward: nurse.ward,
                              shift: nurse.shift,
                              regNo: nurse.regNo,
                              status: nurse.status as any
                            });
                            setShowAddNurse(true);
                          }}
                          className="p-1.5 text-sky-600 hover:text-white hover:bg-sky-600 rounded-lg transition"
                          title="Edit Nurse"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove nurse ${nurse.name}?`)) {
                              setNursesList(prev => prev.filter(n => n.id !== nurse.id));
                              addToast('Nurse Removed', `${nurse.name} has been removed from the roster.`, 'info');
                            }
                          }}
                          className="p-1.5 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}.view-fade{animation:fadeIn 0.25s ease-out}`}</style>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <SidebarEl/>
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <TopBarEl/>
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto view-fade">{renderView()}</div>
          </main>
        </div>
        <MARModalEl/>
      </div>
    </>
  );
};