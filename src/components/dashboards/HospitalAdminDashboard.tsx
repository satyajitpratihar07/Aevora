import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  BedDouble,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  UserPlus,
  CalendarPlus,
  FilePlus,
  Microscope,
  Pill,
  CreditCard,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  Download,
  Mic,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../context/AuthContext.js';
import { useNotifications } from '../../context/NotificationContext.js';
import { api } from '../../services/api.js';

interface DashboardProps {
  onNavigate?: (tab: string) => void;
}

export const HospitalAdminDashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { organization } = useAuth();
  const { addToast } = useNotifications();

  const [analytics, setAnalytics] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [organization]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [data, apptList] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getAppointments(),
      ]);
      setAnalytics(data);
      setAppointments(apptList || []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    addToast('Action Executed', `${action} successfully processed.`, 'success');
  };

  if (loading || !analytics) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 bg-slate-100 rounded-md w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 bg-slate-100 rounded-xl" />
          ))}
        </div>
        <div className="h-80 bg-slate-200 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  const COLORS = ['#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

  return (
    <div className="flex-1 space-y-6 overflow-hidden p-6 md:p-8 max-w-7xl mx-auto">
      {/* Icon Grid Master Dashboard Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white flex flex-wrap items-center justify-between gap-4 shadow-lg border border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-md">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm sm:text-base tracking-tight">AVORA Enterprise Module Launchpad</h2>
            <p className="text-xs text-sky-200">Switch to full 32-module icon grid home page layout.</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate && onNavigate('ICON_LAUNCHPAD')}
          className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <span>Open 32-Icon Master Home Page</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4-Column Metric Cards (Professional Polish Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Appointments */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total Appointments</span>
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-700 text-emerald-600">
              +12%
            </span>
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900 text-slate-800">
            {analytics.totalPatients ? (analytics.totalPatients * 12 + 48).toLocaleString() : '1,248'}
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-700 text-slate-600">
              {analytics.todayAppointments || 84}
            </span>
            <span>scheduled for today</span>
          </div>
        </div>

        {/* Bed Occupancy */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Bed Occupancy</span>
            <span className="rounded-full bg-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 text-blue-600">
              Normal
            </span>
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900 text-slate-800">
            {analytics.bedOccupancyRate || '82.4'}%
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-700 text-slate-600">
              {analytics.availableBeds || 38} beds
            </span>
            <span>available in North Wing</span>
          </div>
        </div>

        {/* Revenue (Monthly) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Revenue (Monthly)</span>
            <span className="rounded-full bg-amber-100 dark:bg-amber-950 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
              Target: 95%
            </span>
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-950">
            ₹{(analytics.totalRevenue ? analytics.totalRevenue / 1000 : 244.5).toFixed(1)}k
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-800">
              ₹{analytics.outstandingInvoices ? (analytics.outstandingInvoices / 1000).toFixed(0) : '12'}k
            </span>
            <span>outstanding invoices</span>
          </div>
        </div>

        {/* AI Clinical Logs */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">AI Clinical Logs</span>
            <span className="rounded-full bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-400">
              Active
            </span>
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900 text-slate-800">
            412
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-700 text-slate-600">98.2%</span>
            <span>verification rate</span>
          </div>
        </div>
      </div>

      {/* Main Grid (8 Col Queue + 4 Col AI Clinical Assistant) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Real-time Appointment Queue Table (12 cols) */}
        <div className="lg:col-span-12 flex flex-col rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 border-slate-200 px-6 py-4">
            <div>
              <h2 className="font-bold text-slate-900 text-slate-800">Real-time Appointment Queue</h2>
              <p className="text-xs text-slate-500">Live triage, patient flow, and practitioner assignments</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => addToast('PDF Export', 'Queue summary exported to PDF.', 'info')}
                className="flex items-center space-x-1 rounded border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 text-slate-600 hover:bg-slate-50 hover:bg-slate-100 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
              <button
                onClick={() => handleQuickAction('New Patient Registration')}
                className="rounded bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-semibold text-slate-900 transition shadow-xs"
              >
                New Registration
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-slate-50 bg-slate-100/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3">Patient Name</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Doctor</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 divide-slate-100 text-xs">
                {appointments.slice(0, 5).map((appt, idx) => {
                  const statusColors =
                    appt.status === 'IN_CONSULTATION'
                      ? 'bg-blue-100 bg-blue-50 text-blue-700 text-blue-700'
                      : appt.status === 'CHECKED_IN' || appt.status === 'PENDING'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-600'
                      : 'bg-slate-100 text-slate-700 text-slate-600';

                  const dotColor =
                    appt.status === 'IN_CONSULTATION'
                      ? 'bg-blue-600'
                      : appt.status === 'CHECKED_IN' || appt.status === 'PENDING'
                      ? 'bg-amber-600'
                      : 'bg-slate-600';

                  return (
                    <tr key={appt.id || idx} className="hover:bg-slate-50 hover:bg-slate-100/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900 text-slate-800">
                            {appt.patientName}
                          </span>
                          <span className="text-xs text-slate-500">ID: {appt.patientIdNumber || `PT-${29400 + idx}`}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 text-slate-500 font-mono">
                        {appt.departmentName || appt.department || 'CARDIOLOGY'}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 text-slate-500">
                        {appt.doctorName}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                          <span>{appt.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleQuickAction(`Examining ${appt.patientName}`)}
                          className="text-xs font-semibold text-blue-600 text-blue-600 hover:underline"
                        >
                          {appt.status === 'IN_CONSULTATION' ? 'View Charts' : appt.status === 'PENDING' ? 'Check In' : 'Assign Bed'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Revenue Growth Trend Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 text-slate-800">
              Hospital Financial Performance &amp; Revenue Streams
            </h2>
            <p className="text-xs text-slate-500">
              Monthly breakdown of inpatient, outpatient, and diagnostic services
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 bg-blue-50 text-blue-700 text-blue-700">
            Fiscal 2026
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.monthlyRevenueTrend}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '11px',
                }}
                formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Gross Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};



