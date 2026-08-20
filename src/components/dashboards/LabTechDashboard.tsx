import React, { useState, useEffect } from 'react';
import {
  Microscope,
  TestTube,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  FileCheck,
  Plus,
  Search,
  ShieldAlert,
  ArrowUpDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useNotifications } from '../../context/NotificationContext.js';
import { api } from '../../services/api.js';
import { LabOrder, LabTest } from '../../types/index.js';

export const LabTechDashboard: React.FC = () => {
  const { user, organization } = useAuth();
  const { addToast } = useNotifications();

  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [testsCatalog, setTestsCatalog] = useState<LabTest[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Result Form State
  const [resultParameters, setResultParameters] = useState<Array<{
    name: string;
    value: string;
    unit: string;
    referenceRange: string;
    flag: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';
  }>>([]);
  const [conclusion, setConclusion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderList, catalog] = await Promise.all([api.getLabOrders(), api.getLabTests()]);
        setOrders(orderList);
        setTestsCatalog(catalog);
      } catch (err) {
        console.error('Failed to load lab data:', err);
      }
    };
    fetchData();
  }, [organization]);

  const handleOpenEnterResult = (order: LabOrder) => {
    setSelectedOrder(order);
    // Find catalog definition if available
    const catalogItem = testsCatalog.find((t) => t.code === order.testCode || t.name === order.testName);
    if (catalogItem && (!order.parameters || order.parameters.length === 0)) {
      setResultParameters(
        catalogItem.parameters.map((p) => ({
          name: p.name,
          value: '',
          unit: p.unit,
          referenceRange: `${p.minValue} - ${p.maxValue}`,
          flag: 'NORMAL',
        }))
      );
    } else if (order.parameters && order.parameters.length > 0) {
      setResultParameters(order.parameters);
      setConclusion(order.conclusion || '');
    } else {
      setResultParameters([
        { name: 'Primary Test Assay', value: '', unit: 'mg/dL', referenceRange: '70 - 100', flag: 'NORMAL' },
      ]);
    }
    setShowResultModal(true);
  };

  const handleUpdateParameterValue = (index: number, val: string) => {
    setResultParameters((prev) =>
      prev.map((param, i) => {
        if (i !== index) return param;
        const numVal = parseFloat(val);
        let flag: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL' = 'NORMAL';
        if (!isNaN(numVal) && param.referenceRange.includes('-')) {
          const parts = param.referenceRange.split('-').map((s) => parseFloat(s.trim()));
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            if (numVal < parts[0]) flag = 'LOW';
            else if (numVal > parts[1] * 1.5) flag = 'CRITICAL';
            else if (numVal > parts[1]) flag = 'HIGH';
          }
        }
        return { ...param, value: val, flag };
      })
    );
  };

  const handleSaveResults = async () => {
    if (!selectedOrder) return;
    setIsSubmitting(true);
    try {
      const updated = await api.updateLabOrder(selectedOrder.id, {
        parameters: resultParameters,
        conclusion,
        status: 'VERIFIED',
        verifiedBy: user?.name || 'Lab Technologist',
        verifiedAt: new Date().toISOString(),
      });

      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setShowResultModal(false);
      addToast('Diagnostic Results Verified', `Results for ${selectedOrder.testName} have been validated.`, 'success');
    } catch (err: any) {
      addToast('Error Verifying Results', err.message || 'Failed to save results', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-600">
              Pathology & Diagnostic Laboratory
            </span>
            <span className="text-xs text-slate-500">
              Technologist: <strong className="text-slate-700">{user?.name || 'Dr. Emily Vance, MLS'}</strong>
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 text-slate-800 tracking-tight mt-1">
            Diagnostic Orders Queue & Laboratory Reports
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <span className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-600 text-xs font-semibold border border-purple-200 dark:border-purple-900">
            {orders.filter((o) => o.status !== 'VERIFIED' && o.status !== 'PUBLISHED').length} Pending Analysis
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center space-x-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by patient, order #, or test name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 bg-slate-100/60 text-slate-500 font-semibold border-b border-slate-100 border-slate-200">
              <tr>
                <th className="p-4">Order # & Date</th>
                <th className="p-4">Patient</th>
                <th className="p-4">Diagnostic Test</th>
                <th className="p-4">Ordering Doctor</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 hover:bg-slate-100/40 transition">
                  <td className="p-4">
                    <p className="font-mono font-bold text-slate-900 text-slate-800">{order.orderNumber}</p>
                    <p className="text-[10px] text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="p-4 font-semibold text-slate-700">
                    {order.patientName}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Microscope className="w-4 h-4 text-purple-600 shrink-0" />
                      <div>
                        <p className="font-medium text-slate-700">{order.testName}</p>
                        <p className="text-[10px] text-slate-500">Specimen: {order.sampleType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 text-slate-500">{order.doctorName}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.priority === 'STAT_EMERGENCY'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 animate-pulse'
                          : order.priority === 'URGENT'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-600'
                          : 'bg-slate-100 text-slate-700 bg-slate-100 text-slate-600'
                      }`}
                    >
                      {order.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        order.status === 'VERIFIED' || order.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-600'
                          : 'bg-blue-100 text-blue-700 bg-blue-50 text-blue-700'
                      }`}
                    >
                      {order.status === 'VERIFIED' && <CheckCircle2 className="w-3 h-3" />}
                      <span>{order.status}</span>
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEnterResult(order)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-slate-900 font-semibold text-xs shadow-xs transition"
                    >
                      {order.status === 'VERIFIED' ? 'View/Edit' : 'Enter Results'}
                    </button>
                    {order.status === 'VERIFIED' && (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowPrintModal(true);
                        }}
                        className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-slate-600 transition"
                        title="Print Lab Report"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enter/Verify Lab Results Modal */}
      {showResultModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100 border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900 text-slate-800">
                  {selectedOrder.testName} &mdash; Result Verification
                </h3>
                <p className="text-xs text-slate-500">
                  Patient: <strong>{selectedOrder.patientName}</strong> • Order #{selectedOrder.orderNumber}
                </p>
              </div>
              <button
                onClick={() => setShowResultModal(false)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500"
              >
                Close
              </button>
            </div>

            {/* Assay Parameters Table */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Assay Measurement Parameters
              </span>

              <div className="space-y-2">
                {resultParameters.map((param, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 bg-slate-100/60 border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-2 text-xs items-center"
                  >
                    <div className="md:col-span-4 font-semibold text-slate-700">
                      {param.name}
                    </div>
                    <div className="md:col-span-3">
                      <input
                        type="text"
                        value={param.value}
                        onChange={(e) => handleUpdateParameterValue(idx, e.target.value)}
                        placeholder="Measured value"
                        className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-bold"
                      />
                    </div>
                    <div className="md:col-span-3 text-slate-500 text-[11px]">
                      {param.referenceRange} {param.unit}
                    </div>
                    <div className="md:col-span-2 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          param.flag === 'NORMAL'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-600'
                            : param.flag === 'CRITICAL'
                            ? 'bg-red-600 text-slate-900 animate-pulse'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-600'
                        }`}
                      >
                        {param.flag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pathologist Conclusion */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 text-slate-600 mb-1">
                Pathologist Clinical Interpretation & Conclusion
              </label>
              <textarea
                rows={2}
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                placeholder="e.g. Findings consistent with moderate microcytic hypochromic anemia. Recommend serum ferritin assay."
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white bg-slate-100 text-xs"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 border-slate-200">
              <button
                onClick={() => setShowResultModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveResults}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-slate-900 font-bold text-xs shadow-md shadow-purple-600/30 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Verifying...' : 'Authorize & Sign Lab Report'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lab Report Print Preview */}
      {showPrintModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 bg-slate-100/60">
              <h3 className="text-sm font-bold text-slate-700">
                Official Diagnostic Laboratory Report
              </h3>
              <button onClick={() => setShowPrintModal(false)} className="text-xs px-3 py-1 rounded-lg bg-slate-200">
                Close
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 text-xs text-slate-700">
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 text-slate-800">
                    {organization?.name} Laboratory Services
                  </h2>
                  <p className="text-slate-500 text-[11px]">CAP / CLIA Accredited Diagnostic Center</p>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <p><strong>Order #:</strong> {selectedOrder.orderNumber}</p>
                  <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Patient */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 bg-slate-100/50 rounded-xl text-[11px]">
                <p><strong>Patient:</strong> {selectedOrder.patientName}</p>
                <p><strong>Test:</strong> {selectedOrder.testName}</p>
                <p><strong>Specimen:</strong> {selectedOrder.sampleType}</p>
              </div>

              {/* Parameters */}
              <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 font-bold">
                  <tr>
                    <th className="p-3">Test Parameter</th>
                    <th className="p-3">Result</th>
                    <th className="p-3">Reference Range</th>
                    <th className="p-3">Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 divide-slate-100">
                  {selectedOrder.parameters?.map((p, i) => (
                    <tr key={i}>
                      <td className="p-3 font-semibold">{p.name}</td>
                      <td className="p-3 font-bold">{p.value} {p.unit}</td>
                      <td className="p-3 text-slate-500">{p.referenceRange} {p.unit}</td>
                      <td className="p-3">
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

              {selectedOrder.conclusion && (
                <div className="p-3 bg-slate-50 bg-slate-100/50 rounded-xl text-[11px]">
                  <strong>Interpretation & Impression:</strong> {selectedOrder.conclusion}
                </div>
              )}

              {/* Signoff */}
              <div className="flex justify-between items-end pt-6 border-t border-slate-200">
                <div className="text-[10px] text-slate-500">
                  Electronically Verified By {selectedOrder.verifiedBy || 'Pathology Staff'}
                </div>
                <div className="text-center font-serif italic text-purple-700">
                  Emily Vance, MLS (ASCP)
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 bg-slate-100/60 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-slate-900 text-xs font-semibold"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Lab Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



