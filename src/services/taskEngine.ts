/**
 * AVORA Universal Task Engine
 * Creates, assigns, completes, escalates, and tracks all AvoraTasks across roles.
 */

import {
  AvoraTask, TaskType, TaskStatus, TaskPriority, UserRole, JourneyStage
} from '../types/index.js';
import { db } from './firebase.js';
import { collection, doc, setDoc, onSnapshot, query, where } from 'firebase/firestore';

export async function saveTaskToFirestore(task: AvoraTask) {
  try {
    await setDoc(doc(db, 'tasks', task.id), task);
  } catch (err) {
    console.error("Failed to save task to Firestore:", err);
  }
}

export function subscribeToTasks(organizationId: string, callback: (tasks: AvoraTask[]) => void) {
  const q = query(collection(db, 'tasks'), where('organizationId', '==', organizationId));
  return onSnapshot(q, (snap) => {
    const tasks = snap.docs.map(doc => doc.data() as AvoraTask);
    callback(tasks);
  }, (err) => {
    console.error("Failed to subscribe to tasks:", err);
  });
}

type NewTaskInput = {
  organizationId: string;
  taskType: TaskType;
  title: string;
  description?: string;
  patientId?: string;
  patientName?: string;
  appointmentId?: string;
  labOrderId?: string;
  admissionId?: string;
  wardBedId?: string;
  assignedToId?: string;
  assignedToName?: string;
  assignedToRole?: UserRole;
  department?: string;
  location?: string;
  priority: TaskPriority;
  estimatedDurationMinutes: number;
  dueAt: string;
  journeyId?: string;
  journeyStage?: JourneyStage;
  workflowTemplateId?: string;
  workflowStepIndex?: number;
  nextTaskType?: TaskType;
  createdBy: string;
  notes?: string;
  aiGenerated?: boolean;
};

// ── Create Task ────────────────────────────────────────────────────────────
export function createTask(input: NewTaskInput): AvoraTask {
  return {
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
    status: input.assignedToId ? 'ASSIGNED' : 'PENDING',
    escalationLevel: 0,
    escalationHistory: [],
    createdAt: new Date().toISOString(),
    ...input,
  };
}

// ── Assign Task ────────────────────────────────────────────────────────────
export function assignTask(
  task: AvoraTask,
  staffId: string,
  staffName: string,
  staffRole: UserRole
): AvoraTask {
  return {
    ...task,
    assignedToId: staffId,
    assignedToName: staffName,
    assignedToRole: staffRole,
    status: 'ASSIGNED',
  };
}

// ── Start Task ─────────────────────────────────────────────────────────────
export function startTask(task: AvoraTask): AvoraTask {
  return { ...task, status: 'IN_PROGRESS', startedAt: new Date().toISOString() };
}

// ── Complete Task ──────────────────────────────────────────────────────────
export function completeTask(task: AvoraTask, notes?: string): AvoraTask {
  return {
    ...task,
    status: 'COMPLETED',
    completedAt: new Date().toISOString(),
    completionNotes: notes,
  };
}

// ── Cancel Task ────────────────────────────────────────────────────────────
export function cancelTask(task: AvoraTask, reason: string): AvoraTask {
  return { ...task, status: 'CANCELLED', cancelledAt: new Date().toISOString(), cancelReason: reason };
}

// ── Escalate Task ──────────────────────────────────────────────────────────
export function escalateTask(task: AvoraTask, escalatedTo: string, reason: string): AvoraTask {
  const newLevel = task.escalationLevel + 1;
  return {
    ...task,
    status: 'ESCALATED',
    escalationLevel: newLevel,
    escalationHistory: [
      ...task.escalationHistory,
      { level: newLevel, escalatedAt: new Date().toISOString(), escalatedTo, reason },
    ],
  };
}

// ── Check if Overdue ────────────────────────────────────────────────────────
export function isTaskOverdue(task: AvoraTask): boolean {
  if (task.status === 'COMPLETED' || task.status === 'CANCELLED') return false;
  return new Date(task.dueAt) < new Date();
}

// ── Get Overdue Minutes ─────────────────────────────────────────────────────
export function getOverdueMinutes(task: AvoraTask): number {
  if (!isTaskOverdue(task)) return 0;
  return Math.floor((Date.now() - new Date(task.dueAt).getTime()) / 60000);
}

