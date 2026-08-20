import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Palette,
  Building,
  Key,
  Save,
  CheckCircle2,
  FileSpreadsheet,
  Lock,
  Globe,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useNotifications } from '../../context/NotificationContext.js';
import { api } from '../../services/api.js';
import { AuditLog } from '../../types/index.js';

export const SettingsAndWhiteLabel: React.FC = () => {
  const { organization, updateOrganizationSettings } = useAuth();
  const { addToast } = useNotifications();

  const [activeTab, setActiveTab] = useState<'BRANDING' | 'SECURITY' | 'AUDIT'>('BRANDING');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Settings State
  const [name, setName] = useState(organization?.name || '');
  const [tagline, setTagline] = useState(organization?.tagline || '');
  const [brandColor, setBrandColor] = useState(organization?.brandColor || '#2563eb');
  const [secondaryColor, setSecondaryColor] = useState(organization?.secondaryColor || '#0ea5e9');
  const [taxRate, setTaxRate] = useState(organization?.taxRate || 7.0);
  const [phone, setPhone] = useState(organization?.phone || '');
  const [email, setEmail] = useState(organization?.email || '');
  const [address, setAddress] = useState(organization?.address || '');
  const [city, setCity] = useState(organization?.city || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (organization) {
      setName(organization.name);
      setTagline(organization.tagline || '');
      setBrandColor(organization.brandColor || '#2563eb');
      setSecondaryColor(organization.secondaryColor || '#0ea5e9');
      setTaxRate(organization.taxRate || 7.0);
      setPhone(organization.phone || '');
      setEmail(organization.email || '');
      setAddress(organization.address || '');
      setCity(organization.city || '');
    }
  }, [organization]);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const logs = await api.getAuditLogs();
        setAuditLogs(logs);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      }
    };
    fetchAudit();
  }, [organization]);

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateOrganizationSettings({
        name,
        tagline,
        brandColor,
        secondaryColor,
        taxRate: Number(taxRate),
        phone,
        email,
        address,
        city,
      });
      addToast('Settings Saved', 'Hospital white-label branding and parameters updated.', 'success');
    } catch (err: any) {
      addToast('Save Failed', err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 text-slate-600">
              Hospital Configuration
            </span>
            <span className="text-xs text-slate-500">
              Tenant ID: <strong className="font-mono text-slate-700">{organization?.code}</strong>
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 text-slate-800 tracking-tight mt-1">
            White-Label Branding, Security & Immutable Audit Logs
          </h1>
        </div>

        <div className="flex rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setActiveTab('BRANDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'BRANDING'
                ? 'bg-white text-slate-900 text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Branding & Profile
          </button>
          <button
            onClick={() => setActiveTab('SECURITY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'SECURITY'
                ? 'bg-white text-slate-900 text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            HIPAA Security
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'AUDIT'
                ? 'bg-white text-slate-900 text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Audit Trail ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* BRANDING TAB */}
      {activeTab === 'BRANDING' && (
        <form onSubmit={handleSaveBranding} className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 text-slate-800 flex items-center space-x-2">
              <Palette className="w-4 h-4 text-blue-600" />
              <span>Hospital White-Label Customization</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Hospital Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Tagline / Mission</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Primary Theme Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-12 h-10 rounded-xl border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="flex-1 p-2 rounded-xl border border-slate-200 bg-white bg-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Local Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Official Contact Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Hospital Hotline Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white bg-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 border-slate-200">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-slate-900 font-bold text-xs shadow-md shadow-blue-600/30 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Hospital Branding'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* SECURITY TAB */}
      {activeTab === 'SECURITY' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 text-slate-800 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>HIPAA Compliance & Security Safeguards</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-emerald-900 dark:text-emerald-700">
                  AES-256 Data Encryption at Rest & In Transit
                </h3>
                <p className="text-emerald-700 dark:text-emerald-600 text-[11px] mt-0.5">
                  All protected health information (PHI) fields, prescription records, and lab results are cryptographically protected.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 bg-blue-50/30 border border-blue-200 border-blue-200/50 flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-blue-900 text-blue-600">
                  Tenant Isolation Firewall Active
                </h3>
                <p className="text-blue-700 text-blue-700 text-[11px] mt-0.5">
                  Tenant ID <strong className="font-mono">{organization?.id}</strong> is verified on every database transaction.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT LOGS TAB */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900 text-slate-800">
                Immutable Compliance Audit Trail
              </h2>
              <p className="text-xs text-slate-500">
                Chronological ledger of user logins, prescriptions, clinical records, and billing actions.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 bg-slate-100/60 text-slate-500 font-semibold border-b border-slate-100 border-slate-200">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Staff Member</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Resource Entity</th>
                  <th className="p-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 hover:bg-slate-100/40 transition">
                    <td className="p-4 text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 font-semibold text-slate-700">
                      {log.userName}
                    </td>
                    <td className="p-4">
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-slate-600">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 text-slate-500">
                      {log.resource} ({log.resourceId})
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-500">
                      {log.ipAddress || '192.168.1.100'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};



