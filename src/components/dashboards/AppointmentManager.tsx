import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  UserPlus,
  Search,
  CheckCircle2,
  AlertCircle,
  QrCode,
  User,
  Stethoscope,
  Filter,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useNotifications } from '../../context/NotificationContext.js';
import { api } from '../../services/api.js';
import { Appointment, Patient, User as UserType } from '../../types/index.js';

export const AppointmentManager: React.FC = () => {
  const { user, organization } = useAuth();
  const { addToast } = useNotifications();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<UserType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showBookModal, setShowBookModal] = useState(false);

  // New Appointment Form
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [apptDate, setApptDate] = useState(new Date().toISOString().split('T')[0]);
  const [apptTime, setApptTime] = useState('10:30');
  const [department, setDepartment] = useState('Cardiology');
  const [type, setType] = useState<'NEW_CONSULTATION' | 'FOLLOW_UP' | 'EMERGENCY' | 'ROUTINE_CHECKUP'>('NEW_CONSULTATION');
  const [reason, setReason] = useState('Persistent chest tightness and palpitations');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appts, pats, staff] = await Promise.all([
          api.getAppointments(),
          api.getPatients(),
          api.getStaff(),
        ]);
        setAppointments(appts);
        setPatients(pats);
        const docs = staff.filter((s) => s.role === 'DOCTOR');
        setDoctors(docs);
        if (pats.length > 0) setSelectedPatientId(pats[0].id);
        if (docs.length > 0) setSelectedDoctorId(docs[0].id);
      } catch (err) {
        console.error('Failed to load appointments data:', err);
      }
    };
    fetchData();
  }, [organization]);

  const handleUpdateStatus = async (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      const updated = await api.updateAppointmentStatus(appointmentId, newStatus);
      setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      addToast('Status Updated', `Appointment marked as ${newStatus}`, 'success');
    } catch (err: any) {
      addToast('Update Failed', err.message, 'error');
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === selectedPatientId);
    const doctor = doctors.find((d) => d.id === selectedDoctorId);
    if (!patient || !doctor) return;

    try {
      const created = await api.createAppointment({
        patientId: patient.id,
        patientName: patient.name,
        doctorId: doctor.id,
        doctorName: doctor.name,
        department,
        appointmentDate: apptDate,
        appointmentTime: apptTime,
        type,
        status: 'CONFIRMED',
        reasonForVisit: reason,
        tokenNumber: `TK-${Math.floor(100 + Math.random() * 900)}`,
      });

      setAppointments((prev) => [created, ...prev]);
      setShowBookModal(false);
      addToast('Appointment Booked', `Appointment token ${created.tokenNumber} issued for ${patient.name}.`, 'success');
    } catch (err: any) {
      addToast('Booking Failed', err.message, 'error');
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    const matchesSearch =
      a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tokenNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-600">
              Outpatient Department (OPD) Scheduling
            </span>
            <span className="text-xs text-slate-500">
              Today: <strong className="text-slate-700">{new Date().toDateString()}</strong>
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 text-slate-800 tracking-tight mt-1">
            Appointment Queue, Tokens & Consultation Calendar
          </h1>
        </div>

        <button
          onClick={() => setShowBookModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-slate-900 font-bold text-xs shadow-md shadow-indigo-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Consultation</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by patient, doctor, or token #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto">
          {['ALL', 'CONFIRMED', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-indigo-600 text-slate-900 shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 text-slate-500'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAppointments.map((appt) => {
          const isPending = appt.status === 'PENDING';
          const isConfirmed = appt.status === 'CONFIRMED';
          const isInConsult = appt.status === 'IN_CONSULTATION';
          const isCompleted = appt.status === 'COMPLETED';

          return (
            <div
              key={appt.id}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-600">
                    {appt.tokenNumber || 'TK-100'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-600'
                        : isInConsult
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-600 animate-pulse'
                        : isConfirmed
                        ? 'bg-blue-100 text-blue-800 bg-blue-50 text-blue-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {appt.appointmentTime}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 text-slate-800">
                  {appt.patientName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center space-x-1">
                  <Stethoscope className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{appt.doctorName} ({appt.department})</span>
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 bg-slate-100/40 text-[11px] text-slate-600 text-slate-600">
                <p><strong>Chief Complaint:</strong> {appt.reasonForVisit}</p>
                <p className="text-slate-500 mt-0.5">Date: {appt.appointmentDate} • Type: {appt.type}</p>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-2 border-t border-slate-100 border-slate-200 flex items-center justify-between text-xs">
                {isConfirmed && (
                  <button
                    onClick={() => handleUpdateStatus(appt.id, 'IN_CONSULTATION')}
                    className="w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-slate-900 font-bold text-center transition"
                  >
                    Start Doctor Consultation
                  </button>
                )}

                {isInConsult && (
                  <button
                    onClick={() => handleUpdateStatus(appt.id, 'COMPLETED')}
                    className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-slate-900 font-bold text-center transition"
                  >
                    Mark Consultation Completed
                  </button>
                )}

                {isCompleted && (
                  <span className="text-emerald-600 font-semibold flex items-center space-x-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed & Documented</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Book Appointment Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 text-slate-800 mb-1">
              Book Outpatient Consultation
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              Assign patient to a specialist doctor and allocate OPD queue token.
            </p>

            <form onSubmit={handleBookAppointment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Select Patient</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white bg-slate-100"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.patientIdNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Select Attending Doctor</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white bg-slate-100"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} &mdash; {d.department || 'Specialist'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Appointment Date</label>
                  <input
                    type="date"
                    required
                    value={apptDate}
                    onChange={(e) => setApptDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Time Slot</label>
                  <input
                    type="time"
                    required
                    value={apptTime}
                    onChange={(e) => setApptTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white bg-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Chief Complaint / Reason</label>
                <textarea
                  rows={2}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe primary symptoms or reason for visit..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white bg-slate-100"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-slate-900 font-bold transition shadow-xs"
                >
                  Issue OPD Queue Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



