/**
 * AVORA Automation Orchestrator
 * ==============================
 * Listens to Firestore `events` collection in real-time.
 * Processes structured operational events and fires automation chains:
 *   PatientCheckedIn  ? create Vitals task ? update queue ? notify doctor
 *   TaskCompleted     ? check next task dependency ? create it
 *   AppointmentBooked ? update doctor queue
 *   LabResultReady    ? notify doctor + update patient journey
 *   TaskOverdue       ? trigger escalation
 */

import { db } from "./firebase.js";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { createTask, saveTaskToFirestore } from "./taskEngine.js";
import { createOperationalEvent } from "./hospitalStateEngine.js";

export type AvoraEventType =
  | "PatientCheckedIn"
  | "AppointmentBooked"
  | "AppointmentCancelled"
  | "TaskCreated"
  | "TaskCompleted"
  | "TaskOverdue"
  | "LabResultReady"
  | "PrescriptionCreated"
  | "EmergencyStarted"
  | "EmergencyResolved"
  | "NurseShiftStarted"
  | "BedOccupied"
  | "BedReleased";

export interface AvoraEvent {
  id?: string;
  type: AvoraEventType;
  organizationId: string;
  payload: Record<string, any>;
  processedAt?: string;
  processed: boolean;
  createdAt?: any;
}

// -- Publish Event to Firestore ---------------------------------------------
export async function publishEvent(
  organizationId: string,
  type: AvoraEventType,
  payload: Record<string, any>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "events"), {
      type,
      organizationId,
      payload,
      processed: false,
      createdAt: serverTimestamp(),
    } as AvoraEvent);
    return docRef.id;
  } catch (err) {
    console.error("[AVORA Automation] Failed to publish event:", err);
    return "";
  }
}

