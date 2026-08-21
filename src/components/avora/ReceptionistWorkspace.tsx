import React, { useState, useEffect, useCallback } from "react";
import {
  Users, UserPlus, Search, CheckCircle2, Clock, Calendar,
  AlertTriangle, Bell, Activity, ChevronRight, RefreshCw,
  Ticket, X, Phone, Hash, Stethoscope, BedDouble, LogOut,
  ArrowRight, Zap, MapPin, User, FileText, Heart
} from "lucide-react";
import { publishEvent } from "../../services/automationOrchestrator.js";
import { useAuth } from "../../context/AuthContext.js";
import { AvoraLogo } from "../common/AvoraLogo.js";

interface AppointmentEntry {
  id: string; token: string; patientId: string; patientName: string;
  age: number; gender: string; phone: string; doctor: string;
  doctorId: string; department: string; time: string; type: string;
  status: "SCHEDULED" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "NO_SHOW";
  priority: "NORMAL" | "URGENT" | "SENIOR" | "EMERGENCY";
}
interface WalkInForm {
  name: string; age: string; gender: string; phone: string;
  complaint: string; department: string; priority: string;
}

const MOCK_APPOINTMENTS: AppointmentEntry[] = [
  { id: "apt-001", token: "C-001", patientId: "pt-101", patientName: "Ananya Sharma", age: 42, gender: "Female", phone: "+91 98765 43210", doctor: "Dr. Ramesh Iyer", doctorId: "doc-1", department: "Cardiology", time: "10:00", type: "Follow-up", status: "CHECKED_IN", priority: "NORMAL" },
  { id: "apt-002", token: "C-002", patientId: "pt-102", patientName: "Rajesh Kumar", age: 58, gender: "Male", phone: "+91 87654 32109", doctor: "Dr. Ramesh Iyer", doctorId: "doc-1", department: "Cardiology", time: "10:15", type: "New", status: "SCHEDULED", priority: "URGENT" },
  { id: "apt-003", token: "G-001", patientId: "pt-103", patientName: "Priya Menon", age: 34, gender: "Female", phone: "+91 76543 21098", doctor: "Dr. Anita Bose", doctorId: "doc-2", department: "General Medicine", time: "10:20", type: "New", status: "SCHEDULED", priority: "NORMAL" },
  { id: "apt-004", token: "G-002", patientId: "pt-104", patientName: "Mohammed Ali", age: 65, gender: "Male", phone: "+91 65432 10987", doctor: "Dr. Anita Bose", doctorId: "doc-2", department: "General Medicine", time: "10:30", type: "Follow-up", status: "SCHEDULED", priority: "SENIOR" },
  { id: "apt-005", token: "P-001", patientId: "pt-105", patientName: "Kavitha Reddy", age: 28, gender: "Female", phone: "+91 54321 09876", doctor: "Dr. Sundar Raj", doctorId: "doc-3", department: "Pediatrics", time: "10:45", type: "New", status: "CHECKED_IN", priority: "NORMAL" },
  { id: "apt-006", token: "C-003", patientId: "pt-106", patientName: "Suresh Pillai", age: 52, gender: "Male", phone: "+91 43210 98765", doctor: "Dr. Ramesh Iyer", doctorId: "doc-1", department: "Cardiology", time: "11:00", type: "Procedure", status: "SCHEDULED", priority: "URGENT" },
  { id: "apt-007", token: "G-003", patientId: "pt-107", patientName: "Nirmala Devi", age: 70, gender: "Female", phone: "+91 32109 87654", doctor: "Dr. Anita Bose", doctorId: "doc-2", department: "General Medicine", time: "11:15", type: "Follow-up", status: "SCHEDULED", priority: "SENIOR" },
  { id: "apt-008", token: "O-001", patientId: "pt-108", patientName: "Arjun Singh", age: 38, gender: "Male", phone: "+91 21098 76543", doctor: "Dr. Vikram Nair", doctorId: "doc-4", department: "Orthopedics", time: "11:30", type: "New", status: "SCHEDULED", priority: "NORMAL" },
];

