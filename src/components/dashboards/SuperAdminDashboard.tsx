import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Building2,
  Users,
  Activity,
  Plus,
  Search,
  CheckCircle2,
  TrendingUp,
  Server,
  Zap,
  Globe,
  IndianRupee,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useNotifications } from '../../context/NotificationContext.js';
import { api } from '../../services/api.js';
import { Organization } from '../../types/index.js';

export const SuperAdminDashboard: React.FC = () => {
  const { user, switchOrganization } = useAuth();
  const { addToast } = useNotifications();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddOrgModal, setShowAddOrgModal] = useState(false);

  // New Organization Form State
  const [newOrg, setNewOrg] = useState({
    name: '',
    slug: '',
    code: '',
    tier: 'ENTERPRISE_HOSPITAL' as const,
    email: '',
    phone: '',
    address: '450 Healthcare Boulevard',
    city: 'Boston',
    state: 'MA',
    country: 'USA',
    brandColor: '#2563eb',
    maxDoctors: 150,
    maxBeds: 500,
    features: ['AI_CLINICAL_COPILOT', 'VOICE_DICTATION', 'PATHOLOGY_LAB', 'PHARMACY_POS', 'INPATIENT_BEDS'],
  });

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    try {
      const list = await api.getOrganizations();
      setOrganizations(list);
    } catch (err) {
      console.error('Failed to load organizations:', err);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createOrganization({
        ...newOrg,
        status: 'ACTIVE',
        subscriptionExpiresAt: '2028-12-31',
      } as any);

      setOrganizations((prev) => [...prev, created]);
      setShowAddOrgModal(false);
      addToast('Tenant Hospital Created', `${created.name} provisioned with isolated database tenancy.`, 'success');
    } catch (err: any) {
      addToast('Tenant Creation Failed', err.message, 'error');
    }
  };

  const filteredOrgs = organizations.filter(
    (o) =>
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-600">
              Super Admin SaaS Operations Control Plane
            </span>
            <span className="text-xs text-slate-500">
              Root Platform Administrator: <strong className="text-slate-700">{user?.name}</strong>
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 text-slate-800 tracking-tight mt-1">
            Multi-Tenant Healthcare Network & SaaS Subscriptions
          </h1>
        </div>

        <button
          onClick={() => setShowAddOrgModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-slate-900 font-bold text-xs shadow-md shadow-blue-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Hospital Tenant</span>
        </button>
      </div>

      {/* Global SaaS Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-blue-600 mb-1">
            <span className="text-xs font-semibold text-slate-500">Active Tenant Hospitals</span>
            <Building2 className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-900 text-slate-800">{organizations.length}</p>
          <span className="text-[11px] text-emerald-600 font-medium">100% Isolated Partitioning</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-purple-600 mb-1">
            <span className="text-xs font-semibold text-slate-500">Global AI Copilot Calls</span>
            <Zap className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-900 text-slate-800">84,920</p>
          <span className="text-[11px] text-purple-600 font-medium">Gemini 3.7 Flash Engine</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-emerald-600 mb-1">
            <span className="text-xs font-semibold text-slate-500">Monthly Recurring Revenue</span>
            <IndianRupee className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-900 text-slate-800">₹98,500</p>
          <span className="text-[11px] text-emerald-600 font-medium">+18.4% month over month</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-indigo-600 mb-1">
            <span className="text-xs font-semibold text-slate-500">Database Engine</span>
            <Server className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-900 text-slate-800">MySQL / Prisma</p>
          <span className="text-[11px] text-indigo-600 font-medium">ACID Compliant Healthcare DB</span>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 border-slate-200 flex justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search tenant hospital name or city..."
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
                <th className="p-4">Hospital Organization</th>
                <th className="p-4">Tenant Code</th>
                <th className="p-4">Subscription Tier</th>
                <th className="p-4">Location</th>
                <th className="p-4">Max Capacity</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Switch Tenant Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 divide-slate-100">
              {filteredOrgs.map((org) => (
                <tr key={org.id} className="hover:bg-slate-50/80 hover:bg-slate-100/40 transition">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-8 h-8 rounded-xl text-slate-900 font-bold flex items-center justify-center text-xs"
                        style={{ backgroundColor: org.brandColor || '#2563eb' }}
                      >
                        {org.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-slate-800">{org.name}</p>
                        <p className="text-[10px] text-slate-500">{org.email} • {org.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-blue-600">{org.code}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-600">
                      {org.tier}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 text-slate-500">
                    {org.city}, {org.state}, {org.country}
                  </td>
                  <td className="p-4 text-slate-600 text-slate-500">
                    {org.maxBeds} Beds • {org.maxDoctors} Doctors
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-600">
                      {org.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => switchOrganization(org)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-slate-900 dark:text-slate-900 font-semibold text-xs shadow-xs hover:opacity-90 transition"
                    >
                      Login As Tenant &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision New Hospital Modal */}
      {showAddOrgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <h2 className="text-sm font-bold text-slate-900 text-slate-800 mb-1">
              Provision New Enterprise Hospital Tenant
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              Configure tenant partition identifier, custom white-label branding, and licensed bed capacity.
            </p>

            <form onSubmit={handleCreateOrg} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Hospital Name</label>
                  <input
                    type="text"
                    required
                    value={newOrg.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
                      const code = name.replace(/[^A-Za-z]/g, '').substring(0, 4).toUpperCase();
                      setNewOrg({ ...newOrg, name, slug, code });
                    }}
                    placeholder="e.g. St. Jude Memorial Hospital"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Tenant Code (Unique)</label>
                  <input
                    type="text"
                    required
                    value={newOrg.code}
                    onChange={(e) => setNewOrg({ ...newOrg, code: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white bg-slate-100 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={newOrg.email}
                    onChange={(e) => setNewOrg({ ...newOrg, email: e.target.value })}
                    placeholder="admin@hospital.org"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Phone</label>
                  <input
                    type="text"
                    value={newOrg.phone}
                    onChange={(e) => setNewOrg({ ...newOrg, phone: e.target.value })}
                    placeholder="+1 (617) 555-0100"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Brand Color</label>
                  <input
                    type="color"
                    value={newOrg.brandColor}
                    onChange={(e) => setNewOrg({ ...newOrg, brandColor: e.target.value })}
                    className="w-full h-9 rounded-xl border border-slate-200 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Max Bed Capacity</label>
                  <input
                    type="number"
                    value={newOrg.maxBeds}
                    onChange={(e) => setNewOrg({ ...newOrg, maxBeds: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Max Doctor Seats</label>
                  <input
                    type="number"
                    value={newOrg.maxDoctors}
                    onChange={(e) => setNewOrg({ ...newOrg, maxDoctors: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white bg-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddOrgModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-slate-900 font-bold transition shadow-xs"
                >
                  Provision Isolated Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};




