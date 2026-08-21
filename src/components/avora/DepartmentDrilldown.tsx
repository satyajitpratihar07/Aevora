import React from "react";
import { Activity, CheckCircle2 } from "lucide-react";
import { DepartmentLoad } from "../../types/index.js";
import { DEPT_ALERT_CONFIG } from "../../services/hospitalStateEngine.js";

interface Props { department: DepartmentLoad; onClose: () => void; }

export const DepartmentDrilldown: React.FC<Props> = ({ department: dept, onClose }) => {
  const conf = DEPT_ALERT_CONFIG[dept.alertLevel];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ background: "#0e1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 32, width: "min(640px,90vw)", maxHeight: "85vh", overflowY: "auto", color: "white", fontFamily: "'Inter',sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{dept.departmentName}</h2>
            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: conf.bg, color: conf.color, display: "inline-block", marginTop: 4, fontWeight: 700, border: `1px solid ${conf.color}33` }}>{conf.label}</span>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>
            Close
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Patients Waiting",      value: dept.patientsWaiting,      color: "#f59e0b" },
            { label: "In Consultation",        value: dept.patientsInConsultation, color: "#22c55e" },
            { label: "Average Wait",           value: `${dept.averageWaitMinutes}m`, color: "#0ea5e9" },
            { label: "Capacity",               value: `${dept.capacityPercentage}%`, color: dept.capacityPercentage > 80 ? "#ef4444" : "#22c55e" },
            { label: "Active Tasks",           value: dept.activeTasks,          color: "#6366f1" },
            { label: "Overdue Tasks",          value: dept.overdueTasks,         color: dept.overdueTasks > 3 ? "#ef4444" : "#64748b" },
            { label: "Doctors on Duty",        value: dept.doctorsOnDuty,        color: "#8b5cf6" },
            { label: "Doctors Available",      value: dept.doctorsAvailable,     color: "#22c55e" },
            { label: "Escalated Tasks",        value: dept.tasksInEscalation,    color: "#f97316" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 9, color: "#64748b", marginBottom: 4, textTransform: "uppercase" }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Capacity Bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "#64748b" }}>Capacity Utilization</span>
            <span style={{ fontSize: 11, color: conf.color, fontWeight: 700 }}>{dept.capacityPercentage}%</span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
            <div style={{ height: "100%", width: `${Math.min(100, dept.capacityPercentage)}%`, background: conf.color, borderRadius: 3, transition: "width 0.5s" }} />
          </div>
        </div>

        {/* Nurse ratio */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "#64748b" }}>Nursing Staff Available</span>
            <span style={{ fontSize: 11, color: "#0ea5e9", fontWeight: 700 }}>{dept.nursesAvailable} / {dept.nursesOnDuty}</span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
            <div style={{ height: "100%", width: `${dept.nursesOnDuty > 0 ? (dept.nursesAvailable / dept.nursesOnDuty) * 100 : 0}%`, background: "#0ea5e9", borderRadius: 3 }} />
          </div>
        </div>

        {/* Trend Info */}
        <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <Activity size={16} style={{ color: dept.trend === "WORSENING" ? "#ef4444" : dept.trend === "IMPROVING" ? "#22c55e" : "#f59e0b" }} />
          <div>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 2px 0" }}>
              Trend: <strong style={{ color: dept.trend === "WORSENING" ? "#ef4444" : dept.trend === "IMPROVING" ? "#22c55e" : "#f59e0b" }}>{dept.trend}</strong>
              {dept.trendPercentage > 0 ? ` (${dept.trendPercentage.toFixed(0)}% change)` : ""}
            </p>
            <p style={{ fontSize: 10, color: "#475569", margin: 0 }}>Last updated: {new Date(dept.computedAt).toLocaleTimeString()}</p>
          </div>
          {dept.overdueTasks === 0 && <CheckCircle2 size={16} style={{ color: "#22c55e", marginLeft: "auto" }} />}
        </div>
      </div>
    </div>
  );
};
