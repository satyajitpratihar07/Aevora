import React, { useState } from 'react';
import {
  Cpu,
  Server,
  Activity,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  HardDrive,
  Wifi,
  Terminal,
  Database,
  Plus,
  X,
  Search,
  Filter,
  LogOut,
  Sliders,
  Settings,
  Bell,
  User,
  Radio,
  FileText,
  Lock,
  Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useNotifications } from '../../context/NotificationContext.js';

interface Ticket {
  id: string;
  title: string;
  category: 'Hardware' | 'Server/API' | 'Network' | 'PACS/Imaging' | 'Biomedical';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  reportedBy: string;
  assignedTo: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  timestamp: string;
  slaRemaining: string;
}

interface BioDevice {
  id: string;
  name: string;
  location: string;
  ip: string;
  battery: number;
  firmware: string;
  status: 'ONLINE' | 'WARNING' | 'OFFLINE';
  lastPing: string;
}

export const TechnicalDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { addToast } = useNotifications();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DEVICES' | 'TICKETS' | 'AUDIT' | 'BACKUP'>('OVERVIEW');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);

  // Maintenance tickets state
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 'TCK-2026-081',
      title: 'ICU Monitor Hub #4 High Latency Packet Drop',
      category: 'Biomedical',
      severity: 'HIGH',
      reportedBy: 'Nurse Sunita (Ward A)',
      assignedTo: 'Tech Ops Team',
      status: 'In Progress',
      timestamp: '2026-08-20 14:15',
      slaRemaining: '45 mins'
    },
    {
      id: 'TCK-2026-079',
      title: 'PACS DICOM Router Buffer Sync Delay',
      category: 'PACS/Imaging',
      severity: 'CRITICAL',
      reportedBy: 'Dr. Anjali Mehta',
      assignedTo: 'Alex Rivers (IT Ops)',
      status: 'Open',
      timestamp: '2026-08-20 13:40',
      slaRemaining: '15 mins'
    },
    {
      id: 'TCK-2026-072',
      title: 'Pharmacy Barcode Scanner Wireless Disconnect',
      category: 'Hardware',
      severity: 'MEDIUM',
      reportedBy: 'Pharmacist Desk',
      assignedTo: 'Field Engineering',
      status: 'Resolved',
      timestamp: '2026-08-20 10:20',
      slaRemaining: 'Met'
    }
  ]);

  const [newTicket, setNewTicket] = useState({
    title: '',
    category: 'Hardware' as Ticket['category'],
    severity: 'MEDIUM' as Ticket['severity'],
    reportedBy: 'Staff Member'
  });

  // Devices state
  const [devices, setDevices] = useState<BioDevice[]>([
    { id: 'BIO-ICU-001', name: 'ICU Telemetry Patient Monitor Hub', location: 'General Ward A / Bed B-101', ip: '192.168.4.12', battery: 98, firmware: 'v4.2.1-PROD', status: 'ONLINE', lastPing: '2s ago' },
    { id: 'BIO-ICU-004', name: 'Smart Infusion Syringe Pump Unit #4', location: 'ICU Unit / Bed B-104', ip: '192.168.4.15', battery: 74, firmware: 'v3.8.9', status: 'ONLINE', lastPing: '5s ago' },
    { id: 'BIO-RAD-009', name: 'MRI DICOM Image Processing Gateway', location: 'Radiology Building B', ip: '192.168.10.88', battery: 100, firmware: 'v5.1.0', status: 'WARNING', lastPing: '45s ago' },
    { id: 'BIO-VENT-02', name: 'Automated Ventilator Pressure Node #2', location: 'Emergency Care Unit', ip: '192.168.4.99', battery: 91, firmware: 'v4.0.2', status: 'ONLINE', lastPing: '1s ago' },
    { id: 'BIO-BED-105', name: 'Smart Bed Load Cell Mesh Sensor', location: 'Ward A / Bed B-105', ip: '192.168.4.201', battery: 42, firmware: 'v2.1.4', status: 'ONLINE', lastPing: '12s ago' }
  ]);

  // Audit Logs
  const auditLogs = [
    { id: 'LOG-9921', time: '14:28:10', user: 'system.daemon', event: 'Automated DB Snapshot Created', ip: '10.0.0.1', status: 'SUCCESS' },
    { id: 'LOG-9920', time: '14:25:02', user: 'tech.ops@hospital.org', event: 'FHIR API Gateway Rate Limit Adjusted', ip: '192.168.1.45', status: 'SUCCESS' },
    { id: 'LOG-9918', time: '14:18:44', user: 'dr.smith@hospital.org', event: 'EHR Access token issued', ip: '192.168.2.110', status: 'SUCCESS' },
    { id: 'LOG-9915', time: '14:02:11', user: 'unknown.client', event: 'Blocked Unauthorized SSH Probe', ip: '185.220.101.5', status: 'BLOCKED' }
  ];

  const handleCreateTicket = () => {
    if (!newTicket.title) return;
    const created: Ticket = {
      id: `TCK-2026-0${Math.floor(Math.random() * 90 + 10)}`,
      title: newTicket.title,
      category: newTicket.category,
      severity: newTicket.severity,
      reportedBy: newTicket.reportedBy,
      assignedTo: 'Tech Operations Desk',
      status: 'Open',
      timestamp: 'Just now',
      slaRemaining: '60 mins'
    };
    setTickets([created, ...tickets]);
    setShowCreateTicketModal(false);
    setNewTicket({ title: '', category: 'Hardware', severity: 'MEDIUM', reportedBy: 'Staff Member' });
    addToast('Ticket Opened', `Maintenance ticket ${created.id} created successfully.`, 'success');
  };

  const handleResolveTicket = (id: string) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: 'Resolved', slaRemaining: 'Met' } : t));
    addToast('Ticket Resolved', `Ticket ${id} marked as resolved.`, 'info');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Top Telemetry Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 py-3 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-950/50">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-base tracking-tight">AVORA</span>
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Technical Ops Console
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Infrastructure & Biomedical Mesh Monitor</p>
          </div>
        </div>

        {/* Center Nav Tabs */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
          {[
            { id: 'OVERVIEW', label: 'System Telemetry', icon: Activity },
            { id: 'DEVICES', label: 'Biomedical Devices', icon: HardDrive },
            { id: 'TICKETS', label: 'Incident Tickets', icon: AlertTriangle },
            { id: 'AUDIT', label: 'Audit Security Stream', icon: ShieldCheck },
            { id: 'BACKUP', label: 'Backups & Recovery', icon: Database }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition ${
                  isActive ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right User & Role Info */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">Role:</span>
            <span className="text-cyan-400 font-bold uppercase">{user?.role || 'TECHNICAL_STAFF'}</span>
          </div>

          <button
            onClick={() => { if (window.confirm('Logout from Technical Ops Console?')) logout(); }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-rose-900/60 bg-rose-950/30 text-rose-300 hover:bg-rose-900/60 text-xs font-bold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Mobile Sub-Navigation */}
      <div className="lg:hidden flex overflow-x-auto gap-2 p-3 bg-slate-900 border-b border-slate-800 text-xs">
        {[
          { id: 'OVERVIEW', label: 'Overview' },
          { id: 'DEVICES', label: 'Devices' },
          { id: 'TICKETS', label: 'Tickets' },
          { id: 'AUDIT', label: 'Audit Stream' },
          { id: 'BACKUP', label: 'Backups' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap ${
              activeTab === t.id ? 'bg-cyan-600 text-white' : 'bg-slate-950 text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Work Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'System Uptime SLA', value: '99.98%', icon: Server, color: 'text-emerald-400', sub: 'Cluster 01 Operational' },
                { label: 'FHIR API Latency', value: '24 ms', icon: Activity, color: 'text-cyan-400', sub: 'Average response' },
                { label: 'Database Load', value: '18%', icon: Database, color: 'text-amber-400', sub: '1,420 QPS' },
                { label: 'Connected Bio-Mesh Nodes', value: '142', icon: Radio, color: 'text-indigo-400', sub: '5 Wards Active' }
              ].map(card => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                      <span>{card.label}</span>
                      <Icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                    <p className="text-2xl font-black text-white font-mono">{card.value}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{card.sub}</p>
                  </div>
                );
              })}
            </div>

            {/* Core Infrastructure Services Status */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">Hospital Microservice Cluster & API Gateways</h3>
                  <p className="text-xs text-slate-400">Live health heartbeat monitoring across core healthcare services</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                  All Systems Operational
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Auth & OAuth 2.0 Gateway', status: 'HEALTHY', latency: '12ms', ip: '10.0.1.12' },
                  { name: 'EHR & Diagnostic Record Store', status: 'HEALTHY', latency: '28ms', ip: '10.0.1.15' },
                  { name: 'HL7 / FHIR Interop Gateway', status: 'HEALTHY', latency: '34ms', ip: '10.0.1.20' },
                  { name: 'DICOM PACS Image Server', status: 'WARN', latency: '110ms', ip: '10.0.2.80' },
                  { name: 'Ward Telemetry WebSockets', status: 'HEALTHY', latency: '8ms', ip: '10.0.3.05' },
                  { name: 'Ambient AI Inference Engine', status: 'HEALTHY', latency: '45ms', ip: '10.0.4.11' }
                ].map(service => (
                  <div key={service.name} className="p-4 rounded-2xl border border-slate-800 bg-slate-950 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{service.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{service.ip} · {service.latency}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                      service.status === 'HEALTHY' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {service.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Maintenance Tickets & Biomedical Quick Glance Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Incident Tickets */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Active Incident Tickets ({tickets.filter(t => t.status !== 'Resolved').length})</span>
                  </h3>
                  <button
                    onClick={() => setShowCreateTicketModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Ticket</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {tickets.slice(0, 3).map(ticket => (
                    <div key={ticket.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-cyan-400">{ticket.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            ticket.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}>
                            {ticket.severity}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-white mt-1">{ticket.title}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{ticket.reportedBy} · SLA: {ticket.slaRemaining}</p>
                      </div>

                      {ticket.status !== 'Resolved' && (
                        <button
                          onClick={() => handleResolveTicket(ticket.id)}
                          className="px-2.5 py-1 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-[11px] font-bold hover:bg-emerald-900 transition shrink-0"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bio Equipment Status Summary */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-cyan-400" />
                    <span>Biomedical Equipment Mesh ({devices.length})</span>
                  </h3>
                  <button onClick={() => setActiveTab('DEVICES')} className="text-xs text-cyan-400 font-semibold hover:underline">
                    View All Devices →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {devices.slice(0, 3).map(dev => (
                    <div key={dev.id} className="p-3 rounded-2xl border border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-white">{dev.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{dev.location} · {dev.ip}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          dev.status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {dev.status}
                        </span>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">Battery {dev.battery}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DEVICES TAB */}
        {activeTab === 'DEVICES' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white">Biomedical Device Telemetry Mesh</h2>
                <p className="text-xs text-slate-400">Live monitoring for ICU monitors, ventilators, smart beds & DICOM gateways</p>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter device ID, ward or IP..."
                  className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 w-64"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.id.toLowerCase().includes(searchQuery.toLowerCase())).map(device => (
                <div key={device.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-cyan-400">{device.id}</span>
                      <h3 className="font-bold text-white text-sm mt-0.5">{device.name}</h3>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      device.status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {device.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400 font-mono border-t border-b border-slate-800 py-3">
                    <div className="flex justify-between"><span>Location:</span><span className="text-white font-sans">{device.location}</span></div>
                    <div className="flex justify-between"><span>IP Address:</span><span className="text-cyan-300">{device.ip}</span></div>
                    <div className="flex justify-between"><span>Firmware:</span><span className="text-slate-300">{device.firmware}</span></div>
                    <div className="flex justify-between"><span>Last Ping:</span><span className="text-slate-300">{device.lastPing}</span></div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className={`h-full ${device.battery > 50 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${device.battery}%` }} />
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">{device.battery}% Battery</span>
                    </div>
                    <button
                      onClick={() => addToast('Device Ping', `Ping sent to ${device.id}. Response time 4ms.`, 'info')}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px]"
                    >
                      Ping Node
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TICKETS TAB */}
        {activeTab === 'TICKETS' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">IT & Equipment Maintenance Tickets</h2>
                <p className="text-xs text-slate-400">Manage hardware, software & network service requests</p>
              </div>
              <button
                onClick={() => setShowCreateTicketModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create Ticket</span>
              </button>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Ticket ID</th>
                    <th className="px-5 py-3.5">Title & Issue</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Severity</th>
                    <th className="px-5 py-3.5">Reported By</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {tickets.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-slate-950/50 transition">
                      <td className="px-5 py-4 font-mono font-bold text-cyan-400">{ticket.id}</td>
                      <td className="px-5 py-4 font-semibold text-white">{ticket.title}</td>
                      <td className="px-5 py-4 font-mono">{ticket.category}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          ticket.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {ticket.severity}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400">{ticket.reportedBy}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ticket.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'
                        }`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {ticket.status !== 'Resolved' && (
                          <button
                            onClick={() => handleResolveTicket(ticket.id)}
                            className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AUDIT TAB */}
        {activeTab === 'AUDIT' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">Real-Time Audit & Security Event Stream</h2>
              <p className="text-xs text-slate-400">Cryptographically logged system actions, authentication & network events</p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-3 font-mono text-xs">
              {auditLogs.map(log => (
                <div key={log.id} className="p-3 rounded-2xl border border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">{log.time}</span>
                    <span className="text-cyan-400 font-bold">{log.id}</span>
                    <span className="text-white">{log.event}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">User: {log.user}</span>
                    <span className="text-slate-500">IP: {log.ip}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BACKUP TAB */}
        {activeTab === 'BACKUP' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div>
              <h2 className="text-xl font-black text-white">Database Backup & Disaster Recovery</h2>
              <p className="text-xs text-slate-400">Automated backup schedules, cold storage snapshots & restore triggers</p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold text-white text-sm">Automated Hourly Snapshot Service</h3>
                  <p className="text-xs text-slate-400">Encrypted AES-256 backup stored across dual availability zones</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                  ACTIVE (Next in 32m)
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Last Successful Snapshot:</span>
                  <span className="font-mono text-cyan-300">2026-08-20 14:00:00 UTC (Size: 4.82 GB)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Recovery Point Objective (RPO):</span>
                  <span className="font-mono text-emerald-400">&lt; 15 Minutes</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Recovery Time Objective (RTO):</span>
                  <span className="font-mono text-emerald-400">&lt; 2 Minutes</span>
                </div>
              </div>

              <button
                onClick={() => addToast('Backup Initiated', 'Manual DB backup snapshot queued on primary node.', 'success')}
                className="w-full py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Trigger Immediate Manual Backup Snapshot</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* New Ticket Modal */}
      {showCreateTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Open Technical Maintenance Ticket</h3>
              <button onClick={() => setShowCreateTicketModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Issue Title & Details</label>
                <input
                  type="text"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  placeholder="e.g. ICU Bed #3 Telemetry Monitor Offline"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
                  >
                    <option value="Hardware">Hardware</option>
                    <option value="Server/API">Server/API</option>
                    <option value="Network">Network</option>
                    <option value="PACS/Imaging">PACS/Imaging</option>
                    <option value="Biomedical">Biomedical</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Severity</label>
                  <select
                    value={newTicket.severity}
                    onChange={(e) => setNewTicket({ ...newTicket, severity: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowCreateTicketModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-300 text-xs font-bold">
                Cancel
              </button>
              <button onClick={handleCreateTicket} className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow">
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
