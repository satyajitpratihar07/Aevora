import React, { useState, useEffect } from "react";
import { Activity, Clock, AlertTriangle, CheckCircle2, ArrowRight, User, RefreshCw, Zap } from "lucide-react";
import { db } from "../../services/firebase.js";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { generateMockJourneys, JOURNEY_STAGE_LABELS } from "../../services/patientJourneyEngine.js";
import { PatientJourney, JourneyStage } from "../../types/index.js";

interface Props { organizationId: string; }

const STAGE_ORDER: JourneyStage[] = [
  "REGISTERED","WAITING_NURSE","VITALS_IN_PROGRESS","WAITING_DOCTOR",
  "IN_CONSULTATION","LAB_ORDERED","LAB_PROCESSING","LAB_DONE",
  "WAITING_DOCTOR_REVIEW","PHARMACY_QUEUED","BILLING_PENDING","DISCHARGED"
];

const STAGE_COLORS: Partial<Record<JourneyStage, string>> = {
  REGISTERED: "#64748b", WAITING_NURSE: "#f59e0b", VITALS_IN_PROGRESS: "#0ea5e9",
  WAITING_DOCTOR: "#f97316", IN_CONSULTATION: "#6366f1", LAB_ORDERED: "#8b5cf6",
  LAB_PROCESSING: "#8b5cf6", LAB_DONE: "#22c55e", WAITING_DOCTOR_REVIEW: "#f97316",
  PHARMACY_QUEUED: "#ec4899", BILLING_PENDING: "#f59e0b", DISCHARGED: "#22c55e",
};

function minutesSince(isoStr: string): number {
  return Math.round((Date.now() - new Date(isoStr).getTime()) / 60000);
}