// -- Process a single event -------------------------------------------------
async function processEvent(event: AvoraEvent & { id: string }) {
  const { type, organizationId, payload } = event;
  console.log(`[AVORA Automation] Processing: ${type}`, payload);

  try {
    switch (type) {
      // --- Patient Checked In ----------------------------------------------
      case "PatientCheckedIn": {
        const { patientId, patientName, departmentId, doctorId } = payload;

        // 1. Create nurse Vitals task
        const vitalsTask = createTask({
          organizationId,
          taskType: "VITALS_RECORDING",
          title: `Take Vitals — ${patientName}`,
          description: `Record baseline vitals for checked-in patient ${patientName}`,
          patientId,
          patientName,
          assignedToRole: "NURSE",
          department: departmentId || "OPD",
          location: payload.room || "OPD Nursing Station",
          priority: "HIGH",
          estimatedDurationMinutes: 5,
          dueAt: new Date(Date.now() + 10 * 60000).toISOString(),
          createdBy: "AVORA_AUTOMATION",
          aiGenerated: false,
        });
        await saveTaskToFirestore(vitalsTask);

        // 2. Notify doctor (queue update via Firestore doc)
        if (doctorId) {
          await addDoc(collection(db, "notifications"), {
            organizationId,
            targetUserId: doctorId,
            targetRole: "DOCTOR",
            title: "Patient Checked In",
            message: `${patientName} has checked in and is awaiting vitals assessment.`,
            category: "PATIENT_FLOW",
            priority: "MEDIUM",
            read: false,
            createdAt: serverTimestamp(),
          });
        }

        // 3. Update patient journey status in Firestore
        await addDoc(collection(db, "patientJourneys"), {
          organizationId,
          patientId,
          patientName,
          currentStage: "WAITING_NURSE",
          checkedInAt: new Date().toISOString(),
          vitalsTaskId: vitalsTask.id,
          doctorId: doctorId || null,
          departmentId: departmentId || "OPD",
        });
        break;
      }

      // --- Task Completed --------------------------------------------------
      case "TaskCompleted": {
        const { taskType, patientId, patientName, assignedToId, organizationId: orgId } = payload;

        // Auto-create next task in chain
        if (taskType === "VITALS_RECORDING") {
          // Vitals done ? patient ready for doctor
          const nextTask = createTask({
            organizationId,
            taskType: "PATIENT_TRANSFER",
            title: `Send to Doctor — ${patientName}`,
            description: `Vitals complete. Move ${patientName} to consultation queue.`,
            patientId,
            patientName,
            assignedToRole: "NURSE",
            priority: "MEDIUM",
            estimatedDurationMinutes: 2,
            dueAt: new Date(Date.now() + 5 * 60000).toISOString(),
            createdBy: "AVORA_AUTOMATION",
          });
          await saveTaskToFirestore(nextTask);

          // Notify doctor that patient is ready
          await addDoc(collection(db, "notifications"), {
            organizationId,
            targetRole: "DOCTOR",
            title: "Patient Ready",
            message: `${patientName} has completed vitals and is ready for consultation.`,
            category: "PATIENT_FLOW",
            priority: "HIGH",
            read: false,
            createdAt: serverTimestamp(),
          });
        }

        if (taskType === "LAB_SAMPLE_COLLECTION") {
          // Sample collected ? create processing task for lab tech
          const procTask = createTask({
            organizationId,
            taskType: "LAB_TEST_PROCESSING",
            title: `Process Lab Sample — ${patientName}`,
            patientId,
            patientName,
            assignedToRole: "LAB_TECH",
            priority: "HIGH",
            estimatedDurationMinutes: 30,
            dueAt: new Date(Date.now() + 45 * 60000).toISOString(),
            createdBy: "AVORA_AUTOMATION",
          });
          await saveTaskToFirestore(procTask);
        }
        break;
      }

      // --- Lab Result Ready ------------------------------------------------
      case "LabResultReady": {
        const { patientId, patientName, doctorId, testName } = payload;
        await addDoc(collection(db, "notifications"), {
          organizationId,
          targetUserId: doctorId,
          targetRole: "DOCTOR",
          title: "Lab Result Ready",
          message: `${testName} results for ${patientName} are ready for review.`,
          category: "LAB_RESULT",
          priority: "HIGH",
          read: false,
          createdAt: serverTimestamp(),
        });
        break;
      }

      // --- Emergency Started -----------------------------------------------
      case "EmergencyStarted": {
        const { emergencyType, location } = payload;
        // Broadcast to all available staff
        await addDoc(collection(db, "notifications"), {
          organizationId,
          targetRole: "DOCTOR",
          title: `?? EMERGENCY: ${emergencyType}`,
          message: `Emergency declared at ${location}. Report to emergency station immediately.`,
          category: "EMERGENCY",
          priority: "CRITICAL",
          read: false,
          createdAt: serverTimestamp(),
        });
        await addDoc(collection(db, "notifications"), {
          organizationId,
          targetRole: "NURSE",
          title: `?? EMERGENCY: ${emergencyType}`,
          message: `Emergency declared at ${location}. All available nurses report immediately.`,
          category: "EMERGENCY",
          priority: "CRITICAL",
          read: false,
          createdAt: serverTimestamp(),
        });
        // Update hospital state to EMERGENCY mode
        await updateDoc(doc(db, "hospitalState", organizationId), {
          operatingMode: "EMERGENCY",
          activeEmergencies: 1,
          modeChangedAt: new Date().toISOString(),
        }).catch(() => {
          // Document might not exist yet — create it
          addDoc(collection(db, "hospitalState"), {
            organizationId,
            operatingMode: "EMERGENCY",
            activeEmergencies: 1,
            modeChangedAt: new Date().toISOString(),
          });
        });
        break;
      }

      // --- Appointment Booked ----------------------------------------------
      case "AppointmentBooked": {
        const { patientName, doctorId, date, timeSlot } = payload;
        if (doctorId) {
          await addDoc(collection(db, "notifications"), {
            organizationId,
            targetUserId: doctorId,
            targetRole: "DOCTOR",
            title: "New Appointment",
            message: `${patientName} has booked an appointment on ${date} at ${timeSlot}.`,
            category: "APPOINTMENT",
            priority: "LOW",
            read: false,
            createdAt: serverTimestamp(),
          });
        }
        break;
      }

      default:
        console.log(`[AVORA Automation] Unhandled event type: ${type}`);
    }

    // Mark event as processed
    if (event.id) {
      await updateDoc(doc(db, "events", event.id), {
        processed: true,
        processedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error(`[AVORA Automation] Error processing ${type}:`, err);
  }
}

// -- Start Automation Orchestrator (real-time listener) ----------------------
let _orchestratorActive = false;

export function startAutomationOrchestrator(organizationId: string): () => void {
  if (_orchestratorActive) return () => {};
  _orchestratorActive = true;
  console.log("[AVORA Automation] Orchestrator started for org:", organizationId);

  const q = query(
    collection(db, "events"),
    where("organizationId", "==", organizationId),
    where("processed", "==", false)
  );

  const unsubscribe = onSnapshot(q, (snap) => {
    snap.docChanges().forEach((change) => {
      if (change.type === "added") {
        const event = { id: change.doc.id, ...change.doc.data() } as AvoraEvent & { id: string };
        processEvent(event);
      }
    });
  }, (err) => {
    console.error("[AVORA Automation] Listener error:", err);
    _orchestratorActive = false;
  });

  return () => {
    _orchestratorActive = false;
    unsubscribe();
  };
}
