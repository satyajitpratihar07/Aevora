import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Printer,
  Download,
  AlertTriangle,
  Pill,
  Clock,
  User,
  Stethoscope,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { Prescription } from '../../types/index.js';

export const PrescriptionList: React.FC = () => {
  const { organization } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, [organization]);

  const fetchPrescriptions = async () => {
    try {
      const list = await api.getPrescriptions();
      setPrescriptions(list);
    } catch (err) {
      console.error('Failed to load prescriptions:', err);
    }
  };

  const filteredRx = prescriptions.filter(
    (r) =>
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.prescriptionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-600">
              Clinical Formularies & Rx Records
            </span>
            <span className="text-xs text-slate-500">
              Total Issued: <strong className="text-slate-700">{prescriptions.length} Prescriptions</strong>
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 text-slate-800 tracking-tight mt-1">
            Electronic Medical Prescriptions Repository
          </h1>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search patient, doctor, diagnosis, or Rx #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Prescriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRx.map((rx) => (
          <div
            key={rx.id}
            className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-xs font-bold text-amber-600">
                  {rx.prescriptionNumber}
                </span>
                <h3 className="text-sm font-bold text-slate-900 text-slate-800 mt-0.5">
                  {rx.patientName}
                </h3>
                <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                  <Stethoscope className="w-3 h-3 text-blue-500" />
                  <span>Dr. {rx.doctorName} &bull; {rx.doctorSpecialization}</span>
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-600">
                {rx.status}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 bg-slate-100/40 text-xs space-y-1">
              <p><strong>Diagnosis:</strong> {rx.diagnosis}</p>
              {rx.clinicalNotes && <p className="text-slate-500 text-[11px] italic">&ldquo;{rx.clinicalNotes}&rdquo;</p>}
            </div>

            {/* Medication list */}
            <div className="border border-slate-100 border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 divide-slate-100 text-xs">
              {rx.items.map((item, idx) => (
                <div key={idx} className="p-2.5 flex justify-between items-center bg-white">
                  <div>
                    <span className="font-semibold text-slate-700">
                      {item.medicineName} ({item.dosage})
                    </span>
                    <p className="text-[10px] text-slate-500">{item.instructions}</p>
                  </div>
                  <span className="text-[11px] text-slate-500">{item.frequency}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-slate-500">
                {new Date(rx.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => {
                  setSelectedRx(rx);
                  setShowPrintModal(true);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Rx Slip</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Print Prescription Modal */}
      {showPrintModal && selectedRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 bg-slate-100/60">
              <h3 className="text-sm font-bold text-slate-700">
                Prescription Slip Preview
              </h3>
              <button onClick={() => setShowPrintModal(false)} className="text-xs px-3 py-1 rounded-lg bg-slate-200">
                Close
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 text-xs text-slate-700">
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 text-slate-800">
                    {organization?.name}
                  </h2>
                  <p className="text-slate-500 text-[11px]">{organization?.address}, {organization?.city}</p>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <p className="font-mono font-bold text-sm text-slate-900 text-slate-800">{selectedRx.prescriptionNumber}</p>
                  <p>Date: {new Date(selectedRx.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 bg-slate-100/50 rounded-xl text-[11px]">
                <p><strong>Patient:</strong> {selectedRx.patientName}</p>
                <p><strong>Prescribing Doctor:</strong> {selectedRx.doctorName} ({selectedRx.doctorSpecialization})</p>
                <p><strong>Diagnosis:</strong> {selectedRx.diagnosis}</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Prescribed Medications</h4>
                <div className="divide-y divide-slate-100 divide-slate-100 border rounded-xl overflow-hidden">
                  {selectedRx.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-900 text-slate-800">{item.medicineName} &mdash; {item.dosage}</p>
                        <p className="text-slate-500 text-[11px]">{item.instructions}</p>
                      </div>
                      <div className="text-right text-[11px]">
                        <p className="font-semibold">{item.frequency}</p>
                        <p className="text-slate-500">{item.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-end pt-6 border-t border-slate-200">
                <div className="text-[10px] text-slate-500">
                  Digitally Authenticated E-Prescription
                </div>
                <div className="text-center font-serif italic text-blue-700">
                  {selectedRx.doctorName}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 bg-slate-100/60 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-slate-900 text-xs font-semibold"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Rx Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