// ── Priority to Sort Weight ────────────────────────────────────────────────
const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  EMERGENCY: 5, CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1,
};

// ── Sort Task Queue ────────────────────────────────────────────────────────
export function sortTaskQueue(tasks: AvoraTask[]): AvoraTask[] {
  return [...tasks].sort((a, b) => {
    // Overdue first
    const aOverdue = isTaskOverdue(a) ? 1 : 0;
    const bOverdue = isTaskOverdue(b) ? 1 : 0;
    if (bOverdue !== aOverdue) return bOverdue - aOverdue;
    // Then by priority weight
    const priorityDiff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    // Then by due time
    return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
  });
}

// ── Filter Tasks for Role ──────────────────────────────────────────────────
export function filterTasksForRole(tasks: AvoraTask[], userId: string): AvoraTask[] {
  return tasks.filter(t =>
    t.assignedToId === userId ||
    (t.status === 'PENDING' && !t.assignedToId)
  );
}

// ── Task Type Config ───────────────────────────────────────────────────────
export const TASK_TYPE_CONFIG: Record<TaskType, {
  label: string;
  icon: string;
  defaultDuration: number;
  color: string;
}> = {
  VITALS:                  { label: 'Record Vitals',          icon: '❤️',  defaultDuration: 10,  color: '#ec4899' },
  CONSULTATION:            { label: 'Consultation',            icon: '🩺',  defaultDuration: 20,  color: '#6366f1' },
  SAMPLE_COLLECTION:       { label: 'Sample Collection',       icon: '🧪',  defaultDuration: 10,  color: '#8b5cf6' },
  LAB_PROCESSING:          { label: 'Lab Processing',          icon: '🔬',  defaultDuration: 30,  color: '#7c3aed' },
  LAB_RESULT_REVIEW:       { label: 'Review Lab Result',       icon: '📋',  defaultDuration: 10,  color: '#4f46e5' },
  DISPENSING:              { label: 'Dispense Medication',     icon: '💊',  defaultDuration: 10,  color: '#0891b2' },
  BED_PREP:                { label: 'Prepare Bed',             icon: '🛏️',  defaultDuration: 15,  color: '#059669' },
  BED_ASSIGNMENT:          { label: 'Assign Bed',              icon: '🏥',  defaultDuration: 5,   color: '#10b981' },
  DISCHARGE:               { label: 'Process Discharge',       icon: '🚪',  defaultDuration: 30,  color: '#64748b' },
  REGISTRATION:            { label: 'Patient Registration',    icon: '📝',  defaultDuration: 10,  color: '#f59e0b' },
  TRIAGE:                  { label: 'Triage Patient',          icon: '🚨',  defaultDuration: 15,  color: '#ef4444' },
  DOCUMENTATION:           { label: 'Documentation',           icon: '📄',  defaultDuration: 15,  color: '#64748b' },
  FOLLOW_UP_REVIEW:        { label: 'Follow-Up Review',        icon: '📅',  defaultDuration: 15,  color: '#6366f1' },
  PRESCRIPTION_COMPLETION: { label: 'Complete Prescription',   icon: '📋',  defaultDuration: 10,  color: '#8b5cf6' },
  MEDICATION_ADMINISTRATION:{ label: 'Administer Medication',  icon: '💉',  defaultDuration: 10,  color: '#0ea5e9' },
  PATIENT_TRANSPORT:       { label: 'Patient Transport',       icon: '🚑',  defaultDuration: 15,  color: '#f97316' },
  EQUIPMENT_CHECK:         { label: 'Equipment Check',         icon: '🔧',  defaultDuration: 20,  color: '#78716c' },
  EMERGENCY_RESPONSE:      { label: 'Emergency Response',      icon: '🚨',  defaultDuration: 30,  color: '#dc2626' },
  HANDOVER:                { label: 'Shift Handover',          icon: '🔄',  defaultDuration: 20,  color: '#9333ea' },
  CUSTOM:                  { label: 'Custom Task',             icon: '⚡',  defaultDuration: 15,  color: '#64748b' },
};

