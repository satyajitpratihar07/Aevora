import React, { useState } from 'react';
import {
  Calendar, FileText, Stethoscope, HeartPulse, FlaskConical,
  Activity, BedDouble, CreditCard, UserCheck, Crosshair, Droplets,
  User, BarChart3, Pill, Wrench, Settings, TestTube, Package,
  Brain, BookOpen, FolderArchive, Calculator, Shield, Sparkles,
  Cpu, Briefcase, Users, FileCheck, Sparkle, Utensils, Truck,
  Search, Bell, ShieldAlert, ChevronRight, X, PhoneCall, RefreshCw,
  LogOut, Home, AlertTriangle
} from 'lucide-react';
import { NotificationBell } from '../common/NotificationBell.js';

interface Props {
  onNavigateModule?: (moduleId: string) => void;
  onLogout?: () => void;
}

interface ModuleItem {
  id: string;
  name: string;
  category: 'opd' | 'inpatient' | 'diagnostics' | 'admin' | 'logistics' | 'technical';
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  badge?: string;
  badgeColor?: string;
  description: string;
}

const MODULES: ModuleItem[] = [
  // Row 1
  { id: 'appointment', name: 'APPOINTMENT', category: 'opd', icon: Calendar, iconBg: 'from-rose-500 to-red-600', iconColor: 'text-rose-500', badge: '14 Pending', badgeColor: 'bg-rose-100 text-rose-700', description: 'Schedule & manage OPD patient appointments' },
  { id: 'patient_registration', name: 'PATIENT REGISTRATION', category: 'opd', icon: FileText, iconBg: 'from-sky-500 to-blue-600', iconColor: 'text-sky-500', badge: 'Walk-in Open', badgeColor: 'bg-sky-100 text-sky-700', description: 'New patient intake, UHID generation & demographics' },
  { id: 'outpatient', name: 'OUTPATIENT MANAGEMENT', category: 'opd', icon: Stethoscope, iconBg: 'from-blue-600 to-indigo-600', iconColor: 'text-blue-600', badge: '28 In Queue', badgeColor: 'bg-blue-100 text-blue-700', description: 'OPD doctor consults, queue status & token dispatch' },
  { id: 'health_checkup', name: 'HEALTH CHECKUP', category: 'opd', icon: HeartPulse, iconBg: 'from-pink-500 to-rose-600', iconColor: 'text-pink-500', description: 'Executive wellness packages & preventive screenings' },
  { id: 'laboratory', name: 'LABORATORY', category: 'diagnostics', icon: FlaskConical, iconBg: 'from-purple-500 to-violet-600', iconColor: 'text-purple-500', badge: '6 Ready', badgeColor: 'bg-purple-100 text-purple-700', description: 'Pathology lab orders, specimen tracking & automated reports' },
  { id: 'radiology', name: 'RADIOLOGY', category: 'diagnostics', icon: Activity, iconBg: 'from-indigo-500 to-blue-700', iconColor: 'text-indigo-500', badge: 'DICOM Sync', badgeColor: 'bg-indigo-100 text-indigo-700', description: 'X-Ray, MRI, CT Scan scheduling & PACS integration' },
  { id: 'inpatient', name: 'INPATIENT MANAGEMENT', category: 'inpatient', icon: BedDouble, iconBg: 'from-emerald-500 to-teal-600', iconColor: 'text-emerald-500', badge: '88% Occupied', badgeColor: 'bg-emerald-100 text-emerald-700', description: 'Ward bed matrix, admissions, transfers & discharge' },
  { id: 'inpatient_billing', name: 'INPATIENT BILLING', category: 'admin', icon: CreditCard, iconBg: 'from-amber-500 to-yellow-600', iconColor: 'text-amber-500', badge: 'TPA Active', badgeColor: 'bg-amber-100 text-amber-700', description: 'IPD estimates, interim billing, TPA claims & settlement' },

  // Row 2
  { id: 'nurse_station', name: 'NURSE STATION', category: 'inpatient', icon: UserCheck, iconBg: 'from-teal-500 to-emerald-600', iconColor: 'text-teal-500', badge: 'Shift Active', badgeColor: 'bg-teal-100 text-teal-700', description: 'Bed telemetry, MAR medication administration & vitals' },
  { id: 'operation_theatre', name: 'OPERATION THEATRE', category: 'inpatient', icon: Crosshair, iconBg: 'from-red-500 to-rose-700', iconColor: 'text-red-500', badge: '3 OT Active', badgeColor: 'bg-red-100 text-red-700', description: 'OT scheduling, surgical team roster & pacu monitoring' },
  { id: 'blood_bank', name: 'BLOOD BANK', category: 'diagnostics', icon: Droplets, iconBg: 'from-rose-600 to-red-800', iconColor: 'text-rose-600', badge: 'A+ Low', badgeColor: 'bg-rose-100 text-rose-700', description: 'Blood component inventory, cross-matching & donor logs' },
  { id: 'review_doctor', name: 'REVIEW DOCTOR', category: 'opd', icon: User, iconBg: 'from-sky-600 to-blue-700', iconColor: 'text-sky-600', description: 'Follow-up consultations & post-op clinical reviews' },
  { id: 'mis_reports', name: 'MIS REPORTS', category: 'admin', icon: BarChart3, iconBg: 'from-violet-600 to-purple-700', iconColor: 'text-violet-600', badge: 'Analytics', badgeColor: 'bg-violet-100 text-violet-700', description: 'Executive revenue, occupancy & operational performance' },
  { id: 'pharmacy', name: 'PHARMACY', category: 'logistics', icon: Pill, iconBg: 'from-cyan-500 to-blue-600', iconColor: 'text-cyan-500', badge: '12 Pending', badgeColor: 'bg-cyan-100 text-cyan-700', description: 'Prescription dispensing, drug inventory & batch control' },
  { id: 'software_management', name: 'SOFTWARE MANAGEMENT', category: 'technical', icon: Wrench, iconBg: 'from-slate-600 to-slate-800', iconColor: 'text-slate-600', description: 'SaaS white-label settings, API keys & module toggles' },
  { id: 'system_control', name: 'SYSTEM CONTROL', category: 'technical', icon: Settings, iconBg: 'from-slate-800 to-black', iconColor: 'text-slate-800', badge: 'v4.2 Live', badgeColor: 'bg-slate-200 text-slate-800', description: 'System parameters, audit trails & security governance' },

  // Row 3
  { id: 'phlebotomy', name: 'PHLEBOTOMY', category: 'diagnostics', icon: TestTube, iconBg: 'from-rose-500 to-pink-600', iconColor: 'text-rose-500', badge: 'Barcoding', badgeColor: 'bg-pink-100 text-pink-700', description: 'Blood sample collection, tube barcoding & lab dispatch' },
  { id: 'store_management', name: 'STORE MANAGEMENT', category: 'logistics', icon: Package, iconBg: 'from-orange-500 to-amber-600', iconColor: 'text-orange-500', description: 'Central medical stores, indenting & stock reordering' },
  { id: 'opd_clinical', name: 'OPD CLINICAL MANAGMENT', category: 'opd', icon: Brain, iconBg: 'from-blue-500 to-sky-600', iconColor: 'text-blue-500', badge: 'AI Assistant', badgeColor: 'bg-blue-100 text-blue-700', description: 'Gemini AI prescription drafting & contraindication alert' },
  { id: 'tally', name: 'TALLY / FINANCIALS', category: 'admin', icon: BookOpen, iconBg: 'from-emerald-600 to-green-700', iconColor: 'text-emerald-600', description: 'Accounting ledger integration, GST filing & vouchers' },
  { id: 'mrd', name: 'MRD (MEDICAL RECORDS)', category: 'admin', icon: FolderArchive, iconBg: 'from-sky-500 to-indigo-600', iconColor: 'text-sky-500', badge: 'ICD-10 Sync', badgeColor: 'bg-sky-100 text-sky-700', description: 'Medical Record Department archive & death/birth records' },
  { id: 'doctor_accounting', name: 'DOCTOR ACCOUNTING', category: 'admin', icon: Calculator, iconBg: 'from-green-600 to-teal-700', iconColor: 'text-green-600', description: 'Visiting consultant payouts, share calculation & TDS' },
  { id: 'asset_management', name: 'ASSET MANAGEMENT', category: 'logistics', icon: Shield, iconBg: 'from-indigo-600 to-purple-700', iconColor: 'text-indigo-600', description: 'Medical equipment lifecycle, RFID tracking & AMC contracts' },
  { id: 'cssd', name: 'CSSD (STERILIZATION)', category: 'logistics', icon: Sparkles, iconBg: 'from-teal-400 to-cyan-600', iconColor: 'text-teal-500', description: 'Central Sterile Supply Department autoclaving & trays' },

  // Row 4
  { id: 'equipment_maintenance', name: 'EQUIPMENT MAINTENANCE', category: 'technical', icon: Cpu, iconBg: 'from-blue-700 to-indigo-900', iconColor: 'text-blue-700', badge: 'Bio-Med', badgeColor: 'bg-blue-100 text-blue-700', description: 'Biomedical breakdown tickets & preventive calibration' },
  { id: 'doctor_management', name: 'DOCTOR MANAGEMENT', category: 'admin', icon: Briefcase, iconBg: 'from-sky-600 to-blue-700', iconColor: 'text-sky-600', description: 'Doctor credentialing, roster schedules & OPD slots' },
  { id: 'physiotherapy', name: 'PHYSIOTHERAPY', category: 'opd', icon: Activity, iconBg: 'from-emerald-500 to-teal-600', iconColor: 'text-emerald-500', description: 'Rehabilitation care plans, sessions & muscle assessment' },
  { id: 'hr_management', name: 'HR MANAGEMENT', category: 'admin', icon: Users, iconBg: 'from-purple-600 to-indigo-700', iconColor: 'text-purple-600', description: 'Staff payroll, attendance, duty rosters & recruitment' },
  { id: 'discharge_summary', name: 'DISCHARGE SUMMARY', category: 'inpatient', icon: FileCheck, iconBg: 'from-emerald-600 to-green-700', iconColor: 'text-emerald-600', badge: 'One-Click', badgeColor: 'bg-emerald-100 text-emerald-700', description: 'Auto-generate IPD discharge summaries with AI notes' },
  { id: 'housekeeping', name: 'HOUSEKEEPING & LAUNDRY', category: 'logistics', icon: Sparkle, iconBg: 'from-amber-600 to-orange-700', iconColor: 'text-amber-600', description: 'Bed sanitation, ward cleanliness & linen management' },
  { id: 'canteen', name: 'CANTEEN MANAGEMENT', category: 'logistics', icon: Utensils, iconBg: 'from-yellow-500 to-amber-600', iconColor: 'text-yellow-600', description: 'Patient dietary plans, staff meal orders & nutrition' },
  { id: 'ambulance', name: 'AMBULANCE MANAGEMENT', category: 'logistics', icon: Truck, iconBg: 'from-red-600 to-rose-700', iconColor: 'text-red-600', badge: '24/7 Fleet', badgeColor: 'bg-red-100 text-red-700', description: 'Emergency fleet dispatch, GPS tracking & oxygen status' }
];

