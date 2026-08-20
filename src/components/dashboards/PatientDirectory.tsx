import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  ChevronRight,
  AlertTriangle,
  Heart,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  FileText,
  Activity,
  Microscope,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useNotifications } from '../../context/NotificationContext.js';
import { api } from '../../services/api.js';
import { Patient } from '../../types/index.js';

export const PatientDirectory: React.FC = () => {
  const { user, organization } = useAuth();
  const { addToast } = useNotifications();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Patient Form
  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '1990-05-15',
    gender: 'MALE',
    bloodGroup: 'O+',
    address: '123 Main Street',
    city: 'Mumbai',
    emergencyContactName: 'Jane Doe',
    emergencyContactPhone: '+1 (555) 987-6543',
    allergies: ['Penicillin'],
    chronicConditions: ['Hypertension'],
  });

  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');

  useEffect(() => {
    fetchPatients();
  }, [organization]);

  const fetchPatients = async () => {
    try {
      const list = await api.getPatients();
      setPatients(list);
      if (list.length > 0 && !selectedPatient) {
        handleViewPatient(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load patients:', err);
    }
  };

  const handleViewPatient = async (id: string) => {
    try {
      const detailed = await api.getPatientById(id);
      setSelectedPatient(detailed);
    } catch (err) {
      console.error('Failed to get patient profile:', err);
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const age = new Date().getFullYear() - new Date(newPatient.dateOfBirth).getFullYear();
      const created = await api.createPatient({
        ...newPatient,
        age,
        status: 'OUTPATIENT',
      } as any);

      setPatients((prev) => [created, ...prev]);
      setShowAddModal(false);
      handleViewPatient(created.id);
      addToast('Patient Registered', `MRN ${created.patientIdNumber} generated for ${created.name}.`, 'success');
    } catch (err: any) {
      addToast('Registration Error', err.message, 'error');
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientIdNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery)
  );

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 bg-blue-50 text-blue-700 text-blue-700">
              Electronic Health Records (EHR)
            </span>
            <span className="text-xs text-slate-500">
              Database: <strong className="text-slate-700">{patients.length} Registered Patients</strong>
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 text-slate-800 tracking-tight mt-1">
            Patient Registry & Longitudinal EHR Records
          </h1>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-slate-900 font-bold text-xs shadow-md shadow-blue-600/30 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Main EHR Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Patient List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, MRN #, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredPatients.map((p) => {
              const isSelected = selectedPatient?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleViewPatient(p.id)}
                  className={`w-full p-3.5 rounded-2xl text-left transition border ${
                    isSelected
                      ? 'bg-blue-50/80 bg-blue-50/40 border-blue-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 text-blue-700 font-bold text-xs flex items-center justify-center">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900 text-slate-800">{p.name}</p>
                        <p className="text-[10px] text-slate-500">MRN: {p.patientIdNumber} • {p.age}y {p.gender}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600">
                      {p.bloodGroup}
                    </span>
                  </div>

                  {p.allergies && p.allergies.length > 0 && (
                    <div className="mt-2 flex items-center space-x-1 text-[10px] text-red-600 font-semibold">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Allergies: {p.allergies.join(', ')}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Full EHR Longitudinal Record (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedPatient ? (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
              {/* Header Info */}
              <div className="flex justify-between items-start pb-4 border-b border-slate-100 border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center">
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 text-slate-800">
                      {selectedPatient.name}
                    </h2>
                    <p className="text-xs text-slate-500">
                      MRN: <strong className="font-mono">{selectedPatient.patientIdNumber}</strong> • {selectedPatient.age}y • {selectedPatient.gender} • Blood Group {selectedPatient.bloodGroup}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 bg-blue-50 text-blue-700 text-blue-700">
                  {selectedPatient.status}
                </span>
              </div>

              {/* Demographics & Contact */}
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 text-slate-500">
                <p className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedPatient.phone}</span>
                </p>
                <p className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedPatient.email}</span>
                </p>
                <p className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedPatient.address}, {selectedPatient.city}</span>
                </p>
                <p className="flex items-center space-x-2">
                  <Heart className="w-3.5 h-3.5 text-slate-500" />
                  <span>Emergency Contact: {selectedPatient.emergencyContactName} ({selectedPatient.emergencyContactPhone})</span>
                </p>
              </div>

              {/* Allergies & Conditions */}
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-red-800 dark:text-red-300">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Documented Drug & Environmental Allergies</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedPatient.allergies?.map((a: string, i: number) => (
                    <span key={i} className="px-2.5 py-0.5 bg-red-600 text-slate-900 rounded-md text-xs font-bold">
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recent Prescriptions */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center space-x-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Prescription History ({selectedPatient.prescriptions?.length || 0})</span>
                </h3>
                <div className="space-y-2">
                  {selectedPatient.prescriptions?.map((rx: any) => (
                    <div key={rx.id} className="p-3 bg-slate-50 bg-slate-100/50 rounded-xl text-xs flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-slate-700">
                          Rx #{rx.prescriptionNumber} &mdash; {rx.diagnosis}
                        </p>
                        <p className="text-[10px] text-slate-500">By {rx.doctorName} • {new Date(rx.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                        {rx.items?.length} Meds
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Lab Diagnostics */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center space-x-1">
                  <Microscope className="w-3.5 h-3.5" />
                  <span>Diagnostic Lab Orders ({selectedPatient.labOrders?.length || 0})</span>
                </h3>
                <div className="space-y-2">
                  {selectedPatient.labOrders?.map((lab: any) => (
                    <div key={lab.id} className="p-3 bg-slate-50 bg-slate-100/50 rounded-xl text-xs flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-slate-700">{lab.testName}</p>
                        <p className="text-[10px] text-slate-500">Order #{lab.orderNumber} • Priority: {lab.priority}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded">
                        {lab.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              Select a patient from the list to view their longitudinal health record.
            </div>
          )}
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <h2 className="text-sm font-bold text-slate-900 text-slate-800 mb-1">
              Register New Hospital Patient
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Enter demographic, clinical allergy, and emergency contact details.
            </p>

            <form onSubmit={handleCreatePatient} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 text-slate-500 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    placeholder="e.g. Johnathan Smith"
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-slate-500 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white bg-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 text-slate-500 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-slate-500 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={newPatient.dateOfBirth}
                    onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-slate-500 mb-1">Gender</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value as any })}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white bg-slate-100"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 text-slate-500 mb-1">Blood Group</label>
                  <select
                    value={newPatient.bloodGroup}
                    onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value as any })}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white bg-slate-100"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 text-slate-500 mb-1">City / State</label>
                  <input
                    type="text"
                    value={newPatient.city}
                    onChange={(e) => setNewPatient({ ...newPatient, city: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white bg-slate-100"
                  />
                </div>
              </div>

              {/* Allergies Builder */}
              <div>
                <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Known Drug Allergies</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    placeholder="e.g. Penicillin, Sulfa, Aspirin"
                    className="flex-1 p-2 rounded-xl border border-slate-200 bg-white bg-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newAllergy.trim()) {
                        setNewPatient({ ...newPatient, allergies: [...newPatient.allergies, newAllergy.trim()] });
                        setNewAllergy('');
                      }
                    }}
                    className="px-3 py-2 bg-red-600 text-slate-900 rounded-xl font-semibold"
                  >
                    Add Allergy
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {newPatient.allergies.map((a, i) => (
                    <span key={i} className="px-2 py-0.5 bg-red-100 text-red-800 rounded-md font-medium">
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-slate-900 font-bold transition"
                >
                  Save & Generate MRN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};




