import React, { useState, useEffect } from "react";
import { Users, Search, Zap, ChevronUp, Activity, BedDouble, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { findBestStaff, generateMockStaffAvailability, findAvailableBeds } from "../../services/resourceEngine.js";
import { StaffAvailability, ResourceSearchResult, UserRole } from "../../types/index.js";

interface Props { organizationId: string; }

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "DOCTOR", label: "Doctor" }, { value: "NURSE", label: "Nurse" },
  { value: "LAB_TECH", label: "Lab Technician" }, { value: "PHARMACIST", label: "Pharmacist" },
];
const DEPT_OPTIONS = ["Any", "Cardiology OPD", "General Medicine", "Pediatrics", "Laboratory", "Pharmacy"];
const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "#22c55e", BUSY: "#f59e0b", ON_BREAK: "#64748b",
  OVERLOADED: "#ef4444", IN_CONSULTATION: "#6366f1", OFF_DUTY: "#475569",
};

export const ResourceAllocationPanel: React.FC<Props> = ({ organizationId }) => {
  const [staff, setStaff] = useState<StaffAvailability[]>([]);
  const [searchRole, setSearchRole] = useState<UserRole>("NURSE");
  const [searchDept, setSearchDept] = useState("Any");
  const [searchResult, setSearchResult] = useState<ResourceSearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "SEARCH">("OVERVIEW");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setStaff(generateMockStaffAvailability(organizationId));
    const t = setInterval(() => { setStaff(generateMockStaffAvailability(organizationId)); setTick(x => x + 1); }, 15000);
    return () => clearInterval(t);
  }, [organizationId]);

  const handleSearch = async () => {
    setSearching(true);
    await new Promise(r => setTimeout(r, 600));
    const result = findBestStaff(staff, searchRole, searchDept === "Any" ? undefined : searchDept);
    setSearchResult(result);
    setSearching(false);
  };

  const available = staff.filter(s => s.status === "AVAILABLE").length;
  const busy = staff.filter(s => s.status === "BUSY" || s.status === "IN_CONSULTATION").length;
  const overloaded = staff.filter(s => s.status === "OVERLOADED").length;
  const avgWorkload = staff.length > 0 ? Math.round(staff.reduce((s, a) => s + a.workloadScore, 0) / staff.length) : 0;

  const s = {
    card: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 } as React.CSSProperties,
    tab: (active: boolean) => ({ padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: active ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)", color: active ? "#818cf8" : "#64748b", transition: "all 0.2s" } as React.CSSProperties),
    btn: (primary?: boolean) => ({ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: primary ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.07)", color: "white", transition: "all 0.2s" } as React.CSSProperties),
    select: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "8px 12px", color: "white", fontSize: 12, outline: "none", cursor: "pointer" } as React.CSSProperties,
  };

  return (
    <div>
      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Available", value: available, color: "#22c55e" },
          { label: "Busy / Active", value: busy, color: "#f59e0b" },
          { label: "Overloaded", value: overloaded, color: "#ef4444" },
          { label: "Avg Workload", value: `${avgWorkload}%`, color: avgWorkload > 70 ? "#ef4444" : "#6366f1" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ ...s.card, padding: 16 }}>
            <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button style={s.tab(activeTab === "OVERVIEW")} onClick={() => setActiveTab("OVERVIEW")}>Staff Overview</button>
        <button style={s.tab(activeTab === "SEARCH")} onClick={() => setActiveTab("SEARCH")}><Zap size={12} style={{ display: "inline", marginRight: 4 }} /> Find Best Staff</button>
      </div>

      {activeTab === "OVERVIEW" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {staff.map(member => (
            <div key={member.staffId} style={{ ...s.card, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${STATUS_COLORS[member.status] || "#64748b"}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: STATUS_COLORS[member.status] || "#64748b" }}>
                {member.staffName.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{member.staffName}</span>
                  <span style={{ fontSize: 10, background: `${STATUS_COLORS[member.status] || "#64748b"}20`, color: STATUS_COLORS[member.status] || "#64748b", borderRadius: 12, padding: "2px 8px", fontWeight: 700 }}>{member.status.replace(/_/g, " ")}</span>
                  <span style={{ fontSize: 10, color: "#64748b" }}>{member.staffRole}</span>
                </div>
                <div style={{ fontSize: 10, color: "#64748b", marginBottom: 6 }}>{member.departmentName}</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 4 }}>
                    <div style={{ height: "100%", background: member.workloadScore > 80 ? "#ef4444" : member.workloadScore > 60 ? "#f59e0b" : "#22c55e", borderRadius: 4, width: `${member.workloadScore}%`, transition: "width 1s ease" }} />
                  </div>
                  <span style={{ fontSize: 10, color: "#64748b", minWidth: 36, textAlign: "right" }}>{member.workloadScore}%</span>
                </div>
              </div>
              <div style={{ textAlign: "right", fontSize: 10, color: "#64748b" }}>
                <div>{member.pendingTaskCount} pending</div>
                {member.overdueTaskCount > 0 && <div style={{ color: "#ef4444" }}>{member.overdueTaskCount} overdue</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "SEARCH" && (
        <div>
          <div style={{ ...s.card, padding: 20, marginBottom: 20, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: "#94a3b8" }}>RESOURCE SEARCH ENGINE</div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div>
                <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>Required Role</label>
                <select value={searchRole} onChange={e => setSearchRole(e.target.value as UserRole)} style={s.select}>
                  {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>Preferred Department</label>
                <select value={searchDept} onChange={e => setSearchDept(e.target.value)} style={s.select}>
                  {DEPT_OPTIONS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <button onClick={handleSearch} disabled={searching} style={s.btn(true)}>
                {searching ? <RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Zap size={13} />}
                {searching ? "Searching..." : "Find Best Match"}
              </button>
            </div>
          </div>

          {searchResult && (
            <div>
              <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8" }}>RESULTS — {searchResult.requirement}</div>
                {searchResult.candidates.length === 0 && <span style={{ fontSize: 11, color: "#ef4444" }}>No results: {searchResult.noResultReason}</span>}
              </div>
              {searchResult.recommendedId && (
                <div style={{ ...s.card, padding: 14, marginBottom: 12, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <CheckCircle2 size={14} color="#22c55e" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#22c55e" }}>AVORA Recommendation</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
                    {searchResult.candidates[0]?.resourceName}
                  </div>
                  <div style={{ fontSize: 11, color: "#86efac" }}>{searchResult.recommendedReason}</div>
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {searchResult.candidates.map((c, i) => (
                  <div key={c.resourceId} style={{ ...s.card, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, border: i === 0 ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: i === 0 ? "#22c55e" : "#475569", minWidth: 28 }}>#{c.rank}</div>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{c.resourceName?.charAt(0)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{c.resourceName}</div>
                      <div style={{ fontSize: 10, color: "#64748b" }}>{c.reason}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, color: c.isAvailable ? "#22c55e" : "#f59e0b", fontWeight: 700 }}>{c.isAvailable ? "Available" : "Busy"}</div>
                      <div style={{ fontSize: 10, color: "#64748b" }}>Score: {c.score}</div>
                    </div>
                    {i === 0 && (
                      <button style={{ ...s.btn(true), padding: "6px 12px", fontSize: 11 }}>
                        Assign
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};