export const AvoraIconLaunchpad: React.FC<Props> = ({ onNavigateModule, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModalModule, setActiveModalModule] = useState<ModuleItem | null>(null);

  const filteredModules = MODULES.filter(m => {
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLaunchModule = (moduleItem: ModuleItem) => {
    setActiveModalModule(moduleItem);
    if (onNavigateModule) {
      onNavigateModule(moduleItem.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex selection:bg-sky-500 selection:text-white font-sans text-slate-800">
      
      {/* -- 1. LEFT NAVY SIDEBAR (Exact match to screenshot!) ------------- */}
      <aside className="w-64 bg-[#1e293b] text-slate-300 flex flex-col shrink-0 border-r border-slate-800 shadow-xl">
        
        {/* Brand Header */}
        <div className="p-4 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-black shadow-md">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-white text-base tracking-tight leading-none">AVORA OS</p>
              <p className="text-[10px] text-sky-400 font-semibold mt-1">Enterprise HMS SaaS</p>
            </div>
          </div>
        </div>

        {/* Sidebar Nav List */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'all'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Home className="w-4 h-4" />
              <span>Dashboard (32 Modules)</span>
            </div>
            <span className="text-[10px] bg-slate-900/60 px-2 py-0.5 rounded-full font-bold">32</span>
          </button>

          <div className="pt-3 pb-1 px-3 text-[10px] uppercase font-mono font-bold tracking-widest text-slate-500">
            Departments & Systems
          </div>

          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => handleLaunchModule(m)}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${m.iconColor} group-hover:scale-110 transition-transform`} />
                  <span className="truncate">{m.name}</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 bg-[#0f172a] border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>AVORA Enterprise v4.2</span>
          {onLogout && (
            <button onClick={onLogout} title="Log Out" className="p-1 text-slate-400 hover:text-white transition">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* -- 2. MAIN CONTENT AREA ------------------------------------------ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 sticky top-0 z-30 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <h1 className="text-xl font-black text-slate-900 tracking-tight shrink-0">Dashboard</h1>
            
            {/* Live Search Input */}
            <div className="relative flex-1 hidden sm:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter 32 hospital modules (e.g., OPD, Pharmacy, OT, Billing)..."
                className="w-full pl-9 pr-4 py-2 text-xs font-medium bg-slate-100 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-sky-500 transition"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Real-Time Socket Connected</span>
            </div>

            <NotificationBell dark={false} />

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                AD
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-none">Admin Operations</p>
                <p className="text-[10px] text-slate-500 font-medium">AVORA Central Campus</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Body Grid */}
        <main className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Modules (32)' },
                { id: 'opd', label: 'OPD & Clinical' },
                { id: 'inpatient', label: 'Inpatient & Wards' },
                { id: 'diagnostics', label: 'Diagnostics & Labs' },
                { id: 'admin', label: 'Admin & Billing' },
                { id: 'logistics', label: 'Logistics & Stores' },
                { id: 'technical', label: 'Technical & Systems' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500 font-semibold">
              Showing <strong className="text-slate-800">{filteredModules.length}</strong> of 32 Modules
            </div>
          </div>

          {/* -- 32-MODULE ICON GRID (Exact match to screenshot circle layout!) -- */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-5 sm:gap-6">
            {filteredModules.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleLaunchModule(item)}
                  className="group relative flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-sky-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  {/* Circular White 3D Shadowed Icon Button */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border border-slate-200/90 shadow-md shadow-slate-200 flex items-center justify-center mb-2.5 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-sky-200">
                    
                    {/* Inner Colored Circle */}
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${item.iconBg} flex items-center justify-center text-white shadow-inner`}>
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>

                    {/* Badge */}
                    {item.badge && (
                      <span className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold border border-white/80 shadow-xs whitespace-nowrap ${item.badgeColor || 'bg-slate-800 text-white'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Module Label below Circle */}
                  <span className="font-extrabold text-[11px] sm:text-xs text-slate-800 tracking-tight leading-snug uppercase group-hover:text-sky-600 transition-colors">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>

        </main>

        {/* Footer */}
        <footer className="mt-auto py-4 px-8 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
          Copyright © 2026 AVORA Technologies (P) Ltd. All Rights Reserved. · Enterprise Hospital Operating System
        </footer>

      </div>

      {/* -- 3. INTERACTIVE MODULE LAUNCH MODAL ------------------------------ */}
      {activeModalModule && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className={`p-6 bg-gradient-to-r ${activeModalModule.iconBg} text-white flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                  {React.createElement(activeModalModule.icon, { className: "w-6 h-6" })}
                </div>
                <div>
                  <h3 className="font-black text-lg text-white uppercase">{activeModalModule.name}</h3>
                  <p className="text-xs text-white/80 font-medium">AVORA Enterprise Module</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalModule(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-slate-800">
              <p className="text-sm font-medium text-slate-600 leading-relaxed">
                {activeModalModule.description}
              </p>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-500 font-semibold">
                  <span>Module Status:</span>
                  <span className="text-emerald-600 font-bold">ONLINE & ACTIVE</span>
                </div>
                <div className="flex justify-between text-slate-500 font-semibold">
                  <span>Real-Time Sync:</span>
                  <span className="text-sky-600 font-bold">Firestore Socket Stream</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setActiveModalModule(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const mod = activeModalModule.id;
                    setActiveModalModule(null);
                    if (onNavigateModule) onNavigateModule(mod);
                  }}
                  className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <span>Launch Workspace</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};