// ── Generate Mock Tasks ────────────────────────────────────────────────────
export function generateMockTasks(
  organizationId: string,
  staffId: string,
  staffRole: UserRole
): AvoraTask[] {
  const now = Date.now();
  const mockPatients = [
    { id: 'pt-001', name: 'Ananya Sharma' },
    { id: 'pt-002', name: 'Rajesh Kumar' },
    { id: 'pt-003', name: 'Priya Menon' },
    { id: 'pt-004', name: 'Mohammed Akhtar' },
    { id: 'pt-005', name: 'Kavitha Reddy' },
  ];

  const tasksByRole: Record<string, Array<{ type: TaskType; title: string; priority: TaskPriority; minsAgo: number }>> = {
    NURSE: [
      { type: 'VITALS',                   title: 'Record vitals — post-admission',      priority: 'HIGH',   minsAgo: -5  },
      { type: 'MEDICATION_ADMINISTRATION', title: 'Administer 8AM medications',          priority: 'HIGH',   minsAgo: -10 },
      { type: 'VITALS',                   title: 'Routine vitals check — Ward B',        priority: 'MEDIUM', minsAgo: 5   },
      { type: 'BED_PREP',                 title: 'Prepare Bed 12A for new admission',   priority: 'MEDIUM', minsAgo: 15  },
      { type: 'DOCUMENTATION',            title: 'Complete nursing notes — overnight',   priority: 'LOW',    minsAgo: 30  },
    ],
    DOCTOR: [
      { type: 'CONSULTATION',             title: 'OPD Consultation — Token A-047',      priority: 'HIGH',   minsAgo: -5  },
      { type: 'LAB_RESULT_REVIEW',        title: 'Review CBC results — Rajesh Kumar',   priority: 'HIGH',   minsAgo: 0   },
      { type: 'CONSULTATION',             title: 'Follow-up — Priya Menon',             priority: 'MEDIUM', minsAgo: 20  },
      { type: 'PRESCRIPTION_COMPLETION',  title: 'Finalize prescription — Mohammed A.', priority: 'MEDIUM', minsAgo: 25  },
      { type: 'DOCUMENTATION',            title: 'Discharge summary — Kavitha Reddy',   priority: 'LOW',    minsAgo: 45  },
    ],
    LAB_TECH: [
      { type: 'SAMPLE_COLLECTION',        title: 'Collect blood sample — Ananya Sharma',priority: 'HIGH',   minsAgo: -5  },
      { type: 'LAB_PROCESSING',           title: 'Process CBC — urgent order',          priority: 'CRITICAL',minsAgo: 0  },
      { type: 'LAB_PROCESSING',           title: 'Process LFT panel — Rajesh Kumar',    priority: 'HIGH',   minsAgo: 10  },
      { type: 'SAMPLE_COLLECTION',        title: 'Urine sample — Ward C',               priority: 'MEDIUM', minsAgo: 20  },
    ],
    PHARMACIST: [
      { type: 'DISPENSING',               title: 'Dispense — Prescription RX-2847',     priority: 'HIGH',   minsAgo: -5  },
      { type: 'DISPENSING',               title: 'Dispense — Emergency medication',      priority: 'CRITICAL',minsAgo: 0  },
      { type: 'DISPENSING',               title: 'Dispense — Priya Menon discharge',     priority: 'MEDIUM', minsAgo: 15  },
    ],
  };

  const roleTasks = tasksByRole[staffRole] || tasksByRole.NURSE;

  return roleTasks.map((def, i) => {
    const patient = mockPatients[i % mockPatients.length];
    const dueAt = new Date(now + def.minsAgo * 60000).toISOString();
    const isOverdue = def.minsAgo > 0;

    return createTask({
      organizationId,
      taskType: def.type,
      title: def.title,
      patientId: patient.id,
      patientName: patient.name,
      priority: def.priority,
      estimatedDurationMinutes: TASK_TYPE_CONFIG[def.type].defaultDuration,
      dueAt,
      assignedToId: staffId,
      assignedToName: 'Current User',
      assignedToRole: staffRole,
      department: staffRole === 'NURSE' ? 'General Ward' : staffRole === 'DOCTOR' ? 'Cardiology OPD' : 'Laboratory',
      location: staffRole === 'NURSE' ? 'Ward B' : staffRole === 'DOCTOR' ? 'OPD Room 3' : 'Lab Block A',
      createdBy: 'AVORA_SYSTEM',
      status: isOverdue ? 'OVERDUE' : (i === 0 ? 'IN_PROGRESS' : 'ASSIGNED'),
    });
  });
}
