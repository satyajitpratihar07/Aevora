import React, { useState, useEffect } from 'react';
import {
  Search,
  UserPlus,
  CalendarPlus,
  FilePlus,
  Pill,
  Microscope,
  BedDouble,
  CreditCard,
  X,
  Users,
  Building2,
  Stethoscope,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { Patient, Medicine, WardBed } from '../../types/index.js';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onSelectPatient?: (patient: Patient) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectPatient,
}) => {
  const { organization } = useAuth();
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [beds, setBeds] = useState<WardBed[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [patList, medList, bedList] = await Promise.all([
          api.getPatients(),
          api.getMedicines(),
          api.getBeds(),
        ]);
        setPatients(patList);
        setMedicines(medList);
        setBeds(bedList);
      } catch (err) {
        console.error('Command palette fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : undefined;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.patientIdNumber.toLowerCase().includes(query.toLowerCase()) ||
      p.phone.includes(query)
  );

  const filteredMedicines = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.genericName.toLowerCase().includes(query.toLowerCase()) ||
      m.sku.toLowerCase().includes(query.toLowerCase())
  );

  const quickActions = [
    { label: 'Register New Patient', icon: <UserPlus className="w-4 h-4 text-blue-500" />, tab: 'patients' },
    { label: 'Book Clinical Appointment', icon: <CalendarPlus className="w-4 h-4 text-emerald-500" />, tab: 'appointments' },
    { label: 'AI Prescription Studio', icon: <FilePlus className="w-4 h-4 text-indigo-500" />, tab: 'doctor' },
    { label: 'Pathology Diagnostics Orders', icon: <Microscope className="w-4 h-4 text-purple-500" />, tab: 'lab' },
    { label: 'Pharmacy Medicine Catalog', icon: <Pill className="w-4 h-4 text-amber-500" />, tab: 'pharmacy' },
    { label: 'Inpatient Bed & Ward Map', icon: <BedDouble className="w-4 h-4 text-cyan-500" />, tab: 'beds' },
    { label: 'Hospital Billing & Invoices', icon: <CreditCard className="w-4 h-4 text-rose-500" />, tab: 'billing' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Search Bar */}
        <div className="flex items-center px-4 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-500 shrink-0 mr-3" />
          <input
            type="text"
            placeholder="Search patients, EHR records, medicines, or execute action..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full py-4 text-sm bg-transparent text-slate-900 text-slate-800 placeholder-slate-400 focus:outline-hidden"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-500 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500 ml-2">
            ESC
          </span>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Quick Actions */}
          {!query && (
            <div>
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Quick Navigation & Workflows
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onNavigate(action.tab);
                      onClose();
                    }}
                    className="flex items-center space-x-3 px-3 py-2 rounded-xl text-left text-xs text-slate-700 text-slate-600 hover:bg-slate-100 hover:bg-slate-100 transition"
                  >
                    {action.icon}
                    <span className="font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Patients Results */}
          {filteredPatients.length > 0 && (
            <div>
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Patients ({filteredPatients.length})
              </p>
              <div className="space-y-1">
                {filteredPatients.slice(0, 5).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      if (onSelectPatient) onSelectPatient(p);
                      onNavigate('doctor');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-blue-50 dark:hover:bg-blue-950/40 transition group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 text-blue-700 flex items-center justify-center font-bold text-xs">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700 group-hover:text-blue-600">
                          {p.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {p.patientIdNumber} • {p.age}y {p.gender} • Blood {p.bloodGroup}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-slate-500">
                      {p.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Medicine Search Results */}
          {filteredMedicines.length > 0 && (
            <div>
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Pharmacy Stock ({filteredMedicines.length})
              </p>
              <div className="space-y-1">
                {filteredMedicines.slice(0, 4).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onNavigate('pharmacy');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-50 hover:bg-slate-100/60 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <Pill className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-slate-700">
                          {m.name} ({m.strength})
                        </p>
                        <p className="text-[11px] text-slate-500">{m.genericName} • {m.batchNumber}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-slate-700 text-slate-600">
                      {m.currentStock} units in stock
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && filteredPatients.length === 0 && filteredMedicines.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs">
              No matching EHR patients or medications found for &ldquo;{query}&rdquo;.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



