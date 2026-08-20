import React, { useState, useEffect } from 'react';
import {
  BedDouble,
  Activity,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  LogOut,
  Building,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useNotifications } from '../../context/NotificationContext.js';
import { api } from '../../services/api.js';
import { WardBed, Patient } from '../../types/index.js';

export const InpatientBedManager: React.FC = () => {
  const { user, organization } = useAuth();
  const { addToast } = useNotifications();

  const [beds, setBeds] = useState<WardBed[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [selectedBed, setSelectedBed] = useState<WardBed | null>(null);
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Admission Form State
  const [admitPatientId, setAdmitPatientId] = useState('');
  const [admitDiagnosis, setAdmitDiagnosis] = useState('Acute Myocardial Infarction / Post-Angioplasty');
  const [attendingDoctor, setAttendingDoctor] = useState('Dr. Vikramaditya Singh, MD');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bedList, patList] = await Promise.all([api.getBeds(), api.getPatients()]);
        setBeds(bedList);
        setPatients(patList);
        if (patList.length > 0) setAdmitPatientId(patList[0].id);
      } catch (err) {
        console.error('Failed to load beds:', err);
      }
    };
    fetchData();
  }, [organization]);

  const wards = ['ALL', 'ICU - Critical Care', 'Emergency Trauma Unit', 'Cardiology Inpatient Floor', 'General Medical Ward'];

  const filteredBeds = selectedWard === 'ALL'
    ? beds
    : beds.filter((b) => b.wardName.toLowerCase().includes(selectedWard.toLowerCase().substring(0, 5)));

  const handleBedStatusToggle = async (bed: WardBed, newStatus: WardBed['status']) => {
    try {
      const updated = await api.updateBedStatus(bed.id, {
        status: newStatus,
        patientId: newStatus === 'AVAILABLE' || newStatus === 'CLEANING' ? undefined : bed.patientId,
        patientName: newStatus === 'AVAILABLE' || newStatus === 'CLEANING' ? undefined : bed.patientName,
      });

      setBeds((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      addToast('Bed Status Updated', `Bed ${bed.bedNumber} marked as ${newStatus}`, 'success');
    } catch (err: any) {
      addToast('Error Updating Bed', err.message || 'Failed to update bed status', 'error');
    }
  };

  const handleAdmitPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBed || !admitPatientId) return;

    const patient = patients.find((p) => p.id === admitPatientId);
    if (!patient) return;

    try {
      // 1. Create admission record
      await api.createAdmission({
        patientId: patient.id,
        patientName: patient.name,
        bedId: selectedBed.id,
        bedNumber: selectedBed.bedNumber,
        wardName: selectedBed.wardName,
        admittedDate: new Date().toISOString(),
        admittingDiagnosis: admitDiagnosis,
        attendingDoctor,
        status: 'ADMITTED',
        dailyRoomRate: selectedBed.dailyRate,
      });

      // 2. Update bed status
      const updated = await api.updateBedStatus(selectedBed.id, {
        status: 'OCCUPIED',
        patientId: patient.id,
        patientName: patient.name,
        admissionId: `adm-${Date.now()}`,
      });

      setBeds((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setShowAdmitModal(false);
      addToast('Patient Admitted', `${patient.name} admitted to Bed ${selectedBed.bedNumber} (${selectedBed.wardName}).`, 'success');
    } catch (err: any) {
      addToast('Admission Failed', err.message || 'Failed to admit patient', 'error');
    }
  };

  const handleDischargePatient = async (bed: WardBed) => {
    if (!bed.patientName) return;
    try {
      const updated = await api.updateBedStatus(bed.id, {
        status: 'CLEANING',
        patientId: undefined,
        patientName: undefined,
        admissionId: undefined,
      });

      setBeds((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      addToast('Patient Discharged', `Bed ${bed.bedNumber} cleared and queued for sterilization.`, 'info');
    } catch (err: any) {
      addToast('Discharge Failed', err.message, 'error');
    }
  };

  const occupiedCount = beds.filter((b) => b.status === 'OCCUPIED').length;
  const availableCount = beds.filter((b) => b.status === 'AVAILABLE').length;
  const cleaningCount = beds.filter((b) => b.status === 'CLEANING').length;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-600">
              Inpatient Wards & Bed Occupancy
            </span>
            <span className="text-xs text-slate-500">
              Facility Total: <strong className="text-slate-700">{beds.length} Licensed Beds</strong>
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 text-slate-800 tracking-tight mt-1">
            Visual Interactive Ward & Floor Map
          </h1>
        </div>

        {/* Occupancy Legend Summary */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-600 font-bold border border-emerald-200 dark:border-emerald-900">
            {availableCount} Available
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-600 font-bold border border-rose-200 dark:border-rose-900">
            {occupiedCount} Occupied
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-600 font-bold border border-amber-200 dark:border-amber-900">
            {cleaningCount} Sanitizing
          </span>
        </div>
      </div>

      {/* Ward Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {wards.map((ward) => (
          <button
            key={ward}
            onClick={() => setSelectedWard(ward)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedWard === ward
                ? 'bg-blue-600 text-slate-900 shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {ward}
          </button>
        ))}
      </div>

      {/* Interactive Bed Map Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBeds.map((bed) => {
          const isOccupied = bed.status === 'OCCUPIED';
          const isAvailable = bed.status === 'AVAILABLE';
          const isCleaning = bed.status === 'CLEANING';

          return (
            <div
              key={bed.id}
              className={`p-5 rounded-3xl border transition-all duration-200 space-y-3 ${
                isOccupied
                  ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                  : isAvailable
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                  : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
              }`}
            >
              {/* Bed Top Bar */}
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isOccupied
                        ? 'bg-rose-600 text-slate-900'
                        : isAvailable
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    <BedDouble className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 text-slate-800">
                      {bed.bedNumber}
                    </h3>
                    <p className="text-[10px] text-slate-500">{bed.type}</p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                    isOccupied
                      ? 'bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-700'
                      : isAvailable
                      ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-700'
                      : 'bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-700'
                  }`}
                >
                  {bed.status}
                </span>
              </div>

              {/* Ward & Location */}
              <div className="text-[11px] text-slate-600 text-slate-500">
                <p className="font-semibold text-slate-700">{bed.wardName}</p>
                <p>Floor {bed.floorNumber} • Room {bed.roomNumber} • ₹{bed.dailyRate}/day</p>
              </div>

              {/* Patient Details (If Occupied) */}
              {isOccupied && (
                <div className="p-2.5 rounded-xl bg-white border border-rose-100 dark:border-rose-950 text-xs">
                  <p className="font-bold text-slate-900 text-slate-800">{bed.patientName}</p>
                  <p className="text-[10px] text-slate-500">Attending: Dr. Vikramaditya Singh, MD</p>
                </div>
              )}

              {/* Bed Action Buttons */}
              <div className="pt-2 border-t border-slate-200/60 border-slate-200/80 flex items-center justify-between text-xs">
                {isAvailable && (
                  <button
                    onClick={() => {
                      setSelectedBed(bed);
                      setShowAdmitModal(true);
                    }}
                    className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-slate-900 font-bold text-center transition shadow-xs"
                  >
                    Admit Patient
                  </button>
                )}

                {isOccupied && (
                  <div className="w-full flex space-x-1.5">
                    <button
                      onClick={() => handleDischargePatient(bed)}
                      className="flex-1 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-slate-900 font-semibold text-center transition text-[11px]"
                    >
                      Discharge
                    </button>
                    <button
                      onClick={() => handleBedStatusToggle(bed, 'MAINTENANCE')}
                      className="px-2 py-1.5 rounded-xl border border-slate-300 border-slate-200 hover:bg-slate-100 text-slate-600 text-[11px]"
                    >
                      Maint
                    </button>
                  </div>
                )}

                {isCleaning && (
                  <button
                    onClick={() => handleBedStatusToggle(bed, 'AVAILABLE')}
                    className="w-full py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-slate-900 font-bold text-center transition text-[11px]"
                  >
                    Mark Sanitized & Ready
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Admission Workflow Modal */}
      {showAdmitModal && selectedBed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6">
            <h2 className="text-sm font-bold text-slate-900 text-slate-800 mb-1">
              Admit Patient to Bed {selectedBed.bedNumber} ({selectedBed.wardName})
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Assign inpatient bed, primary diagnosis, and attending physician.
            </p>

            <form onSubmit={handleAdmitPatient} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Select Patient</label>
                <select
                  value={admitPatientId}
                  onChange={(e) => setAdmitPatientId(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white bg-slate-100"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.patientIdNumber}) &mdash; {p.age}y {p.gender}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Admitting Diagnosis</label>
                <input
                  type="text"
                  required
                  value={admitDiagnosis}
                  onChange={(e) => setAdmitDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Coronary Syndrome, Post-Op Monitoring"
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Attending Physician</label>
                <input
                  type="text"
                  required
                  value={attendingDoctor}
                  onChange={(e) => setAttendingDoctor(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white bg-slate-100"
                />
              </div>

              <div className="p-3 bg-slate-50 bg-slate-100 rounded-xl text-[11px] text-slate-600 text-slate-600">
                <p><strong>Daily Room Charge:</strong> ₹{selectedBed.dailyRate}.00 / day</p>
                <p><strong>Floor Location:</strong> Floor {selectedBed.floorNumber}, Room {selectedBed.roomNumber}</p>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAdmitModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-slate-900 font-bold transition shadow-xs"
                >
                  Confirm Inpatient Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};