const DEPARTMENTS = ["Cardiology","General Medicine","Pediatrics","Orthopedics","Neurology","Gynecology","ENT","Dermatology"];

const STATUS_CONFIG = {
  SCHEDULED:  { label: "Scheduled",  color: "#64748b", bg: "rgba(100,116,139,0.12)" },
  CHECKED_IN: { label: "Checked In", color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
  IN_PROGRESS:{ label: "In Progress",color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  COMPLETED:  { label: "Completed",  color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  NO_SHOW:    { label: "No Show",    color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};
const PRIORITY_CONFIG = {
  NORMAL:    { label: "Normal",    color: "#22c55e" },
  URGENT:    { label: "Urgent",    color: "#f97316" },
  SENIOR:    { label: "Senior",    color: "#a78bfa" },
  EMERGENCY: { label: "Emergency", color: "#ef4444" },
};

export const ReceptionistWorkspace: React.FC = () => {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentEntry[]>(MOCK_APPOINTMENTS);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [selectedApt, setSelectedApt] = useState<AppointmentEntry | null>(null);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [checkedInNotif, setCheckedInNotif] = useState<string | null>(null);
  const [walkIn, setWalkIn] = useState<WalkInForm>({ name: "", age: "", gender: "Male", phone: "", complaint: "", department: "General Medicine", priority: "NORMAL" });
  const [walkInLoading, setWalkInLoading] = useState(false);
  const [tokenCounter, setTokenCounter] = useState(10);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pulse, setPulse] = useState(false);

  useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { const t = setInterval(() => setPulse(p => !p), 1500); return () => clearInterval(t); }, []);

  const stats = {
    total: appointments.length,
    checkedIn: appointments.filter(a => a.status === "CHECKED_IN" || a.status === "IN_PROGRESS").length,
    pending: appointments.filter(a => a.status === "SCHEDULED").length,
    completed: appointments.filter(a => a.status === "COMPLETED").length,
    noShow: appointments.filter(a => a.status === "NO_SHOW").length,
    urgent: appointments.filter(a => a.priority === "URGENT" || a.priority === "EMERGENCY").length,
  };

  const filteredApts = appointments.filter(a => {
    const matchSearch = !search || a.patientName.toLowerCase().includes(search.toLowerCase()) || a.token.toLowerCase().includes(search.toLowerCase()) || a.phone.includes(search);
    const matchDept = filterDept === "ALL" || a.department === filterDept;
    const matchStatus = filterStatus === "ALL" || a.status === filterStatus;
    return matchSearch && matchDept && matchStatus;
  });

  const handleCheckIn = async (apt: AppointmentEntry) => {
    setCheckingIn(apt.id);
    try {
      await publishEvent(user?.organizationId || "org-apex-01", "PatientCheckedIn", {
        patientId: apt.patientId, patientName: apt.patientName,
        departmentId: apt.department, doctorId: apt.doctorId,
        token: apt.token, room: `OPD ${apt.department} Room`, appointmentId: apt.id,
      });
      setAppointments(prev => prev.map(a => a.id === apt.id ? { ...a, status: "CHECKED_IN" } : a));
      setCheckedInNotif(`${apt.patientName} checked in (${apt.token}). Nurse vitals task created automatically.`);
      setSelectedApt(null);
      setTimeout(() => setCheckedInNotif(null), 6000);
    } catch (err) { console.error("Check-in failed:", err); }
    finally { setCheckingIn(null); }
  };

  const handleMarkNoShow = (aptId: string) => {
    setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, status: "NO_SHOW" } : a));
    setSelectedApt(null);
  };

  const handleWalkIn = async () => {
    if (!walkIn.name || !walkIn.phone) return;
    setWalkInLoading(true);
    const deptCode = walkIn.department.charAt(0).toUpperCase();
    const token = `${deptCode}-W${String(tokenCounter).padStart(2, "0")}`;
    const newApt: AppointmentEntry = {
      id: `walk-${Date.now()}`, token, patientId: `pt-walk-${Date.now()}`,
      patientName: walkIn.name, age: parseInt(walkIn.age) || 0, gender: walkIn.gender, phone: walkIn.phone,
      doctor: "Available Doctor", doctorId: "doc-2", department: walkIn.department,
      time: currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      type: "Walk-in", status: "SCHEDULED", priority: walkIn.priority as AppointmentEntry["priority"],
    };
    try {
      await publishEvent(user?.organizationId || "org-apex-01", "PatientCheckedIn", {
        patientId: newApt.patientId, patientName: walkIn.name,
        departmentId: walkIn.department, doctorId: "doc-2", token, room: `OPD ${walkIn.department} Room`,
      });
      setAppointments(prev => [{ ...newApt, status: "CHECKED_IN" }, ...prev]);
      setTokenCounter(c => c + 1);
      setCheckedInNotif(`Walk-in registered: ${walkIn.name} — Token ${token}`);
      setWalkIn({ name: "", age: "", gender: "Male", phone: "", complaint: "", department: "General Medicine", priority: "NORMAL" });
      setShowWalkIn(false);
      setTimeout(() => setCheckedInNotif(null), 6000);
    } catch (err) { console.error(err); }
    setWalkInLoading(false);
  };

  const s = {
    wrap: { minHeight: "100vh", background: "#070b18", color: "white", fontFamily: "'Inter', sans-serif" } as React.CSSProperties,
    header: { background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky" as const, top: 0, zIndex: 100, backdropFilter: "blur(20px)" },
    card: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 } as React.CSSProperties,
    pill: (color: string, bg: string) => ({ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color, background: bg, borderRadius: 20, padding: "3px 8px" }),
    btn: (primary?: boolean) => ({ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: primary ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.07)", color: "white", transition: "all 0.2s" } as React.CSSProperties),
    input: { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "8px 12px", color: "white", fontSize: 13, outline: "none", boxSizing: "border-box" as const } as React.CSSProperties,
    select: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "7px 10px", color: "white", fontSize: 12, outline: "none", cursor: "pointer" } as React.CSSProperties,
  };

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <AvoraLogo size={30} nameSize={14} />
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)" }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>Reception Desk</div>
            <div style={{ fontSize: 10, color: "#64748b" }}>{user?.name || "Receptionist"} · OPD Wing A</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, padding: "6px 12px" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#6366f1", boxShadow: pulse ? "0 0 10px #6366f1" : "none", transition: "box-shadow 0.5s" }} />
            <span style={{ fontSize: 12, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
          </div>
          <button style={s.btn(true)} onClick={() => setShowWalkIn(true)}><UserPlus size={14} /> Walk-in</button>
          <button onClick={logout} style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", borderRadius: 8, padding: "7px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <LogOut size={12} /> Logout
          </button>
        </div>
      </div>

      {checkedInNotif && (
        <div style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, margin: "12px 24px 0", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <CheckCircle2 size={16} color="#22c55e" />
          <span style={{ fontSize: 13, color: "#86efac", fontWeight: 600 }}>{checkedInNotif}</span>
          <button onClick={() => setCheckedInNotif(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#86efac", cursor: "pointer" }}><X size={14} /></button>
        </div>
      )}

      <div style={{ padding: "20px 24px", maxWidth: 1600 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Today's Appointments", value: stats.total, icon: <Calendar size={16} />, color: "#6366f1" },
            { label: "Checked In", value: stats.checkedIn, icon: <CheckCircle2 size={16} />, color: "#22c55e" },
            { label: "Pending Arrival", value: stats.pending, icon: <Clock size={16} />, color: "#f59e0b" },
            { label: "Completed", value: stats.completed, icon: <Activity size={16} />, color: "#0ea5e9" },
            { label: "No Show", value: stats.noShow, icon: <X size={16} />, color: "#ef4444" },
            { label: "Urgent / Priority", value: stats.urgent, icon: <AlertTriangle size={16} />, color: "#f97316" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} style={{ ...s.card, padding: 14, cursor: "default" }} onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")} onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
                <div style={{ color, opacity: 0.8 }}>{icon}</div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient name, token, phone..." style={{ ...s.input, paddingLeft: 32 }} />
              </div>
              <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={s.select}>
                <option value="ALL">All Departments</option>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={s.select}>
                <option value="ALL">All Status</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="CHECKED_IN">Checked In</option>
                <option value="COMPLETED">Completed</option>
                <option value="NO_SHOW">No Show</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredApts.map(apt => {
                const sc = STATUS_CONFIG[apt.status];
                const pc = PRIORITY_CONFIG[apt.priority];
                const isSelected = selectedApt?.id === apt.id;
                return (
                  <div key={apt.id} onClick={() => setSelectedApt(isSelected ? null : apt)} style={{ ...s.card, padding: "14px 16px", cursor: "pointer", borderLeft: `3px solid ${pc.color}`, transition: "all 0.2s", background: isSelected ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.04)", border: isSelected ? "1px solid rgba(99,102,241,0.3)" : `1px solid rgba(255,255,255,0.08)` }} onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background="rgba(255,255,255,0.07)";}} onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background="rgba(255,255,255,0.04)";}}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ minWidth: 56, background: "rgba(99,102,241,0.15)", borderRadius: 8, padding: "6px 10px", textAlign: "center" }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#818cf8" }}>{apt.token}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                          <span style={{ fontSize: 14, fontWeight: 700 }}>{apt.patientName}</span>
                          <span style={{ fontSize: 10, color: "#94a3b8" }}>{apt.age}y · {apt.gender}</span>
                          <span style={s.pill(pc.color, `${pc.color}22`)}>{pc.label}</span>
                        </div>
                        <div style={{ display: "flex", gap: 14, fontSize: 11, color: "#64748b", flexWrap: "wrap" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Stethoscope size={10} />{apt.doctor}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><MapPin size={10} />{apt.department}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock size={10} />{apt.time}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><FileText size={10} />{apt.type}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Phone size={10} />{apt.phone}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={s.pill(sc.color, sc.bg)}>{sc.label}</span>
                        {apt.status === "SCHEDULED" && (
                          <button onClick={e => { e.stopPropagation(); handleCheckIn(apt); }} disabled={checkingIn === apt.id} style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", border: "none", color: "white", borderRadius: 7, padding: "7px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                            {checkingIn === apt.id ? <RefreshCw size={11} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle2 size={11} />} Check In
                          </button>
                        )}
                        <ChevronRight size={14} color="#475569" style={{ transform: isSelected ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                      </div>
                    </div>
                    {isSelected && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {apt.status === "SCHEDULED" && (
                          <>
                            <button onClick={() => handleCheckIn(apt)} disabled={checkingIn === apt.id} style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", border: "none", color: "white", borderRadius: 7, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                              <CheckCircle2 size={12} /> Check In Patient
                            </button>
                            <button onClick={() => handleMarkNoShow(apt.id)} style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", borderRadius: 7, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                              <X size={12} /> Mark No Show
                            </button>
                          </>
                        )}
                        {apt.status === "CHECKED_IN" && (
                          <div style={{ fontSize: 11, color: "#86efac", display: "flex", alignItems: "center", gap: 6 }}>
                            <CheckCircle2 size={12} /> Patient checked in · Nurse task auto-created · Doctor notified
                          </div>
                        )}
                        <button style={s.btn()}><Phone size={12} /> Call Patient</button>
                        <button style={s.btn()}><FileText size={12} /> View Record</button>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredApts.length === 0 && (
                <div style={{ ...s.card, padding: 40, textAlign: "center", color: "#475569" }}>
                  <Search size={32} style={{ marginBottom: 12, opacity: 0.4, display: "block", margin: "0 auto 12px" }} />
                  <p>No appointments match your filters</p>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ ...s.card, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>Department Queue</div>
              {[
                { dept: "Cardiology", waiting: 4, doctor: "Dr. Ramesh Iyer", load: 78, color: "#6366f1" },
                { dept: "General Medicine", waiting: 3, doctor: "Dr. Anita Bose", load: 55, color: "#22c55e" },
                { dept: "Pediatrics", waiting: 2, doctor: "Dr. Sundar Raj", load: 40, color: "#0ea5e9" },
                { dept: "Orthopedics", waiting: 1, doctor: "Dr. Vikram Nair", load: 25, color: "#f59e0b" },
              ].map(({ dept, waiting, doctor, load, color }) => (
                <div key={dept} style={{ marginBottom: 12, padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{dept}</span>
                    <span style={{ fontSize: 11, color, fontWeight: 700 }}>{waiting} waiting</span>
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b", marginBottom: 6 }}>{doctor}</div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 4 }}>
                    <div style={{ height: "100%", background: color, borderRadius: 4, width: `${load}%`, transition: "width 1s ease" }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ ...s.card, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>Today Summary</div>
              {[
                { label: "Shift Start", value: "08:00 AM" }, { label: "Walk-ins Today", value: "3" },
                { label: "Avg Wait Time", value: "14 min", highlight: true }, { label: "Next Appointment", value: "10:15" },
              ].map(({ label, value, highlight }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 11 }}>
                  <span style={{ color: "#64748b" }}>{label}</span>
                  <span style={{ color: highlight ? "#f59e0b" : "#94a3b8", fontWeight: highlight ? 700 : 400 }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ ...s.card, padding: 16, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Zap size={14} color="#818cf8" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#818cf8" }}>AVORA Automation Active</span>
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.7 }}>
                When you check in a patient, AVORA automatically:
                {["Creates nurse vitals task", "Notifies the assigned doctor", "Opens patient queue entry", "Starts journey timer"].map(action => (
                  <div key={action} style={{ display: "flex", alignItems: "center", gap: 6, color: "#86efac", marginTop: 4 }}>
                    <CheckCircle2 size={10} /> {action}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showWalkIn && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(4px)" }}>
          <div style={{ width: 480, padding: 24, background: "#0d1627", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <UserPlus size={18} color="#6366f1" />
                <span style={{ fontSize: 16, fontWeight: 700 }}>Walk-in Registration</span>
              </div>
              <button onClick={() => setShowWalkIn(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[{ label: "Patient Name *", key: "name", placeholder: "Full name" }, { label: "Phone *", key: "phone", placeholder: "+91 XXXXX XXXXX" }, { label: "Age", key: "age", placeholder: "Years" }, { label: "Chief Complaint", key: "complaint", placeholder: "Brief description" }].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4, display: "block" }}>{label}</label>
                  <input value={walkIn[key as keyof WalkInForm]} onChange={e => setWalkIn(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} style={s.input} />
                </div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { label: "Gender", key: "gender", opts: ["Male","Female","Other"] },
                  { label: "Department", key: "department", opts: DEPARTMENTS },
                  { label: "Priority", key: "priority", opts: ["NORMAL","URGENT","SENIOR","EMERGENCY"] },
                ].map(({ label, key, opts }) => (
                  <div key={key}>
                    <label style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4, display: "block" }}>{label}</label>
                    <select value={walkIn[key as keyof WalkInForm]} onChange={e => setWalkIn(p => ({ ...p, [key]: e.target.value }))} style={{ ...s.select, width: "100%" }}>
                      {opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button onClick={() => setShowWalkIn(false)} style={{ ...s.btn(), flex: 1, justifyContent: "center" }}>Cancel</button>
                <button onClick={handleWalkIn} disabled={walkInLoading || !walkIn.name || !walkIn.phone} style={{ ...s.btn(true), flex: 2, justifyContent: "center", opacity: (!walkIn.name || !walkIn.phone) ? 0.5 : 1 }}>
                  {walkInLoading ? <RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} /> : <><UserPlus size={13} /> Register & Check In</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};