import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  Receipt,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Printer,
  FileText,
  Building,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useNotifications } from '../../context/NotificationContext.js';
import { api } from '../../services/api.js';
import { Invoice, Patient } from '../../types/index.js';

export const AccountantDashboard: React.FC = () => {
  const { user, organization } = useAuth();
  const { addToast } = useNotifications();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // New Invoice Form
  const [newInvoicePatientId, setNewInvoicePatientId] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<Array<{
    description: string;
    category: 'CONSULTATION' | 'LAB_TEST' | 'PHARMACY' | 'BED_CHARGES' | 'PROCEDURE' | 'OTHER';
    quantity: number;
    unitPrice: number;
  }>>([
    { description: 'Specialist Cardiology Consultation', category: 'CONSULTATION', quantity: 1, unitPrice: 150.0 },
    { description: 'Complete Blood Count (CBC) Panel', category: 'LAB_TEST', quantity: 1, unitPrice: 45.0 },
  ]);

  // Payment Form
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'CREDIT_CARD' | 'CASH' | 'INSURANCE' | 'BANK_TRANSFER'>('CREDIT_CARD');
  const [payReference, setPayReference] = useState('TXN-AUTH-901');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invList, patList] = await Promise.all([api.getInvoices(), api.getPatients()]);
        setInvoices(invList);
        setPatients(patList);
        if (patList.length > 0) setNewInvoicePatientId(patList[0].id);
      } catch (err) {
        console.error('Failed to load invoices:', err);
      }
    };
    fetchData();
  }, [organization]);

  const handleAddItemRow = () => {
    setInvoiceItems((prev) => [
      ...prev,
      { description: 'General Service', category: 'OTHER', quantity: 1, unitPrice: 50.0 },
    ]);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === newInvoicePatientId);
    if (!patient) return;

    const subtotal = invoiceItems.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0);
    const tax = Number((subtotal * ((organization?.taxRate || 7) / 100)).toFixed(2));
    const totalAmount = subtotal + tax;

    try {
      const created = await api.createInvoice({
        patientId: patient.id,
        patientName: patient.name,
        patientIdNumber: patient.patientIdNumber,
        items: invoiceItems.map((i) => ({
          ...i,
          id: `item-${Math.random().toString(36).substring(2, 7)}`,
          totalPrice: i.quantity * i.unitPrice,
        })),
        subtotal,
        taxAmount: tax,
        discountAmount: 0,
        totalAmount,
        paidAmount: 0,
        balanceDue: totalAmount,
        status: 'UNPAID',
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      });

      setInvoices((prev) => [created, ...prev]);
      setShowCreateModal(false);
      addToast('Invoice Generated', `Invoice ${created.invoiceNumber} created for ${patient.name}`, 'success');
    } catch (err: any) {
      addToast('Error Creating Invoice', err.message, 'error');
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      const updated = await api.payInvoice(selectedInvoice.id, {
        amount: Number(payAmount),
        method: payMethod,
        reference: payReference,
        receivedBy: user?.name || 'Accountant',
      });

      setInvoices((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setShowPayModal(false);
      addToast('Payment Recorded', `Payment of ₹${payAmount} processed for Invoice ${selectedInvoice.invoiceNumber}.`, 'success');
    } catch (err: any) {
      addToast('Payment Failed', err.message, 'error');
    }
  };

  const totalCollected = invoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const totalOutstanding = invoices.reduce((acc, i) => acc + i.balanceDue, 0);

  const filteredInvoices = invoices.filter(
    (i) =>
      i.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-600">
              Hospital Billing & Financial Ledger
            </span>
            <span className="text-xs text-slate-500">
              Accountant: <strong className="text-slate-700">{user?.name || 'Marcus Vance, CPA'}</strong>
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 text-slate-800 tracking-tight mt-1">
            Patient Invoicing, Claims & Payment Collection
          </h1>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-slate-900 font-bold text-xs shadow-md shadow-emerald-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Invoice</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Collected Payments</span>
          <p className="text-2xl font-bold text-slate-900 text-slate-800 mt-1">
            ₹{totalCollected.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Real-time cleared funds</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Outstanding Receivables</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">
            ₹{totalOutstanding.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-slate-500">Due from patients & insurers</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Facility Tax Rate</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {organization?.taxRate || 7.0}%
          </p>
          <span className="text-[11px] text-slate-500">Jurisdiction: {organization?.state}, {organization?.country}</span>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 border-slate-200 flex justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search invoice number or patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 bg-slate-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 bg-slate-100/60 text-slate-500 font-semibold border-b border-slate-100 border-slate-200">
              <tr>
                <th className="p-4">Invoice # & Date</th>
                <th className="p-4">Patient</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Paid</th>
                <th className="p-4">Balance Due</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 hover:bg-slate-100/40 transition">
                  <td className="p-4">
                    <p className="font-mono font-bold text-slate-900 text-slate-800">{inv.invoiceNumber}</p>
                    <p className="text-[10px] text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-slate-700">{inv.patientName}</p>
                    <p className="text-[10px] text-slate-500">{inv.patientIdNumber}</p>
                  </td>
                  <td className="p-4 font-bold text-slate-900 text-slate-800">
                    ₹{inv.totalAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="p-4 text-emerald-600 font-semibold">
                    ₹{inv.paidAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="p-4 font-bold text-rose-600">
                    ₹{inv.balanceDue.toLocaleString("en-IN")}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-600'
                          : inv.status === 'PARTIALLY_PAID'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-600'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-600'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {inv.balanceDue > 0 && (
                      <button
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setPayAmount(inv.balanceDue);
                          setShowPayModal(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-slate-900 font-bold text-xs shadow-xs transition"
                      >
                        Collect Payment
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setShowPrintModal(true);
                      }}
                      className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                      title="Print Invoice Receipt"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Payment Modal */}
      {showPayModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-900 text-slate-800 mb-1">
              Record Payment &mdash; {selectedInvoice.invoiceNumber}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Patient: <strong>{selectedInvoice.patientName}</strong> • Balance: ${selectedInvoice.balanceDue.toFixed(2)}
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Payment Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  max={selectedInvoice.balanceDue}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white bg-slate-100 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white bg-slate-100 font-medium"
                >
                  <option value="CREDIT_CARD">Credit / Debit Card</option>
                  <option value="CASH">Cash (Front Desk)</option>
                  <option value="INSURANCE">Health Insurance Claim</option>
                  <option value="BANK_TRANSFER">Direct Bank ACH Wire</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Transaction Reference / Auth Code</label>
                <input
                  type="text"
                  required
                  value={payReference}
                  onChange={(e) => setPayReference(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white bg-slate-100"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-slate-900 font-bold transition"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Printable Receipt Modal */}
      {showPrintModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 bg-slate-100/60">
              <h3 className="text-sm font-bold text-slate-700">
                Invoice & Payment Receipt Preview
              </h3>
              <button onClick={() => setShowPrintModal(false)} className="text-xs px-3 py-1 rounded-lg bg-slate-200">
                Close
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 text-xs text-slate-700">
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 text-slate-800" style={{ color: organization?.brandColor }}>
                    {organization?.name}
                  </h2>
                  <p className="text-slate-500 text-[11px]">{organization?.address}, {organization?.city}</p>
                  <p className="text-slate-500 text-[11px]">Tax ID: {organization?.code} • Phone: {organization?.phone}</p>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <p className="font-mono font-bold text-sm text-slate-900 text-slate-800">{selectedInvoice.invoiceNumber}</p>
                  <p>Date: {new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                  <p>Status: <strong className="text-emerald-600">{selectedInvoice.status}</strong></p>
                </div>
              </div>

              {/* Patient */}
              <div className="p-3 bg-slate-50 bg-slate-100/50 rounded-xl grid grid-cols-2 gap-2 text-[11px]">
                <p><strong>Billed To:</strong> {selectedInvoice.patientName}</p>
                <p><strong>MRN #:</strong> {selectedInvoice.patientIdNumber}</p>
              </div>

              {/* Items */}
              <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 font-bold">
                  <tr>
                    <th className="p-3">Service / Medication Description</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 divide-slate-100">
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-semibold">{item.description}</td>
                      <td className="p-3 text-slate-500">{item.category}</td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">₹{item.unitPrice.toLocaleString("en-IN")}</td>
                      <td className="p-3 text-right font-bold">₹{item.totalPrice.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs text-right">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>₹{selectedInvoice.subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Facility Tax ({organization?.taxRate || 7}%):</span>
                    <span>₹{selectedInvoice.taxAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-900 text-slate-800 pt-1 border-t border-slate-200">
                    <span>Total Amount:</span>
                    <span>₹{selectedInvoice.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Paid to Date:</span>
                    <span>₹{selectedInvoice.paidAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Balance Due:</span>
                    <span>₹{selectedInvoice.balanceDue.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 bg-slate-100/60 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-slate-900 text-xs font-semibold"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Financial Statement</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};