export const PatientJourneyTracker: React.FC<Props> = ({ organizationId }) => {
  const [journeys, setJourneys] = useState<PatientJourney[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJourney, setSelectedJourney] = useState<PatientJourney | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => { const t = setInterval(() => setTick(x => x + 1), 30000); return () => clearInterval(t); }, []);

  useEffect(() => {
    const q = query(
      collection(db, "patientJourneys"),
      where("organizationId", "==", organizationId),
      limit(30)
    );
    const unsub = onSnapshot(q, snap => {
      if (!snap.empty) {
        setJourneys(snap.docs.map(d => ({ id: d.id, ...d.data() } as PatientJourney)));
      } else {
        setJourneys(generateMockJourneys(organizationId));
      }
      setLoading(false);
    }, () => { setJourneys(generateMockJourneys(organizationId)); setLoading(false); });
    return () => unsub();
  }, [organizationId, tick]);

  const activeJourneys = journeys.filter(j => j.status === "ACTIVE");
  const stageGroups = STAGE_ORDER.reduce((acc, stage) => {
    acc[stage] = activeJourneys.filter(j => j.currentStage === stage);
    return acc;
  }, {} as Record<JourneyStage, PatientJourney[]>);

  const delayed = activeJourneys.filter(j => j.isDelayed).length;
  const avgWait = activeJourneys.length > 0
    ? Math.round(activeJourneys.reduce((s, j) => s + (j.totalWaitMinutes || 0), 0) / activeJourneys.length)
    : 0;

  const s = {
    card: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 } as React.CSSProperties,
    stageCard: (stage: JourneyStage, count: number) => ({
      background: count > 0 ? `${STAGE_COLORS[stage] || "#64748b"}12` : "rgba(255,255,255,0.02)",
      border: `1px solid ${count > 0 ? `${STAGE_COLORS[stage] || "#64748b"}33` : "rgba(255,255,255,0.05)"}`,
      borderRadius: 10, padding: "10px 12px", minWidth: 130, flexShrink: 0,
    } as React.CSSProperties),
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "#64748b" }}>
      <RefreshCw size={20} style={{ animation: "spin 1s linear infinite", marginRight: 10 }} />
      Loading patient journeys...
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div>
      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Active Patients", value: activeJourneys.length, color: "#6366f1", icon: <User size={16} /> },
          { label: "Delayed Journeys", value: delayed, color: "#ef4444", icon: <AlertTriangle size={16} /> },
          { label: "Avg Wait (min)", value: avgWait, color: "#f59e0b", icon: <Clock size={16} /> },
          { label: "Discharged Today", value: journeys.filter(j => j.status === "COMPLETED").length, color: "#22c55e", icon: <CheckCircle2 size={16} /> },
        ].map(({ label, value, color, icon }) => (
          <div key={label} style={{ ...s.card, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
              <span style={{ color, opacity: 0.8 }}>{icon}</span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Pipeline View */}
      <div style={{ ...s.card, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: "#94a3b8" }}>LIVE PATIENT PIPELINE</div>
        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "flex", gap: 10, minWidth: "max-content", alignItems: "flex-start" }}>
            {STAGE_ORDER.map((stage, i) => {
              const patientsHere = stageGroups[stage] || [];
              const color = STAGE_COLORS[stage] || "#64748b";
              return (
                <React.Fragment key={stage}>
                  <div style={s.stageCard(stage, patientsHere.length)}>
                    <div style={{ fontSize: 9, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                      {JOURNEY_STAGE_LABELS[stage]?.split(" ").slice(0, 2).join(" ") || stage}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color, marginBottom: 6 }}>{patientsHere.length}</div>
                    {patientsHere.slice(0, 3).map(j => {
                      const minsInStage = j.stages.length > 0 ? minutesSince(j.stages[j.stages.length - 1].enteredAt) : 0;
                      const isLate = minsInStage > (j.stages[j.stages.length - 1]?.expectedDurationMinutes || 30);
                      return (
                        <div key={j.id} onClick={() => setSelectedJourney(j)} style={{ fontSize: 9, padding: "3px 6px", borderRadius: 5, marginBottom: 3, background: isLate ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.05)", color: isLate ? "#f87171" : "#94a3b8", cursor: "pointer", whiteSpace: "nowrap" }}>
                          {j.patientName?.split(" ")[0]} · {minsInStage}m {isLate ? "?" : ""}
                        </div>
                      );
                    })}
                    {patientsHere.length > 3 && <div style={{ fontSize: 9, color: "#64748b" }}>+{patientsHere.length - 3} more</div>}
                  </div>
                  {i < STAGE_ORDER.length - 1 && <ArrowRight size={12} color="#1e293b" style={{ marginTop: 20, flexShrink: 0 }} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div style={{ ...s.card, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", fontSize: 13, fontWeight: 700, color: "#94a3b8" }}>
          ACTIVE PATIENT DETAIL
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Patient", "Journey Type", "Current Stage", "Time in Stage", "Total Wait", "Delayed", "Actions"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeJourneys.map(j => {
                const lastStage = j.stages[j.stages.length - 1];
                const minsInStage = lastStage ? minutesSince(lastStage.enteredAt) : 0;
                const color = STAGE_COLORS[j.currentStage] || "#64748b";
                return (
                  <tr key={j.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "background 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"} onClick={() => setSelectedJourney(j)}>
                    <td style={{ padding: "12px 16px", fontWeight: 600 }}>{j.patientName}</td>
                    <td style={{ padding: "12px 16px", color: "#64748b" }}>{j.journeyType}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: `${color}20`, color, borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 700 }}>
                        {JOURNEY_STAGE_LABELS[j.currentStage] || j.currentStage}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: minsInStage > 30 ? "#ef4444" : "#94a3b8" }}>{minsInStage} min</td>
                    <td style={{ padding: "12px 16px", color: "#94a3b8" }}>{j.totalWaitMinutes || 0} min</td>
                    <td style={{ padding: "12px 16px" }}>
                      {j.isDelayed
                        ? <span style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: 4 }}><AlertTriangle size={11} /> Yes</span>
                        : <span style={{ color: "#22c55e", display: "flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={11} /> No</span>}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={e => { e.stopPropagation(); setSelectedJourney(j); }} style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.2)", color: "#818cf8", borderRadius: 6, padding: "4px 10px", fontSize: 10, cursor: "pointer" }}>View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {activeJourneys.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "#475569" }}>
              <Activity size={24} style={{ display: "block", margin: "0 auto 8px", opacity: 0.3 }} />
              No active patient journeys
            </div>
          )}
        </div>
      </div>

      {/* Journey Detail Modal */}
      {selectedJourney && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(4px)" }} onClick={() => setSelectedJourney(null)}>
          <div style={{ background: "#0d1627", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 24, width: 500, maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{selectedJourney.patientName}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>Journey ID: {selectedJourney.id} · {selectedJourney.journeyType}</div>
              </div>
              <button onClick={() => setSelectedJourney(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>?</button>
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>Stage Timeline</div>
            {selectedJourney.stages.map((stage, i) => {
              const color = STAGE_COLORS[stage.stage] || "#64748b";
              const duration = stage.durationMinutes || (stage.exitedAt ? 0 : minutesSince(stage.enteredAt));
              return (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, marginTop: 4 }} />
                    {i < selectedJourney.stages.length - 1 && <div style={{ width: 2, height: 28, background: "rgba(255,255,255,0.08)", margin: "4px 0" }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color }}>{JOURNEY_STAGE_LABELS[stage.stage] || stage.stage}</div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>
                      {new Date(stage.enteredAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      {stage.exitedAt && ` ? ${new Date(stage.exitedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`}
                      {" · "}{duration} min{stage.isDelayed ? " ? delayed" : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};