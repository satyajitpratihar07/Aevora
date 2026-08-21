import React, { useState, useEffect, useCallback } from "react";
import {
  Activity, AlertTriangle, Zap, Users, BedDouble, FlaskConical,
  Pill, Clock, TrendingUp, TrendingDown, Minus, ChevronRight,
  Bell, Shield, RefreshCw, CheckCircle2, XCircle, Eye,
  ArrowUp, ArrowDown, Heart, Route, Server
} from "lucide-react";
import { HospitalState, DepartmentLoad, HospitalAlert, HospitalOperatingMode } from "../../types/index.js";
import { generateMockHospitalState, MODE_CONFIG, DEPT_ALERT_CONFIG } from "../../services/hospitalStateEngine.js";
import { generateMockInsights } from "../../services/avoraAI.js";
import { AvoraInsightPanel } from "./AvoraInsightPanel.js";
import { LiveTaskBoard } from "./LiveTaskBoard.js";
import { PatientJourneyTracker } from "./PatientJourneyTracker.js";
import { ResourceAllocationPanel } from "./ResourceAllocationPanel.js";
import { publishEvent } from "../../services/automationOrchestrator.js";
import { db } from "../../services/firebase.js";
import { doc, onSnapshot } from "firebase/firestore";

interface Props { organizationId: string; organizationName: string; onClose?: () => void; }

type ActiveView = "overview" | "tasks" | "insights" | "emergency" | "patient-flow" | "resources";

