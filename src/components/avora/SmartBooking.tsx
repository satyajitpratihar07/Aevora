import React, { useState } from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { AppointmentSlot, SlotCongestion } from "../../types/index.js";
import { generateMockSlots, getSpecialClinicWorkflow } from "../../services/schedulingEngine.js";

interface Props { organizationId: string; onBookingComplete?: (slot: AppointmentSlot) => void; }

const CONGESTION_CONFIG: Record<SlotCongestion, { color: string; bg: string; label: string; bar: number }> = {
  LOW:    { color: "#22c55e", bg: "rgba(34,197,94,0.1)",   label: "Low",      bar: 25 },
  MEDIUM: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "Moderate", bar: 55 },
  HIGH:   { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   label: "High",     bar: 85 },
  FULL:   { color: "#64748b", bg: "rgba(100,116,139,0.1)", label: "Full",     bar: 100 },
};

const DOCTORS = [
  { id: "doc-1", name: "Dr. Ramesh Iyer",    specialty: "Cardiology",        exp: "12 yrs" },
  { id: "doc-2", name: "Dr. Anita Bose",     specialty: "General Medicine",  exp: "8 yrs" },
  { id: "doc-3", name: "Dr. Sanjay Kapoor",  specialty: "Orthopedics",       exp: "15 yrs" },
];

const CLINIC_TYPES = [
  { key: "DEFAULT",        label: "General Consultation", icon: "🩺" },
  { key: "DIABETES_CLINIC", label: "Diabetes Clinic",    icon: "🩸" },
  { key: "CARDIAC_CLINIC",  label: "Cardiac Clinic",     icon: "❤️" },
  { key: "ANTENATAL",      label: "Antenatal Care",       icon: "🤱" },
  { key: "NEUROLOGY",      label: "Neurology",            icon: "🧠" },
];

