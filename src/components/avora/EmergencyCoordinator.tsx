import React, { useState } from "react";
import { AlertTriangle, Shield, CheckCircle2, Activity, BedDouble, Users, Save } from "lucide-react";
import { EmergencyType, EmergencySeverity } from "../../types/index.js";

interface Props {
  organizationId: string;
  availableDoctors?: number;
  availableNurses?: number;
  emergencyBeds?: number;
}

const EMERGENCY_TYPES: Array<{ key: EmergencyType; label: string; icon: string }> = [
  { key: "CARDIAC_ARREST", label: "Cardiac Arrest",  icon: "❤️‍🔥" },
  { key: "TRAUMA",         label: "Major Trauma",     icon: "🚑" },
  { key: "STROKE",         label: "Stroke",           icon: "🧠" },
  { key: "MASS_CASUALTY",  label: "Mass Casualty",    icon: "⚠️" },
  { key: "RESPIRATORY",    label: "Respiratory",      icon: "🫁" },
  { key: "OBSTETRIC",      label: "Obstetric",        icon: "🤱" },
  { key: "SURGE_CAPACITY", label: "Surge Capacity",   icon: "📈" },
  { key: "CUSTOM",         label: "Custom",           icon: "🚨" },
];

export const EmergencyCoordinator: React.FC<Props> = ({
  organizationId,
  availableDoctors = 8,
  availableNurses = 14,
  emergencyBeds = 5,
}) => {
  const [declared, setDeclared] = useState(false);
  const [selectedType, setSelectedType] = useState<EmergencyType | null>(null);
  const [severity, setSeverity] = useState<EmergencySeverity>("MAJOR");
  const [description, setDescription] = useState("");
  const [declaredAt] = useState(new Date());

  const handleDeclare = () => {
    if (!selectedType) return;
    setDeclared(true);
  };

  if (declared) {
    const elapsed = Math.floor((Date.now() - declaredAt.getTime()) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;

    return (
      <div style={{ background: "#0a0509", minHeight: "100vh", color: "white", fontFamily: "'Inter',sans-serif", padding: 24 }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {/* Emergency Active Banner */}
          <div style={{ background: "rgba(220,38,38,0.15)", border: "2px solid rgba(220,38,38,0.5)", borderRadius: 16, padding: 28, marginBottom: 24, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🚨</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#ef4444", margin: "0 0 4px 0" }}>EMERGENCY ACTIVE</h1>
            <p style={{ fontSize: 14, color: "#fca5a5", margin: "0 0 12px 0" }}>
              {EMERGENCY_TYPES.find(t => t.key === selectedType)?.label} — Severity: {severity}
            </p>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#ef4444" }}>
              {mins}:{String(secs).padStart(2, "0")}
            </div>
            <div style={{ fontSize: 10, color: "#fca5a5", marginTop: 2 }}>Response Time</div>
          </div>

          {/* Resource Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Doctors Deployed", value: Math.min(3, availableDoctors), color: "#6366f1", icon: <Users size={20} /> },
              { label: "Nurses Deployed",  value: Math.min(6, availableNurses),  color: "#0ea5e9", icon: <Activity size={20} /> },
              { label: "Emergency Beds",   value: emergencyBeds,                color: "#22c55e", icon: <BedDouble size={20} /> },
            ].map(({ label, value, color, icon }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${color}33`, borderRadius: 12, padding: 20, textAlign: "center" }}>
                <div style={{ color, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color }}>{value}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Auto-Created Tasks */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", margin: "0 0 14px 0", textTransform: "uppercase", letterSpacing: 0.5 }}>Auto-Created Emergency Tasks</h3>
            {[
              { title: "Triage — Emergency Department",    role: "NURSE",      status: "IN_PROGRESS" },
              { title: "Emergency physician notification", role: "DOCTOR",     status: "COMPLETED" },
              { title: "Clear emergency bay — Bay 1",     role: "NURSE",      status: "IN_PROGRESS" },
              { title: "Lab STAT orders activated",        role: "LAB_TECH",   status: "ASSIGNED" },
              { title: "Pharmacy emergency stock alert",   role: "PHARMACIST", status: "ASSIGNED" },
            ].map((task, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: task.status === "COMPLETED" ? "rgba(34,197,94,0.2)" : task.status === "IN_PROGRESS" ? "rgba(99,102,241,0.2)" : "rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {task.status === "COMPLETED" ? <CheckCircle2 size={12} style={{ color: "#22c55e" }} /> : <Activity size={12} style={{ color: task.status === "IN_PROGRESS" ? "#6366f1" : "#f59e0b" }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{task.title}</div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>{task.role}</div>
                </div>
                <span style={{ fontSize: 10, color: task.status === "COMPLETED" ? "#22c55e" : task.status === "IN_PROGRESS" ? "#6366f1" : "#f59e0b", fontWeight: 700 }}>{task.status}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setDeclared(false)}
            style={{ width: "100%", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e", borderRadius: 12, padding: "14px 0", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            ✓ Resolve Emergency — Enter Recovery Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#070b18", minHeight: "100vh", color: "white", fontFamily: "'Inter',sans-serif", padding: 24 }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={20} style={{ color: "#ef4444" }} />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Emergency Coordinator</h1>
            <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Declare, coordinate, and track hospital emergency responses</p>
          </div>
        </div>

        {/* Resource Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Emergency Beds Available", value: emergencyBeds,    color: "#22c55e" },
            { label: "Doctors Available",        value: availableDoctors, color: "#6366f1" },
            { label: "Nurses Available",         value: availableNurses,  color: "#0ea5e9" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 30, fontWeight: 900, color }}>{value}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Emergency Type */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", margin: "0 0 12px 0", textTransform: "uppercase", letterSpacing: 0.5 }}>Select Emergency Type</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {EMERGENCY_TYPES.map(et => (
              <button key={et.key} onClick={() => setSelectedType(et.key)} style={{ background: selectedType === et.key ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.02)", border: selectedType === et.key ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(255,255,255,0.06)", color: "white", borderRadius: 10, padding: "14px 10px", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{et.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 600 }}>{et.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Severity */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", margin: "0 0 12px 0", textTransform: "uppercase", letterSpacing: 0.5 }}>Severity Level</h3>
          <div style={{ display: "flex", gap: 10 }}>
            {(["MINOR", "MODERATE", "MAJOR", "CATASTROPHIC"] as EmergencySeverity[]).map(s => (
              <button key={s} onClick={() => setSeverity(s)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, cursor: "pointer", fontSize: 11, fontWeight: 700, transition: "all 0.2s", background: severity === s ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.02)", border: severity === s ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(255,255,255,0.06)", color: severity === s ? "#ef4444" : "#64748b" }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>Description (optional)</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
            placeholder="Describe the emergency situation..."
            style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "white", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
        </div>

        <button
          onClick={handleDeclare}
          disabled={!selectedType}
          style={{ width: "100%", padding: "16px 0", borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: selectedType ? "pointer" : "not-allowed", background: selectedType ? "linear-gradient(135deg,#dc2626,#ef4444)" : "rgba(255,255,255,0.05)", border: "none", color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all 0.3s" }}
        >
          <AlertTriangle size={18} />
          {selectedType ? "🚨 DECLARE EMERGENCY" : "Select emergency type to continue"}
        </button>
      </div>
    </div>
  );
};
