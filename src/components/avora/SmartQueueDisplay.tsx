import React, { useState, useEffect } from "react";
import { Clock, User, Zap, Bell, ChevronRight, Activity } from "lucide-react";
import { QueueEntry } from "../../types/index.js";

interface Props { departmentName?: string; doctorName?: string; showPatientView?: boolean; }

function generateMockQueue(dept: string): QueueEntry[] {
  const now = Date.now();
  const names = ["Ananya Sharma","Rajesh Kumar","Priya Menon","Mohammed Akhtar","Kavitha Reddy","Suresh Iyer","Deepa Nair","Arjun Patel","Meena Krishnan","Ravi Verma"];
  return names.map((name, i) => ({
    id: `q-${i}`, organizationId:"org-1",
    patientId:`pt-${i}`, patientName:name,
    tokenNumber:String(i+1).padStart(3,"0"),
    displayToken:`A-${String(i+41+i).padStart(3,"0")}`,
    queuePosition:i+1,
    doctorId:"doc-1", doctorName:"Dr. Ramesh Iyer",
    departmentId:"dept-2", departmentName:dept,
    appointmentType:"GENERAL_CHECKUP",
    priority:i===0?"HIGH":i<3?"MEDIUM":"LOW",
    isEmergency:i===0&&false,
    isWalkIn:i%4===0,
    checkedInAt:new Date(now-(i*12+5)*60000).toISOString(),
    estimatedWaitMinutes:i===0?0:i*12,
    estimatedCallTime:new Date(now+i*12*60000).toISOString(),
    status:i===0?"IN_CONSULTATION":i===1?"CALLED":"WAITING",
    isDelayed:i>3&&i%3===0,
    delayMinutes:i>3&&i%3===0?8:undefined,
    createdAt:new Date(now-(i*12+5)*60000).toISOString(),
  }));
}

const STATUS_CONFIG: Record<string,{color:string;bg:string;label:string}> = {
  WAITING:        { color:"#f59e0b",bg:"rgba(245,158,11,0.1)",label:"Waiting" },
  CALLED:         { color:"#6366f1",bg:"rgba(99,102,241,0.1)",label:"Called" },
  IN_CONSULTATION:{ color:"#22c55e",bg:"rgba(34,197,94,0.1)", label:"Consulting" },
  COMPLETED:      { color:"#64748b",bg:"rgba(100,116,139,0.1)",label:"Done" },
};

export const SmartQueueDisplay: React.FC<Props> = ({ departmentName="Cardiology OPD", showPatientView=false }) => {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => { setQueue(generateMockQueue(departmentName)); }, [departmentName]);
  useEffect(() => { const t = setInterval(()=>setTick(p=>p+1), 30000); return ()=>clearInterval(t); }, []);

  const nowCalling = queue.find(q => q.status === "CALLED");
  const inConsultation = queue.find(q => q.status === "IN_CONSULTATION");
  const waiting = queue.filter(q => q.status === "WAITING");

  return (
    <div style={{ background:"#070b18",minHeight:"100vh",color:"white",fontFamily:"'Inter',sans-serif",padding:24 }}>
      {/* Header */}
      <div style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:20,marginBottom:24,display:"flex",alignItems:"center",gap:16 }}>
        <div style={{ width:44,height:44,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center" }}>
          <Activity size={20}/>
        </div>
        <div>
          <h1 style={{ fontSize:18,fontWeight:700,margin:0 }}>{departmentName}</h1>
          <p style={{ fontSize:12,color:"#64748b",margin:0 }}>Live Queue — {waiting.length} patients waiting · Updated {new Date().toLocaleTimeString()}</p>
        </div>
        <div style={{ marginLeft:"auto",display:"flex",alignItems:"center",gap:6,padding:"6px 14px",background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:20 }}>
          <div style={{ width:7,height:7,borderRadius:"50%",background:"#22c55e",animation:"pulse 1.5s infinite" }} />
          <span style={{ fontSize:11,color:"#22c55e",fontWeight:700 }}>LIVE</span>
        </div>
      </div>

      {/* Now Calling Card */}
      {nowCalling && (
        <div style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.2))",border:"2px solid rgba(99,102,241,0.4)",borderRadius:16,padding:24,marginBottom:20,textAlign:"center",animation:"callPulse 2s infinite" }}>
          <p style={{ fontSize:12,color:"#818cf8",margin:"0 0 4px 0",textTransform:"uppercase",letterSpacing:1 }}>🔔 NOW CALLING</p>
          <p style={{ fontSize:36,fontWeight:900,color:"white",margin:"0 0 4px 0",letterSpacing:2 }}>{nowCalling.displayToken}</p>
          <p style={{ fontSize:16,color:"#c7d2fe",margin:0 }}>{nowCalling.patientName}</p>
          <p style={{ fontSize:12,color:"#818cf8",margin:"4px 0 0 0" }}>Please proceed to {nowCalling.doctorName}</p>
        </div>
      )}

      {/* Queue Grid */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12 }}>
        {queue.slice(0,12).map((entry,i) => {
          const statusConf = STATUS_CONFIG[entry.status] ?? STATUS_CONFIG.WAITING;
          const isCurrent = entry.status === "IN_CONSULTATION";
          return (
            <div key={entry.id} style={{
              background:isCurrent?"rgba(34,197,94,0.08)":"rgba(255,255,255,0.02)",
              border:`1px solid ${isCurrent?"rgba(34,197,94,0.3)":"rgba(255,255,255,0.07)"}`,
              borderRadius:12,padding:16,transition:"all 0.3s",
            }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
                <span style={{ fontSize:20,fontWeight:900,color:isCurrent?"#22c55e":"white",letterSpacing:1 }}>{entry.displayToken}</span>
                <span style={{ fontSize:10,padding:"2px 7px",borderRadius:8,background:statusConf.bg,color:statusConf.color,fontWeight:700,border:`1px solid ${statusConf.color}33` }}>{statusConf.label}</span>
              </div>
              <div style={{ fontSize:12,fontWeight:600,color:"#e2e8f0",marginBottom:4 }}>{entry.patientName}</div>
              <div style={{ display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#64748b" }}>
                {entry.status === "WAITING" && <><Clock size={10}/> ~{entry.estimatedWaitMinutes}m wait</>}
                {entry.status === "IN_CONSULTATION" && <><Activity size={10}/> In consultation</>}
                {entry.isDelayed && <span style={{ color:"#f97316",marginLeft:"auto",display:"flex",alignItems:"center",gap:3 }}>⚠️ +{entry.delayMinutes}m</span>}
              </div>
              {entry.isWalkIn && <div style={{ fontSize:9,color:"#8b5cf6",marginTop:4 }}>Walk-in</div>}
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes callPulse{0%,100%{box-shadow:0 0 0 rgba(99,102,241,0)}50%{box-shadow:0 0 30px rgba(99,102,241,0.3)}}
      `}</style>
    </div>
  );
};