export const SmartBooking: React.FC<Props> = ({ organizationId, onBookingComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedClinic, setSelectedClinic] = useState("DEFAULT");
  const [selectedDoctor, setSelectedDoctor] = useState<typeof DOCTORS[0] | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);
  const [date] = useState(new Date().toISOString().split("T")[0]);

  const slots = selectedDoctor ? generateMockSlots(selectedDoctor.id, selectedDoctor.name, date) : [];
  const workflow = getSpecialClinicWorkflow(selectedClinic);

  const handleBook = () => {
    if (selectedSlot && onBookingComplete) onBookingComplete(selectedSlot);
    setStep(3);
  };

  return (
    <div style={{ background: "#070b18", minHeight: "100vh", color: "white", fontFamily: "'Inter',sans-serif", padding: 24 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px 0" }}>Smart Appointment Booking</h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>AVORA shows you real-time slot availability with congestion intelligence</p>
        </div>

        {/* Progress Steps */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
          {[["1", "Visit Type"], ["2", "Select Slot"], ["3", "Confirmed"]].map(([n, label], i) => (
            <React.Fragment key={n}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: step > i + 1 ? "#22c55e" : step === i + 1 ? "#6366f1" : "rgba(255,255,255,0.06)", color: step >= i + 1 ? "white" : "#475569", transition: "all 0.3s" }}>
                  {step > i + 1 ? <CheckCircle2 size={14} /> : n}
                </div>
                <span style={{ fontSize: 12, color: step === i + 1 ? "#6366f1" : "#64748b", fontWeight: step === i + 1 ? 600 : 400 }}>{label}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)", alignSelf: "center" }} />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <div>
            {/* Clinic Type */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Select Visit Type</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10 }}>
                {CLINIC_TYPES.map(ct => (
                  <button key={ct.key} onClick={() => setSelectedClinic(ct.key)} style={{ background: selectedClinic === ct.key ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)", border: selectedClinic === ct.key ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.07)", color: "white", borderRadius: 12, padding: "14px 12px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{ct.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{ct.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Workflow Preview */}
            {selectedClinic !== "DEFAULT" && (
              <div style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 12, padding: 16, marginBottom: 24 }}>
                <p style={{ fontSize: 11, color: "#818cf8", margin: "0 0 8px 0", fontWeight: 700 }}>Your visit will include:</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  {workflow.steps.map((s, i) => (
                    <React.Fragment key={s}>
                      <span style={{ fontSize: 11, background: "rgba(99,102,241,0.2)", padding: "3px 10px", borderRadius: 10, color: "#c7d2fe" }}>{s}</span>
                      {i < workflow.steps.length - 1 && <ChevronRight size={12} style={{ color: "#475569" }} />}
                    </React.Fragment>
                  ))}
                </div>
                <p style={{ fontSize: 10, color: "#475569", margin: "8px 0 0 0" }}>Estimated total visit time: ~{workflow.totalMins} minutes</p>
              </div>
            )}

            {/* Select Doctor */}
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Select Doctor</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {DOCTORS.map(doc => (
                  <button key={doc.id} onClick={() => { setSelectedDoctor(doc); setStep(2); }} style={{ background: selectedDoctor?.id === doc.id ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.02)", border: selectedDoctor?.id === doc.id ? "1px solid rgba(99,102,241,0.35)" : "1px solid rgba(255,255,255,0.07)", color: "white", borderRadius: 12, padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left", transition: "all 0.2s" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                      {doc.name.split(" ").pop()![0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{doc.name}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{doc.specialty} · {doc.exp} experience</div>
                    </div>
                    <ChevronRight size={16} style={{ color: "#475569" }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && selectedDoctor && (
          <div>
            <button onClick={() => setStep(1)} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: 12, marginBottom: 16, display: "flex", alignItems: "center", gap: 4 }}>
              ← Back to doctor selection
            </button>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Available Slots — {selectedDoctor.name}</h3>
            <p style={{ fontSize: 11, color: "#475569", marginBottom: 16 }}>Congestion levels are updated in real-time by AVORA</p>

            {/* Legend */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              {Object.entries(CONGESTION_CONFIG).map(([k, v]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: v.color }} />
                  <span style={{ fontSize: 10, color: "#64748b" }}>{v.label}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10 }}>
              {slots.map(slot => {
                const conf = CONGESTION_CONFIG[slot.congestion];
                const isSelected = selectedSlot?.slotId === slot.slotId;
                return (
                  <button key={slot.slotId} disabled={!slot.isAvailable} onClick={() => setSelectedSlot(slot)} style={{ background: isSelected ? "rgba(99,102,241,0.18)" : slot.isAvailable ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.2)", border: isSelected ? "1px solid rgba(99,102,241,0.5)" : `1px solid ${conf.color}33`, color: slot.isAvailable ? "white" : "#334155", borderRadius: 12, padding: 14, cursor: slot.isAvailable ? "pointer" : "not-allowed", transition: "all 0.2s", textAlign: "left" }}>
                    {slot.isRecommended && <div style={{ fontSize: 9, color: "#22c55e", fontWeight: 700, marginBottom: 4 }}>⭐ RECOMMENDED</div>}
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{slot.startTime}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: conf.color }} />
                      <span style={{ fontSize: 10, color: conf.color, fontWeight: 600 }}>{conf.label}</span>
                    </div>
                    <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginBottom: 4 }}>
                      <div style={{ height: "100%", width: `${conf.bar}%`, background: conf.color, borderRadius: 2 }} />
                    </div>
                    <div style={{ fontSize: 9, color: "#64748b" }}>~{slot.expectedWaitMinutes}m wait</div>
                    {!slot.isAvailable && <div style={{ fontSize: 9, color: "#475569", marginTop: 2 }}>Full</div>}
                  </button>
                );
              })}
            </div>

            {selectedSlot && (
              <button onClick={handleBook} style={{ width: "100%", marginTop: 20, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", color: "white", borderRadius: 12, padding: "14px 0", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <CheckCircle2 size={16} /> Confirm Appointment — {selectedSlot.startTime}
              </button>
            )}
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <CheckCircle2 size={32} style={{ color: "#22c55e" }} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px 0" }}>Appointment Confirmed!</h2>
            <p style={{ fontSize: 14, color: "#64748b" }}>Your appointment has been booked. AVORA will notify you 30 minutes before your slot.</p>
            {selectedSlot && (
              <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: 20, marginTop: 24, display: "inline-block", minWidth: 280 }}>
                <p style={{ margin: "0 0 4px 0", fontSize: 16, fontWeight: 700 }}>{selectedDoctor?.name}</p>
                <p style={{ margin: "0 0 4px 0", fontSize: 13, color: "#94a3b8" }}>{selectedDoctor?.specialty}</p>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#818cf8" }}>{selectedSlot.startTime} · {date}</p>
              </div>
            )}
            <button onClick={() => { setStep(1); setSelectedSlot(null); setSelectedDoctor(null); }} style={{ display: "block", margin: "24px auto 0", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", borderRadius: 10, padding: "10px 24px", cursor: "pointer", fontSize: 13 }}>
              Book Another Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
