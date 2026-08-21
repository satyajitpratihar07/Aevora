import React, { useState, useEffect } from 'react';
import {
  Heart,
  Calendar,
  Pill,
  Microscope,
  CreditCard,
  QrCode,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useNotifications } from '../../context/NotificationContext.js';
import { api } from '../../services/api.js';
import { Patient, Prescription, LabOrder, Invoice, Appointment } from '../../types/index.js';

export const PatientPortal: React.FC = () => {
  const { user, organization } = useAuth();
  const { addToast } = useNotifications();

  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PRESCRIPTIONS' | 'LABS' | 'BILLING' | 'QR'>('OVERVIEW');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patients = await api.getPatients();
        if (patients.length > 0) {
          const currentPatient = patients[0];
          setPatientData(currentPatient);

          const [rx, labs, inv, appts] = await Promise.all([
            api.getPrescriptions(),
            api.getLabOrders(),
            api.getInvoices(),
            api.getAppointments(),
          ]);

          setPrescriptions(rx.filter((r) => r.patientId === currentPatient.id));
          setLabOrders(labs.filter((l) => l.patientId === currentPatient.id));
          setInvoices(inv.filter((i) => i.patientId === currentPatient.id));
          setAppointments(appts.filter((a) => a.patientId === currentPatient.id));
        }
      } catch (err) {
        console.error('Failed to load patient portal:', err);
      }
    };
    fetchData();
  }, [organization]);

  const handlePayInvoice = async (inv: Invoice) => {
    try {
      const updated = await api.payInvoice(inv.id, {
        amount: inv.balanceDue,
        method: 'CREDIT_CARD',
        reference: 'PATIENT-PORTAL-ONLINE',
        receivedBy: 'Online Portal Gateway',
      });
      setInvoices((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      addToast('Payment Successful', `Invoice ${inv.invoiceNumber} paid in full online.`, 'success');
    } catch (err: any) {
      addToast('Payment Error', err.message, 'error');
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Patient Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-2xl">
              {patientData?.name.charAt(0) || 'P'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold">{patientData?.name || 'Eleanor Vance'}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 uppercase tracking-wider">
                  Patient Health Portal
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                MRN: <strong className="font-mono">{patientData?.patientIdNumber || 'MRN-84910'}</strong> • Blood Group: {patientData?.bloodGroup} • Age: {patientData?.age}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('QR')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-xs transition"
            >
              <QrCode className="w-4 h-4" />
              <span>Digital Check-In QR</span>
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
          {[
            { id: 'OVERVIEW', label: 'My Health Overview' },
            { id: 'PRESCRIPTIONS', label: `Prescriptions (${prescriptions.length})` },
            { id: 'LABS', label: `Diagnostic Lab Reports (${labOrders.length})` },
            { id: 'BILLING', label: `Billing & Statements (${invoices.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Allergies Card */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Medical Allergies
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {patientData?.allergies?.map((a, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold">
                  {a}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Verified with hospital clinical electronic health records.
            </p>
          </div>

          {/* Next Consultation Card */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 text-indigo-600">
              <Calendar className="w-5 h-5" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Upcoming Appointment
              </h3>
            </div>
            {appointments.length > 0 ? (
              <div>
                <p className="font-bold text-sm text-slate-900 text-slate-800">
                  {appointments[0].doctorName}
                </p>
                <p className="text-xs text-slate-500">
                  {appointments[0].department} • {appointments[0].appointmentDate} at {appointments[0].appointmentTime}
                </p>
                <span className="inline-block mt-2 font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700">
                  Token: {appointments[0].tokenNumber}
                </span>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No appointments scheduled.</p>
            )}
          </div>

          {/* Active Prescriptions Summary Card */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 text-amber-600">
              <Pill className="w-5 h-5" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Active Medications
              </h3>
            </div>
            <p className="text-2xl font-bold text-slate-900 text-slate-800">
              {prescriptions.reduce((acc, r) => acc + r.items.length, 0)} Prescribed Drugs
            </p>
            <button
              onClick={() => setActiveTab('PRESCRIPTIONS')}
              className="text-xs text-amber-600 font-bold hover:underline"
            >
              View Schedule & Dosage &rarr;
            </button>
          </div>
        </div>
      )}

      {/* PRESCRIPTIONS TAB */}
      {activeTab === 'PRESCRIPTIONS' && (
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-xs font-bold text-amber-600">
                    Rx #{rx.prescriptionNumber}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 text-slate-800 mt-0.5">
                    Diagnosis: {rx.diagnosis}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Prescribed by <strong>{rx.doctorName}</strong> ({rx.doctorSpecialization}) • {new Date(rx.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>

              <div className="border border-slate-100 border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 divide-slate-100 text-xs">
                {rx.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex justify-between items-center bg-slate-50/50 bg-slate-100/40">
                    <div>
                      <p className="font-bold text-slate-700">
                        {item.medicineName} ({item.dosage})
                      </p>
                      <p className="text-[11px] text-slate-500">{item.instructions}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-700 text-slate-600">{item.frequency}</span>
                      <p className="text-[10px] text-slate-500">Duration: {item.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LABS TAB */}
      {activeTab === 'LABS' && (
        <div className="space-y-4">
          {labOrders.map((lab) => (
            <div
              key={lab.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-xs font-bold text-purple-600">
                    Lab #{lab.orderNumber}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 text-slate-800 mt-0.5">
                    {lab.testName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Specimen: {lab.sampleType} • Verified by: <strong>{lab.verifiedBy || 'Pathologist'}</strong>
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-600">
                  {lab.status}
                </span>
              </div>

              {lab.parameters && lab.parameters.length > 0 && (
                <table className="w-full text-xs text-left border border-slate-100 border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-50 bg-slate-100/80 font-bold">
                    <tr>
                      <th className="p-2.5">Parameter</th>
                      <th className="p-2.5">Your Value</th>
                      <th className="p-2.5">Standard Range</th>
                      <th className="p-2.5">Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 divide-slate-100">
                    {lab.parameters.map((p, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-semibold">{p.name}</td>
                        <td className="p-2.5 font-bold">{p.value} {p.unit}</td>
                        <td className="p-2.5 text-slate-500">{p.referenceRange} {p.unit}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.flag === 'NORMAL' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {p.flag}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}

      {/* BILLING TAB */}
      {activeTab === 'BILLING' && (
        <div className="space-y-4">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-600">
                    {inv.invoiceNumber}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 text-slate-800 mt-0.5">
                    Total: ₹{inv.totalAmount.toLocaleString("en-IN")}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Due Date: {inv.dueDate} • Paid: ₹{inv.paidAmount.toLocaleString("en-IN")}
                  </p>
                </div>
                {inv.balanceDue > 0 ? (
                  <button
                    onClick={() => handlePayInvoice(inv)}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-slate-900 font-bold text-xs shadow-xs transition"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay Balance Online (₹{inv.balanceDue.toLocaleString("en-IN")})</span>
                  </button>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    Paid in Full
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR DIGITAL CHECK-IN TAB */}
      {activeTab === 'QR' && (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs text-center max-w-md mx-auto space-y-4">
          <h2 className="text-base font-bold text-slate-900 text-slate-800">
            Contactless Hospital Check-In QR
          </h2>
          <p className="text-xs text-slate-500">
            Scan at hospital reception or kiosk for rapid appointment check-in.
          </p>

          <div className="p-6 bg-white border-2 border-slate-900 rounded-3xl inline-block shadow-lg">
            <QrCode className="w-48 h-48 text-slate-900 mx-auto" />
          </div>

          <div className="font-mono text-xs font-bold text-slate-700 text-slate-600">
            MRN: {patientData?.patientIdNumber} &bull; {patientData?.name}
          </div>
        </div>
      )}
    </div>
  );
};




