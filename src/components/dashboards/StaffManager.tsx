import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  Search,
  Shield,
  Stethoscope,
  Mail,
  Phone,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useNotifications } from '../../context/NotificationContext.js';
import { api } from '../../services/api.js';
import { User, UserRole } from '../../types/index.js';

export const StaffManager: React.FC = () => {
  const { user, organization } = useAuth();
  const { addToast } = useNotifications();

  const [staff, setStaff] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Invite Form
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'DOCTOR' as UserRole,
    department: 'Cardiology',
    specialization: 'Interventional Cardiology',
    licenseNumber: 'MD-9281-MA',
  });

  useEffect(() => {
    fetchStaff();
  }, [organization]);

  const fetchStaff = async () => {
    try {
      const list = await api.getStaff();
      setStaff(list);
    } catch (err) {
      console.error('Failed to load staff list:', err);
    }
  };

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createStaff({
        ...newStaff,
        status: 'ACTIVE',
      });
      setStaff((prev) => [...prev, created]);
      setShowInviteModal(false);
      addToast('Staff Member Invited', `Invitation sent to ${created.name} (${created.role}).`, 'success');
    } catch (err: any) {
      addToast('Staff Creation Failed', err.message, 'error');
    }
  };

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 bg-blue-50 text-blue-700 text-blue-700">
              Clinical & Administrative HR
            </span>
            <span className="text-xs text-slate-500">
              Total Roster: <strong className="text-slate-700">{staff.length} Credentialed Personnel</strong>
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 text-slate-800 tracking-tight mt-1">
            Staff Directory, Role-Based Access & Medical Licensing
          </h1>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-slate-900 font-bold text-xs shadow-md shadow-blue-600/30 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite New Staff Member</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search staff name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto">
          {['ALL', 'DOCTOR', 'NURSE', 'PHARMACIST', 'LAB_TECHNICIAN', 'ACCOUNTANT', 'RECEPTIONIST', 'HOSPITAL_ADMIN'].map(
            (r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  roleFilter === r
                    ? 'bg-blue-600 text-slate-900 shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 text-slate-500'
                }`}
              >
                {r.replace('_', ' ')}
              </button>
            )
          )}
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((member) => (
          <div
            key={member.id}
            className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 hover:shadow-md transition"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-600 text-white font-bold text-sm flex items-center justify-center">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 text-slate-800">{member.name}</h3>
                  <p className="text-[10px] text-slate-500">{member.department || 'General Facility'}</p>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 bg-blue-50 text-blue-700 text-blue-700">
                {member.role.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-1 text-xs text-slate-600 text-slate-500 pt-1">
              <p className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{member.email}</span>
              </p>
              {member.phone && (
                <p className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{member.phone}</span>
                </p>
              )}
              {member.licenseNumber && (
                <p className="flex items-center space-x-2 font-mono text-[11px] text-indigo-600">
                  <Shield className="w-3.5 h-3.5" />
                  <span>License: {member.licenseNumber}</span>
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 border-slate-200 flex justify-between items-center text-[11px]">
              <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Active Credentials</span>
              </span>
              <span className="text-slate-500">2FA Verified</span>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 text-slate-800 mb-1">
              Invite Clinical or Administrative Staff
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              Assign role, department authorization, and medical credential license number.
            </p>

            <form onSubmit={handleInviteStaff} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  placeholder="e.g. Dr. Robert House, MD"
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white bg-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Work Email</label>
                  <input
                    type="email"
                    required
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Staff Role</label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as any })}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white bg-slate-100"
                  >
                    <option value="DOCTOR">Doctor</option>
                    <option value="NURSE">Nurse</option>
                    <option value="PHARMACIST">Pharmacist</option>
                    <option value="LAB_TECHNICIAN">Lab Tech</option>
                    <option value="ACCOUNTANT">Accountant</option>
                    <option value="RECEPTIONIST">Receptionist</option>
                    <option value="HOSPITAL_ADMIN">Hospital Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Department</label>
                  <input
                    type="text"
                    value={newStaff.department}
                    onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                    placeholder="e.g. Pediatrics"
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-slate-500 mb-1 font-semibold">Medical License #</label>
                  <input
                    type="text"
                    value={newStaff.licenseNumber}
                    onChange={(e) => setNewStaff({ ...newStaff, licenseNumber: e.target.value })}
                    placeholder="e.g. MD-99120"
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white bg-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-slate-900 font-bold transition"
                >
                  Issue Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};




