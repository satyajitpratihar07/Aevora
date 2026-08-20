import React, { useState, useEffect } from 'react';
import {
  Pill,
  Package,
  AlertTriangle,
  CheckCircle2,
  Search,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Printer,
  Barcode,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useNotifications } from '../../context/NotificationContext.js';
import { api } from '../../services/api.js';
import { Medicine, Prescription } from '../../types/index.js';

export const PharmacistDashboard: React.FC = () => {
  const { user, organization } = useAuth();
  const { addToast } = useNotifications();

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'DISPENSE' | 'CATALOG'>('DISPENSE');
  const [showAddMedModal, setShowAddMedModal] = useState(false);

  // New Medicine Form State
  const [newMed, setNewMed] = useState({
    name: '',
    genericName: '',
    category: 'ANTIBIOTIC',
    form: 'TABLET',
    strength: '500 mg',
    manufacturer: 'Pfizer Bio',
    batchNumber: `BT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    expiryDate: '2027-12-31',
    costPrice: 4.5,
    sellingPrice: 12.0,
    currentStock: 100,
    minStockLevel: 25,
    requiresPrescription: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meds, rxList] = await Promise.all([api.getMedicines(), api.getPrescriptions()]);
        setMedicines(meds);
        setPrescriptions(rxList);
      } catch (err) {
        console.error('Failed to load pharmacy data:', err);
      }
    };
    fetchData();
  }, [organization]);

  const handleDispensePrescription = async (rx: Prescription) => {
    try {
      await api.dispenseMedications({
        patientId: rx.patientId,
        patientName: rx.patientName,
        items: rx.items.map((item) => ({
          medicineName: item.medicineName,
          quantity: 1,
        })),
      });

      // Refresh medicines
      const refreshed = await api.getMedicines();
      setMedicines(refreshed);

      addToast(
        'Prescription Dispensed',
        `Medications for ${rx.patientName} have been dispensed and stock deducted.`,
        'success'
      );
    } catch (err: any) {
      addToast('Dispense Error', err.message || 'Failed to dispense', 'error');
    }
  };

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createMedicine(newMed as any);
      setMedicines((prev) => [...prev, created]);
      setShowAddMedModal(false);
      addToast('Medicine Added', `${created.name} added to pharmacy inventory.`, 'success');
    } catch (err: any) {
      addToast('Error Adding Medicine', err.message || 'Failed to add item', 'error');
    }
  };

  const filteredMeds = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-600">
              Pharmacy & Formulary Dispensing
            </span>
            <span className="text-xs text-slate-500">
              Pharmacist: <strong className="text-slate-700">{user?.name || 'Suresh Kumar, PharmD'}</strong>
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 text-slate-800 tracking-tight mt-1">
            Prescription Fulfillment & Inventory Management
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setActiveTab('DISPENSE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'DISPENSE'
                  ? 'bg-white text-slate-900 text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Dispense Queue ({prescriptions.length})
            </button>
            <button
              onClick={() => setActiveTab('CATALOG')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'CATALOG'
                  ? 'bg-white text-slate-900 text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Medicine Catalog ({medicines.length})
            </button>
          </div>

          <button
            onClick={() => setShowAddMedModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-slate-900 font-bold text-xs shadow-md shadow-amber-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* DISPENSE QUEUE TAB */}
      {activeTab === 'DISPENSE' && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Pending Hospital Prescriptions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prescriptions.map((rx) => (
              <div
                key={rx.id}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-600">
                      Rx #{rx.prescriptionNumber}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 text-slate-800 mt-0.5">
                      {rx.patientName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Doctor: <strong>{rx.doctorName}</strong> ({rx.doctorSpecialization})
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 bg-blue-50 text-blue-700 text-blue-700">
                    {rx.status}
                  </span>
                </div>

                {/* Items */}
                <div className="border border-slate-100 border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 divide-slate-100 text-xs">
                  {rx.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-slate-700">
                          {item.medicineName} ({item.dosage})
                        </span>
                        <p className="text-[10px] text-slate-500">{item.instructions}</p>
                      </div>
                      <span className="text-[11px] font-medium text-slate-500">{item.frequency}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[11px] text-slate-500">
                    Approved: {new Date(rx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    onClick={() => handleDispensePrescription(rx)}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-slate-900 font-bold text-xs shadow-xs transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Dispense & Print POS Receipt</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MEDICINE CATALOG & INVENTORY TAB */}
      {activeTab === 'CATALOG' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search medicine brand, generic name, or batch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 bg-slate-100/60 text-slate-500 font-semibold border-b border-slate-100 border-slate-200">
                  <tr>
                    <th className="p-4">Brand / Generic</th>
                    <th className="p-4">Strength & Form</th>
                    <th className="p-4">Batch Number</th>
                    <th className="p-4">Expiry Date</th>
                    <th className="p-4">Current Stock</th>
                    <th className="p-4">Selling Price</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 divide-slate-100">
                  {filteredMeds.map((med) => (
                    <tr key={med.id} className="hover:bg-slate-50/80 hover:bg-slate-100/40 transition">
                      <td className="p-4">
                        <p className="font-bold text-slate-900 text-slate-800">{med.name}</p>
                        <p className="text-[10px] text-slate-500">{med.genericName} • {med.manufacturer}</p>
                      </td>
                      <td className="p-4 text-slate-700 text-slate-600">
                        {med.strength} ({med.form})
                      </td>
                      <td className="p-4 font-mono font-medium text-slate-600 text-slate-500">
                        {med.batchNumber}
                      </td>
                      <td className="p-4 text-slate-600 text-slate-500">
                        {med.expiryDate}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900 text-slate-800">{med.currentStock}</span>{' '}
                        <span className="text-slate-500 text-[10px]">units</span>
                      </td>
                      <td className="p-4 font-bold text-slate-900 text-slate-800">
                        ₹{med.sellingPrice.toFixed(0)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            med.status === 'IN_STOCK'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-600'
                              : med.status === 'LOW_STOCK'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-600'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}
                        >
                          {med.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Medicine Modal */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6">
            <h2 className="text-sm font-bold text-slate-900 text-slate-800 mb-1">
              Add New Medicine to Catalog
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Register medication batch, unit pricing, and minimum stock threshold.
            </p>

            <form onSubmit={handleCreateMedicine} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 text-slate-500 mb-1">Brand Name</label>
                  <input
                    type="text"
                    required
                    value={newMed.name}
                    onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                    placeholder="e.g. Augmentin"
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-slate-500 mb-1">Generic Name</label>
                  <input
                    type="text"
                    required
                    value={newMed.genericName}
                    onChange={(e) => setNewMed({ ...newMed, genericName: e.target.value })}
                    placeholder="e.g. Amoxicillin + Clavulanate"
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white bg-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 text-slate-500 mb-1">Strength</label>
                  <input
                    type="text"
                    value={newMed.strength}
                    onChange={(e) => setNewMed({ ...newMed, strength: e.target.value })}
                    placeholder="e.g. 625 mg"
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-slate-500 mb-1">Batch #</label>
                  <input
                    type="text"
                    value={newMed.batchNumber}
                    onChange={(e) => setNewMed({ ...newMed, batchNumber: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-slate-500 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={newMed.currentStock}
                    onChange={(e) => setNewMed({ ...newMed, currentStock: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white bg-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 text-slate-500 mb-1">Unit Selling Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newMed.sellingPrice}
                    onChange={(e) => setNewMed({ ...newMed, sellingPrice: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-slate-500 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={newMed.expiryDate}
                    onChange={(e) => setNewMed({ ...newMed, expiryDate: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white bg-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-slate-900 font-bold transition"
                >
                  Save to Formulary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};




