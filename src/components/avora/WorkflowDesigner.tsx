import React, { useState } from "react";
import { Plus, Trash2, GripVertical, Save, CheckCircle2 } from "lucide-react";
import { WorkflowStep, TaskType, WorkflowTemplate } from "../../types/index.js";
import { TASK_TYPE_CONFIG } from "../../services/taskEngine.js";

interface Props { organizationId: string; onSave?: (template: WorkflowTemplate) => void; }

const STEP_ROLES = ["NURSE", "DOCTOR", "LAB_TECH", "PHARMACIST", "RECEPTIONIST", "AUTO", "SYSTEM"];

export const WorkflowDesigner: React.FC<Props> = ({ organizationId, onSave }) => {
  const [templateName, setTemplateName] = useState("New Workflow Template");
  const [clinicType, setClinicType] = useState("");
  const [steps, setSteps] = useState<WorkflowStep[]>([
    { stepIndex: 0, stepName: "Patient Registration",  taskType: "REGISTRATION",  assignedRole: "RECEPTIONIST", estimatedDurationMinutes: 10, isOptional: false },
    { stepIndex: 1, stepName: "Vitals Recording",      taskType: "VITALS",        assignedRole: "NURSE",        estimatedDurationMinutes: 10, isOptional: false },
    { stepIndex: 2, stepName: "Doctor Consultation",   taskType: "CONSULTATION",  assignedRole: "DOCTOR",       estimatedDurationMinutes: 20, isOptional: false },
  ]);
  const [saved, setSaved] = useState(false);

  const addStep = () => setSteps(prev => [...prev, { stepIndex: prev.length, stepName: "New Step", taskType: "CUSTOM", assignedRole: "NURSE", estimatedDurationMinutes: 15, isOptional: false }]);
  const removeStep = (i: number) => setSteps(prev => prev.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, stepIndex: idx })));
  const updateStep = (i: number, updates: Partial<WorkflowStep>) => setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, ...updates } : s));
  const totalMins = steps.reduce((sum, s) => sum + s.estimatedDurationMinutes, 0);

  const handleSave = () => {
    const template: WorkflowTemplate = {
      id: `wf-${Date.now()}`, organizationId, name: templateName, clinicType,
      journeyType: "SPECIAL_CLINIC", steps, totalEstimatedMinutes: totalMins,
      isActive: true, createdBy: "CURRENT_USER", createdAt: new Date().toISOString(),
    };
    if (onSave) onSave(template);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ background: "#070b18", minHeight: "100vh", color: "white", fontFamily: "'Inter',sans-serif", padding: 24 }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Workflow Designer</h1>
            <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Configure step-by-step patient flow templates for special clinics</p>
          </div>
          <button onClick={handleSave} style={{ background: saved ? "rgba(34,197,94,0.15)" : "linear-gradient(135deg,#6366f1,#8b5cf6)", border: saved ? "1px solid rgba(34,197,94,0.3)" : "none", color: saved ? "#22c55e" : "white", borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, transition: "all 0.3s" }}>
            {saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
            {saved ? "Saved!" : "Save Template"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
          <div>
            <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>Template Name</label>
            <input value={templateName} onChange={e => setTemplateName(e.target.value)} style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "white", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>Clinic Type (optional)</label>
            <input value={clinicType} onChange={e => setClinicType(e.target.value)} placeholder="e.g. DIABETES_CLINIC" style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "white", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>Steps ({steps.length}) · ~{totalMins}min total</h3>
          <button onClick={addStep} style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
            <Plus size={13} /> Add Step
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 14, display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <GripVertical size={14} style={{ color: "#334155" }} />
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#818cf8" }}>{i + 1}</div>
              </div>
              <input value={step.stepName} onChange={e => updateStep(i, { stepName: e.target.value })} style={{ flex: 2, padding: "8px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, color: "white", fontSize: 12, outline: "none" }} />
              <select value={step.taskType} onChange={e => updateStep(i, { taskType: e.target.value as TaskType })} style={{ flex: 1, padding: "8px 8px", background: "#1e2333", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, color: "white", fontSize: 11, outline: "none" }}>
                {Object.entries(TASK_TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
              <select value={step.assignedRole} onChange={e => updateStep(i, { assignedRole: e.target.value as any })} style={{ flex: 1, padding: "8px 8px", background: "#1e2333", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, color: "white", fontSize: 11, outline: "none" }}>
                {STEP_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input type="number" value={step.estimatedDurationMinutes} min={5} onChange={e => updateStep(i, { estimatedDurationMinutes: parseInt(e.target.value) || 5 })} style={{ width: 50, padding: "8px 6px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, color: "white", fontSize: 12, outline: "none", textAlign: "center" }} />
                <span style={{ fontSize: 9, color: "#475569" }}>min</span>
              </div>
              <button onClick={() => removeStep(i)} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#ef4444", borderRadius: 7, padding: "8px", cursor: "pointer" }}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* Flow Preview */}
        <div style={{ marginTop: 24, background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 12, padding: 16 }}>
          <p style={{ fontSize: 11, color: "#818cf8", margin: "0 0 10px 0", fontWeight: 700 }}>Patient flow preview:</p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {steps.map((s, i) => (
              <React.Fragment key={i}>
                <div style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 8, padding: "6px 12px", fontSize: 11, color: "#c7d2fe" }}>
                  {TASK_TYPE_CONFIG[s.taskType]?.icon} {s.stepName}
                  <span style={{ fontSize: 9, color: "#6366f1", marginLeft: 4 }}>({s.estimatedDurationMinutes}m)</span>
                </div>
                {i < steps.length - 1 && <span style={{ color: "#334155" }}>→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