export const HospitalCommandCenter: React.FC<Props> = ({ organizationId, organizationName, onClose }) => {
  const [state, setState] = useState<HospitalState | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>("overview");
  const [selectedDept, setSelectedDept] = useState<DepartmentLoad | null>(null);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pulse, setPulse] = useState(false);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      const newState = generateMockHospitalState(organizationId);
      setState(newState);
      setLastRefresh(new Date());
      setIsRefreshing(false);
    }, 600);
  }, [organizationId]);

  useEffect(() => { refresh(); }, [refresh]);
  // Real-time hospital state listener from Firestore (falls back to mock if no doc exists)
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'hospitalState', organizationId), (snap) => {
      if (snap.exists()) {
        // Merge Firestore data with generated mock for full state shape
        const firestoreData = snap.data();
        const mockState = generateMockHospitalState(organizationId);
        setState({ ...mockState, ...firestoreData, operatingMode: firestoreData.operatingMode || mockState.operatingMode });
      }
    }, () => { /* silently ignore if no Firestore doc */ });
    return () => unsubscribe();
  }, [organizationId]);
  // Refresh state every 30s as fallback
  useEffect(() => { const t = setInterval(refresh, 30000); return () => clearInterval(t); }, [refresh]);
  useEffect(() => { const t = setInterval(() => setPulse(p => !p), 1000); return () => clearInterval(t); }, []);

  if (!state) {
    return (
      <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#0a0f1e",color:"white",flexDirection:"column",gap:16 }}>
        <Activity size={40} style={{ animation:"spin 1s linear infinite",color:"#6366f1" }} />
        <p style={{ color:"#94a3b8",fontSize:14 }}>Initializing AVORA Command Center...</p>
      </div>
    );
  }

  const modeConf = MODE_CONFIG[state.operatingMode];
  const insights = generateMockInsights(organizationId, state);
  const activeAlerts = state.activeAlerts.filter(a => !acknowledgedAlerts.has(a.id));

  return (
    <div style={{ background:"#070b18",minHeight:"100vh",color:"white",fontFamily:"'Inter',sans-serif",overflowX:"hidden" }}>
      {/* Top Navigation Bar */}
      <div style={{ background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"0 24px",display:"flex",alignItems:"center",gap:16,height:60,position:"sticky",top:0,zIndex:100,backdropFilter:"blur(20px)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:32,height:32,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center" }}>
            <Activity size={16} />
          </div>
          <div>
            <div style={{ fontWeight:700,fontSize:14,letterSpacing:0.5 }}>AVORA Command Center</div>
            <div style={{ fontSize:10,color:"#64748b" }}>{organizationName}</div>
          </div>
        </div>

        {/* Operating Mode Badge */}
        <div style={{ marginLeft:"auto",display:"flex",alignItems:"center",gap:8 }}>
          <div style={{
            display:"flex",alignItems:"center",gap:8,padding:"6px 14px",borderRadius:20,
            background:modeConf.bg,border:`1px solid ${modeConf.border}33`,
            animation:modeConf.pulse ? `pulse 1.5s infinite` : "none",
          }}>
            <div style={{ width:8,height:8,borderRadius:"50%",background:modeConf.color,
              boxShadow:modeConf.pulse ? `0 0 ${pulse?12:6}px ${modeConf.color}` : "none",
              transition:"box-shadow 0.5s" }} />
            <span style={{ fontSize:11,fontWeight:700,color:modeConf.color,textTransform:"uppercase",letterSpacing:1 }}>
              {modeConf.label}
            </span>
          </div>
          {activeAlerts.length > 0 && (
            <div style={{ background:"#ef4444",borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:4 }}>
              <Bell size={11} /> {activeAlerts.length} Alerts
            </div>
          )}
          <button onClick={refresh} disabled={isRefreshing} style={{ background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"#94a3b8",borderRadius:8,padding:"6px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontSize:11,transition:"all 0.2s" }}>
            <RefreshCw size={12} style={{ animation:isRefreshing?"spin 1s linear infinite":"none" }} />
            {lastRefresh.toLocaleTimeString()}
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div style={{ borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"0 24px",display:"flex",gap:4,overflowX:"auto" }}>
        {([["overview","Overview",Activity],["tasks","Task Board",Zap],["patient-flow","Patient Flow",Route],["resources","Resources",Server],["insights","AI Insights",Shield],["emergency","Emergency",AlertTriangle]] as [ActiveView,string,any][]).map(([view,label,Icon]) => (
          <button key={view} onClick={() => setActiveView(view)} style={{
            background:"transparent",border:"none",color:activeView===view?"#6366f1":"#64748b",
            padding:"12px 16px",cursor:"pointer",borderBottom:activeView===view?"2px solid #6366f1":"2px solid transparent",
            fontSize:13,fontWeight:activeView===view?600:400,display:"flex",alignItems:"center",gap:6,transition:"all 0.2s",whiteSpace:"nowrap",
          }}>
            <Icon size={14} /> {label}
            {view==="emergency" && state.activeEmergencies>0 && <span style={{ background:"#ef4444",borderRadius:10,padding:"2px 6px",fontSize:10,fontWeight:700 }}>{state.activeEmergencies}</span>}
            {view==="insights" && <span style={{ background:"rgba(99,102,241,0.2)",borderRadius:10,padding:"2px 6px",fontSize:10,color:"#818cf8" }}>{insights.length}</span>}
            {view==="patient-flow" && <span style={{ background:"rgba(34,197,94,0.15)",borderRadius:10,padding:"2px 6px",fontSize:10,color:"#86efac",fontWeight:700 }}>LIVE</span>}
          </button>
        ))}
      </div>

      <div style={{ padding:24, maxWidth:1600 }}>
        {activeView === "overview" && <OverviewPanel state={state} activeAlerts={activeAlerts} acknowledgedAlerts={acknowledgedAlerts} setAcknowledgedAlerts={setAcknowledgedAlerts} selectedDept={selectedDept} setSelectedDept={setSelectedDept} />}
        {activeView === "tasks" && <LiveTaskBoard organizationId={organizationId} />}
        {activeView === "patient-flow" && <PatientJourneyTracker organizationId={organizationId} />}
        {activeView === "resources" && <ResourceAllocationPanel organizationId={organizationId} />}
        {activeView === "insights" && <AvoraInsightPanel insights={insights} />}
        {activeView === "emergency" && <EmergencyPanel state={state} />}
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}`}</style>
    </div>
  );
};

const OverviewPanel: React.FC<{
  state: HospitalState;
  activeAlerts: HospitalAlert[];
  acknowledgedAlerts: Set<string>;
  setAcknowledgedAlerts: React.Dispatch<React.SetStateAction<Set<string>>>;
  selectedDept: DepartmentLoad | null;
  setSelectedDept: React.Dispatch<React.SetStateAction<DepartmentLoad | null>>;
}> = ({ state, activeAlerts, acknowledgedAlerts, setAcknowledgedAlerts, selectedDept, setSelectedDept }) => (
  <div style={{ display:"flex",flexDirection:"column",gap:24 }}>
    {/* KPI Row */}
    <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:16 }}>
      {[
        { label:"Active Patients",    value:state.totalPatientsActive,     sub:`${state.totalPatientsWaiting} waiting`, icon:<Users size={18}/>,    color:"#6366f1" },
        { label:"Active Tasks",       value:state.totalTasksActive,         sub:`${state.totalTasksOverdue} overdue`,  icon:<Zap size={18}/>,      color:"#f59e0b" },
        { label:"Escalated Tasks",    value:state.totalTasksEscalated,      sub:`Require attention`,                    icon:<AlertTriangle size={18}/>, color:"#ef4444" },
        { label:"Task Completion",    value:`${state.taskCompletionRateLastHour}%`, sub:`Last 60 minutes`,             icon:<CheckCircle2 size={18}/>, color:"#22c55e" },
        { label:"Beds Available",     value:state.resources.bedsAvailable,  sub:`of ${state.resources.bedsTotal} total`, icon:<BedDouble size={18}/>, color:"#0ea5e9" },
        { label:"Lab Capacity",       value:`${state.resources.labCapacityPercentage}%`, sub:`In use`,                icon:<FlaskConical size={18}/>, color:"#8b5cf6" },
        { label:"Pharmacy Queue",     value:state.resources.pharmacyQueueDepth, sub:`Pending orders`,               icon:<Pill size={18}/>,     color:"#ec4899" },
        { label:"Doctors On Duty",    value:state.resources.doctorsOnDuty,  sub:`${state.resources.doctorsAvailable} available`, icon:<Heart size={18}/>, color:"#14b8a6" },
      ].map(({ label, value, sub, icon, color }) => (
        <div key={label} style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:16,transition:"transform 0.2s,background 0.2s",cursor:"default" }}
          onMouseEnter={e => (e.currentTarget.style.background="rgba(255,255,255,0.06)")}
          onMouseLeave={e => (e.currentTarget.style.background="rgba(255,255,255,0.03)")}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
            <span style={{ fontSize:11,color:"#64748b",textTransform:"uppercase",letterSpacing:0.5 }}>{label}</span>
            <div style={{ color,opacity:0.8 }}>{icon}</div>
          </div>
          <div style={{ fontSize:26,fontWeight:700,color }}>{value}</div>
          <div style={{ fontSize:11,color:"#475569",marginTop:2 }}>{sub}</div>
        </div>
      ))}
    </div>

    {/* Alerts Section */}
    {activeAlerts.length > 0 && (
      <div>
        <h3 style={{ fontSize:13,fontWeight:600,color:"#94a3b8",marginBottom:12,textTransform:"uppercase",letterSpacing:0.5 }}>Active Alerts ({activeAlerts.length})</h3>
        <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
          {activeAlerts.slice(0,4).map(alert => (
            <div key={alert.id} style={{ background:alert.severity==="CRITICAL"?"rgba(239,68,68,0.08)":"rgba(245,158,11,0.06)", border:`1px solid ${alert.severity==="CRITICAL"?"rgba(239,68,68,0.25)":"rgba(245,158,11,0.2)"}`, borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",gap:12 }}>
              <AlertTriangle size={16} style={{ color:alert.severity==="CRITICAL"?"#ef4444":"#f59e0b",flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13,fontWeight:600,color:"white" }}>{alert.title}</div>
                <div style={{ fontSize:11,color:"#94a3b8",marginTop:2 }}>{alert.message}</div>
              </div>
              <button onClick={() => setAcknowledgedAlerts(prev => new Set([...prev, alert.id]))}
                style={{ background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",color:"#94a3b8",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",gap:4 }}>
                <CheckCircle2 size={11}/> Ack
              </button>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Department Grid */}
    <div>
      <h3 style={{ fontSize:13,fontWeight:600,color:"#94a3b8",marginBottom:12,textTransform:"uppercase",letterSpacing:0.5 }}>
        Department Status — {state.departments.length} Departments
      </h3>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12 }}>
        {state.departments.map(dept => {
          const conf = DEPT_ALERT_CONFIG[dept.alertLevel];
          const isSelected = selectedDept?.departmentId === dept.departmentId;
          return (
            <div key={dept.departmentId} onClick={() => setSelectedDept(isSelected ? null : dept)}
              style={{ background:isSelected?conf.bg:"rgba(255,255,255,0.03)",border:`1px solid ${isSelected?conf.color+"66":"rgba(255,255,255,0.07)"}`,borderRadius:12,padding:16,cursor:"pointer",transition:"all 0.2s" }}
              onMouseEnter={e => { if(!isSelected) e.currentTarget.style.border=`1px solid ${conf.color}44`; }}
              onMouseLeave={e => { if(!isSelected) e.currentTarget.style.border="1px solid rgba(255,255,255,0.07)"; }}>
              <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12 }}>
                <div>
                  <div style={{ fontSize:13,fontWeight:600,color:"white",marginBottom:2 }}>{dept.departmentName}</div>
                  <div style={{ fontSize:10,padding:"2px 8px",borderRadius:10,background:conf.bg,color:conf.color,display:"inline-block",fontWeight:600,border:`1px solid ${conf.color}33` }}>{conf.label}</div>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:4,fontSize:10,color:dept.trend==="WORSENING"?"#ef4444":dept.trend==="IMPROVING"?"#22c55e":"#64748b" }}>
                  {dept.trend==="WORSENING"?<TrendingUp size={12}/>:dept.trend==="IMPROVING"?<TrendingDown size={12}/>:<Minus size={12}/>}
                  {dept.trend}
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                {[
                  { label:"Waiting",   value:dept.patientsWaiting,      color:"#f59e0b" },
                  { label:"Avg Wait",  value:`${dept.averageWaitMinutes}m`,color:"#0ea5e9" },
                  { label:"Capacity",  value:`${dept.capacityPercentage}%`,color:dept.capacityPercentage>85?"#ef4444":"#22c55e" },
                  { label:"Overdue",   value:dept.overdueTasks,          color:dept.overdueTasks>3?"#ef4444":"#64748b" },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background:"rgba(0,0,0,0.2)",borderRadius:6,padding:"6px 8px" }}>
                    <div style={{ fontSize:9,color:"#64748b",marginBottom:2 }}>{label}</div>
                    <div style={{ fontSize:16,fontWeight:700,color }}>{value}</div>
                  </div>
                ))}
              </div>
              {/* Capacity Bar */}
              <div style={{ marginTop:12,height:3,background:"rgba(255,255,255,0.06)",borderRadius:2 }}>
                <div style={{ height:"100%",width:`${Math.min(100,dept.capacityPercentage)}%`,background:conf.color,borderRadius:2,transition:"width 0.5s" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* Journey Distribution */}
    <div>
      <h3 style={{ fontSize:13,fontWeight:600,color:"#94a3b8",marginBottom:12,textTransform:"uppercase",letterSpacing:0.5 }}>Patient Flow — Live Stage Distribution</h3>
      <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,padding:20,display:"flex",gap:8,flexWrap:"wrap" }}>
        {Object.entries(state.journeyStageDistribution).filter(([_,v]) => v && v > 0).map(([stage, count]) => {
          const label = stage.replace(/_/g," ");
          const maxCount = Math.max(...Object.values(state.journeyStageDistribution).filter(Boolean) as number[]);
          const pct = ((count as number) / maxCount) * 100;
          return (
            <div key={stage} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4,minWidth:80 }}>
              <div style={{ height:60,width:40,background:"rgba(255,255,255,0.04)",borderRadius:4,display:"flex",alignItems:"flex-end",overflow:"hidden" }}>
                <div style={{ width:"100%",height:`${pct}%`,background:"linear-gradient(to top,#6366f1,#8b5cf6)",borderRadius:4,transition:"height 0.5s" }} />
              </div>
              <div style={{ fontSize:16,fontWeight:700,color:"#e2e8f0" }}>{count as number}</div>
              <div style={{ fontSize:9,color:"#475569",textAlign:"center",maxWidth:80,textTransform:"capitalize",lineHeight:1.3 }}>{label.toLowerCase()}</div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

const EmergencyPanel: React.FC<{ state: HospitalState }> = ({ state }) => (
  <div style={{ display:"flex",flexDirection:"column",gap:20,alignItems:"center",justifyContent:"center",minHeight:400 }}>
    <div style={{ textAlign:"center",padding:40,background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:16,maxWidth:600,width:"100%" }}>
      <Shield size={48} style={{ color:"#ef4444",marginBottom:16 }} />
      <h2 style={{ fontSize:22,fontWeight:700,marginBottom:8 }}>Emergency Coordinator</h2>
      <p style={{ color:"#94a3b8",fontSize:14,marginBottom:24 }}>
        {state.activeEmergencies === 0
          ? "No active emergencies. Hospital is in normal operations mode."
          : `${state.activeEmergencies} active emergency event(s) in progress.`}
      </p>
      <div style={{ display:"flex",gap:12,justifyContent:"center" }}>
        <button style={{ background:"#ef4444",border:"none",color:"white",borderRadius:10,padding:"12px 24px",fontSize:14,fontWeight:700,cursor:"pointer" }}>
          🚨 Declare Emergency
        </button>
        <button style={{ background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"#94a3b8",borderRadius:10,padding:"12px 24px",fontSize:14,cursor:"pointer" }}>
          View Protocols
        </button>
      </div>
    </div>
    <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,width:"100%",maxWidth:600 }}>
      {[
        { label:"Emergency Beds",   value:state.resources.emergencyBedsAvailable, color:"#22c55e",sub:"Available" },
        { label:"Doctors on Duty",  value:state.resources.doctorsOnDuty,          color:"#6366f1",sub:"On duty"  },
        { label:"Nurses Available", value:state.resources.nursesAvailable,         color:"#0ea5e9",sub:"Available" },
      ].map(({ label, value, color, sub }) => (
        <div key={label} style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:20,textAlign:"center" }}>
          <div style={{ fontSize:32,fontWeight:700,color }}>{value}</div>
          <div style={{ fontSize:11,color:"#94a3b8",marginTop:4 }}>{label}</div>
          <div style={{ fontSize:10,color:"#475569" }}>{sub}</div>
        </div>
      ))}
    </div>
  </div>
);
