import React, { useState, useEffect } from "react";
import { CheckCircle2, Clock, AlertTriangle, Zap, User, ArrowRight, RefreshCw } from "lucide-react";
import { AvoraTask, UserRole } from "../../types/index.js";
import { generateMockTasks, TASK_TYPE_CONFIG, isTaskOverdue, getOverdueMinutes, completeTask, sortTaskQueue, subscribeToTasks, saveTaskToFirestore } from "../../services/taskEngine.js";

interface Props { organizationId: string; filterRole?: UserRole; }

const PRIORITY_COLORS: Record<string, string> = { EMERGENCY:"#dc2626",CRITICAL:"#ef4444",HIGH:"#f97316",MEDIUM:"#f59e0b",LOW:"#64748b" };

export const LiveTaskBoard: React.FC<Props> = ({ organizationId, filterRole }) => {
  const [tasks, setTasks] = useState<AvoraTask[]>([]);
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to real-time tasks from Firestore
    const unsubscribe = subscribeToTasks(organizationId, (realTasks) => {
      // If no tasks exist (fresh DB), fallback to generating mocks so the UI isn't empty in demo
      if (realTasks.length === 0) {
        const mock = [
          ...generateMockTasks(organizationId, "nur-1", "NURSE"),
          ...generateMockTasks(organizationId, "doc-1", "DOCTOR"),
          ...generateMockTasks(organizationId, "lab-1", "LAB_TECH"),
        ];
        // Save the mocks to DB for initialization
        mock.forEach(t => saveTaskToFirestore(t));
      } else {
        setTasks(sortTaskQueue(filterRole ? realTasks.filter(t => t.assignedToRole === filterRole) : realTasks));
      }
    });
    return () => unsubscribe();
  }, [organizationId, filterRole]);

  const handleComplete = (taskId: string) => {
    setCompleting(taskId);
    const taskToComplete = tasks.find(t => t.id === taskId);
    if (taskToComplete) {
      const completed = completeTask(taskToComplete, "Marked complete via task board");
      saveTaskToFirestore(completed).then(() => {
        setCompleting(null);
      });
    }
  };

  const columns = [
    { key:"pending",     label:"Pending",     color:"#64748b", tasks:tasks.filter(t => t.status==="PENDING" || t.status==="ASSIGNED") },
    { key:"inprogress",  label:"In Progress",  color:"#6366f1", tasks:tasks.filter(t => t.status==="IN_PROGRESS") },
    { key:"overdue",     label:"Overdue",      color:"#ef4444", tasks:tasks.filter(t => t.status==="OVERDUE" || (isTaskOverdue(t) && t.status!=="COMPLETED" && t.status!=="CANCELLED")) },
    { key:"escalated",   label:"Escalated",    color:"#f97316", tasks:tasks.filter(t => t.status==="ESCALATED") },
    { key:"completed",   label:"Completed",    color:"#22c55e", tasks:tasks.filter(t => t.status==="COMPLETED").slice(0,5) },
  ];

  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:20 }}>
        <h2 style={{ fontSize:16,fontWeight:700 }}>Live Task Board</h2>
        <span style={{ fontSize:11,color:"#64748b",background:"rgba(255,255,255,0.05)",padding:"2px 8px",borderRadius:10 }}>{tasks.length} tasks</span>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:16,overflowX:"auto" }}>
        {columns.map(col => (
          <div key={col.key} style={{ background:"rgba(255,255,255,0.02)",borderRadius:12,border:`1px solid rgba(255,255,255,0.06)`,minHeight:300,padding:12 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12,paddingBottom:8,borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ width:8,height:8,borderRadius:"50%",background:col.color }} />
              <span style={{ fontSize:11,fontWeight:700,color:col.color,textTransform:"uppercase",letterSpacing:0.5 }}>{col.label}</span>
              <span style={{ fontSize:11,color:"#64748b",background:"rgba(255,255,255,0.05)",padding:"1px 6px",borderRadius:8,marginLeft:"auto" }}>{col.tasks.length}</span>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {col.tasks.map(task => {
                const typeConf = TASK_TYPE_CONFIG[task.taskType];
                const overdueMin = getOverdueMinutes(task);
                return (
                  <div key={task.id} style={{ background:"rgba(255,255,255,0.03)",border:`1px solid rgba(255,255,255,0.06)`,borderLeft:`3px solid ${PRIORITY_COLORS[task.priority]}`,borderRadius:8,padding:10,transition:"all 0.2s" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:4 }}>
                      <span style={{ fontSize:14 }}>{typeConf.icon}</span>
                      <span style={{ fontSize:10,fontWeight:600,color:"#94a3b8",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{task.title}</span>
                    </div>
                    {task.patientName && <div style={{ fontSize:9,color:"#475569",marginBottom:4,display:"flex",alignItems:"center",gap:3 }}><User size={8}/>{task.patientName}</div>}
                    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:4 }}>
                      <span style={{ fontSize:9,background:`${PRIORITY_COLORS[task.priority]}22`,color:PRIORITY_COLORS[task.priority],padding:"1px 5px",borderRadius:4,fontWeight:700 }}>{task.priority}</span>
                      {overdueMin > 0 && <span style={{ fontSize:9,color:"#ef4444",display:"flex",alignItems:"center",gap:2 }}><AlertTriangle size={9}/>{overdueMin}m late</span>}
                    </div>
                    {task.status !== "COMPLETED" && task.status !== "CANCELLED" && (
                      <button onClick={() => handleComplete(task.id)} disabled={completing===task.id} style={{ width:"100%",marginTop:6,background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.2)",color:"#22c55e",borderRadius:6,padding:"4px 0",fontSize:9,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4,transition:"all 0.2s" }}>
                        {completing===task.id ? <RefreshCw size={10} style={{animation:"spin 1s linear infinite"}}/> : <CheckCircle2 size={10}/>} Complete
                      </button>
                    )}
                  </div>
                );
              })}
              {col.tasks.length === 0 && <div style={{ textAlign:"center",color:"#334155",fontSize:11,padding:20 }}>No tasks</div>}
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};
