/**
 * AVORA Hospital State Engine
 * The central brain that continuously computes live hospital operational state,
 * detects mode changes, and manages the event stream.
 */

import {
  HospitalState,
  HospitalOperatingMode,
  DepartmentLoad,
  DepartmentAlertLevel,
  HospitalAlert,
  EmergencyEvent,
  OperationalEvent,
  OperationalEventType,
  JourneyStage,
} from '../types/index.js';

// ── Mode Thresholds ────────────────────────────────────────────────────────
const MODE_THRESHOLDS = {
  WARNING:   { overdueTasksRatio: 0.10, avgWaitMinutes: 30, capacityPct: 70 },
  HIGH_LOAD: { overdueTasksRatio: 0.20, avgWaitMinutes: 45, capacityPct: 80 },
  CRITICAL:  { overdueTasksRatio: 0.35, avgWaitMinutes: 60, capacityPct: 90 },
};

// ── Compute Department Alert Level ────────────────────────────────────────
export function computeDepartmentAlertLevel(dept: DepartmentLoad): DepartmentAlertLevel {
  if (dept.averageWaitMinutes >= 60 || dept.capacityPercentage >= 90 || dept.overdueTasks > 5) return 'CRITICAL';
  if (dept.averageWaitMinutes >= 45 || dept.capacityPercentage >= 80) return 'HIGH';
  if (dept.averageWaitMinutes >= 30 || dept.capacityPercentage >= 70) return 'ELEVATED';
  return 'NORMAL';
}

// ── Detect Operating Mode ─────────────────────────────────────────────────
export function detectOperatingMode(
  state: Pick<HospitalState, 'totalTasksActive' | 'totalTasksOverdue' | 'departments'>,
  currentMode: HospitalOperatingMode,
  activeEmergencies: number
): HospitalOperatingMode {
  if (activeEmergencies > 0) return 'EMERGENCY';

  const overdueRatio = state.totalTasksActive > 0
    ? state.totalTasksOverdue / state.totalTasksActive : 0;
  const criticalDepts = state.departments.filter(d => d.alertLevel === 'CRITICAL').length;
  const highDepts = state.departments.filter(d => d.alertLevel === 'HIGH').length;

  if (overdueRatio >= MODE_THRESHOLDS.CRITICAL.overdueTasksRatio || criticalDepts >= 2) return 'CRITICAL';
  if (overdueRatio >= MODE_THRESHOLDS.HIGH_LOAD.overdueTasksRatio || highDepts >= 2 || criticalDepts >= 1) return 'HIGH_LOAD';
  if (overdueRatio >= MODE_THRESHOLDS.WARNING.overdueTasksRatio || highDepts >= 1) return 'WARNING';
  if (currentMode === 'EMERGENCY' || currentMode === 'CRITICAL') return 'RECOVERY';
  return 'NORMAL';
}

// ── Build Hospital State ───────────────────────────────────────────────────
export function buildHospitalState(
  organizationId: string,
  departments: Omit<DepartmentLoad, 'alertLevel' | 'trend' | 'trendPercentage'>[],
  resources: HospitalState['resources'],
  totalTasksActive: number,
  totalTasksOverdue: number,
  totalTasksEscalated: number,
  taskCompletionRate: number,
  activeEmergencies: number,
  emergencyEvents: EmergencyEvent[],
  activeAlerts: HospitalAlert[],
  journeyDistribution: Partial<Record<JourneyStage, number>>,
  previousState?: HospitalState
): HospitalState {
  const now = new Date().toISOString();

  const enrichedDepts: DepartmentLoad[] = departments.map(dept => {
    const alertLevel = computeDepartmentAlertLevel(dept as DepartmentLoad);
    const prevDept = previousState?.departments.find(d => d.departmentId === dept.departmentId);
    let trend: DepartmentLoad['trend'] = 'STABLE';
    let trendPercentage = 0;
    if (prevDept) {
      trendPercentage = Math.abs(dept.capacityPercentage - prevDept.capacityPercentage);
      if (dept.capacityPercentage < prevDept.capacityPercentage - 3) trend = 'IMPROVING';
      else if (dept.capacityPercentage > prevDept.capacityPercentage + 3) trend = 'WORSENING';
    }
    return { ...dept, alertLevel, trend, trendPercentage } as DepartmentLoad;
  });

  const totalPatientsWaiting = enrichedDepts.reduce((s, d) => s + d.patientsWaiting, 0);
  const totalPatientsActive = enrichedDepts.reduce((s, d) => s + d.patientsTotal, 0);

  const operatingMode = detectOperatingMode(
    { totalTasksActive, totalTasksOverdue, departments: enrichedDepts },
    previousState?.operatingMode ?? 'NORMAL',
    activeEmergencies
  );
  const modeChanged = operatingMode !== previousState?.operatingMode;

  return {
    organizationId,
    operatingMode,
    modeChangedAt: modeChanged ? now : (previousState?.modeChangedAt ?? now),
    modeChangedReason: modeChanged
      ? `Auto-detected: ${activeEmergencies} emergencies, ${totalTasksOverdue} overdue tasks`
      : previousState?.modeChangedReason,
    computedAt: now,
    totalPatientsActive,
    totalPatientsWaiting,
    totalTasksActive,
    totalTasksOverdue,
    totalTasksEscalated,
    taskCompletionRateLastHour: taskCompletionRate,
    departments: enrichedDepts,
    resources,
    journeyStageDistribution: journeyDistribution,
    activeEmergencies,
    emergencyEvents,
    activeAlerts,
  };
}

// ── Mock State Generator ───────────────────────────────────────────────────
let _seed = Date.now();
function rng(min: number, max: number): number {
  _seed = (_seed * 9301 + 49297) % 233280;
  return Math.floor((_seed / 233280) * (max - min) + min);
}

export function generateMockHospitalState(organizationId: string): HospitalState {
  _seed = Date.now();
  const deptDefs = [
    { id: 'dept-1', name: 'Emergency & Trauma' },
    { id: 'dept-2', name: 'Cardiology OPD' },
    { id: 'dept-3', name: 'General Medicine' },
    { id: 'dept-4', name: 'Pediatrics' },
    { id: 'dept-5', name: 'Orthopedics' },
    { id: 'dept-6', name: 'Neurology' },
    { id: 'dept-7', name: 'Gynecology & Obstetrics' },
    { id: 'dept-8', name: 'ENT & Ophthalmology' },
    { id: 'dept-9', name: 'Laboratory' },
    { id: 'dept-10', name: 'Pharmacy' },
    { id: 'dept-11', name: 'Radiology' },
  ];

  const departments: Omit<DepartmentLoad, 'alertLevel' | 'trend' | 'trendPercentage'>[] = deptDefs.map(def => {
    const waiting = rng(0, 18);
    const consulting = rng(0, 5);
    const avgWait = rng(5, 65);
    const capacity = rng(20, 96);
    const overdue = rng(0, 9);
    return {
      departmentId: def.id,
      departmentName: def.name,
      organizationId,
      patientsWaiting: waiting,
      patientsInConsultation: consulting,
      patientsTotal: waiting + consulting,
      averageWaitMinutes: avgWait,
      longestWaitMinutes: avgWait + rng(5, 20),
      capacityPercentage: capacity,
      doctorsOnDuty: rng(2, 7),
      doctorsAvailable: rng(0, 3),
      nursesOnDuty: rng(3, 9),
      nursesAvailable: rng(0, 4),
      activeTasks: rng(5, 25),
      overdueTasks: overdue,
      tasksInEscalation: rng(0, 3),
      computedAt: new Date().toISOString(),
    };
  });

  const resources: HospitalState['resources'] = {
    doctorsOnDuty: rng(15, 30),
    doctorsAvailable: rng(3, 10),
    nursesOnDuty: rng(25, 50),
    nursesAvailable: rng(5, 15),
    bedsAvailable: rng(20, 60),
    bedsOccupied: rng(80, 120),
    bedsTotal: 180,
    labCapacityPercentage: rng(40, 92),
    pharmacyQueueDepth: rng(10, 40),
    emergencyBedsAvailable: rng(2, 8),
  };

  const totalActive = rng(40, 120);
  const totalOverdue = rng(5, 25);

  const mockAlerts = generateMockAlerts(organizationId);

  return buildHospitalState(
    organizationId,
    departments,
    resources,
    totalActive,
    totalOverdue,
    rng(2, 8),
    rng(60, 95),
    0,
    [],
    mockAlerts,
    {
      WAITING_NURSE: rng(10, 30),
      VITALS_IN_PROGRESS: rng(3, 10),
      WAITING_DOCTOR: rng(15, 40),
      IN_CONSULTATION: rng(8, 20),
      LAB_ORDERED: rng(5, 15),
      PHARMACY_QUEUED: rng(5, 20),
      BILLING_PENDING: rng(3, 12),
    }
  );
}

function generateMockAlerts(organizationId: string): HospitalAlert[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'alert-1', organizationId,
      title: 'Cardiology OPD Wait Time Elevated',
      message: 'Average wait time in Cardiology OPD has exceeded 45 minutes. 14 patients currently waiting.',
      severity: 'WARNING', category: 'DEPARTMENT_LOAD',
      departmentId: 'dept-2', departmentName: 'Cardiology OPD',
      isAcknowledged: false, createdAt: now,
      actionRequired: 'Consider adding a second doctor slot or redirecting non-urgent patients',
    },
    {
      id: 'alert-2', organizationId,
      title: '7 Overdue Tasks — General Medicine',
      message: 'General Medicine has 7 tasks past their due time requiring immediate attention.',
      severity: 'CRITICAL', category: 'TASK_OVERDUE',
      departmentId: 'dept-3', departmentName: 'General Medicine',
      isAcknowledged: false, createdAt: now,
      actionRequired: 'Review and reassign overdue tasks',
    },
    {
      id: 'alert-3', organizationId,
      title: 'Lab Capacity at 87%',
      message: 'Laboratory is processing near full capacity. 23 pending orders in queue.',
      severity: 'WARNING', category: 'RESOURCE_SHORTAGE',
      departmentId: 'dept-9', departmentName: 'Laboratory',
      isAcknowledged: false, createdAt: now,
      actionRequired: 'Consider activating overflow processing protocol',
    },
  ];
}

// ── Event Creator ─────────────────────────────────────────────────────────
export function createOperationalEvent(
  organizationId: string,
  eventType: OperationalEventType,
  payload: Record<string, any>,
  options?: { triggeredBy?: string; departmentId?: string; patientId?: string; taskId?: string }
): OperationalEvent {
  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    organizationId,
    eventType,
    payload,
    ...options,
    timestamp: new Date().toISOString(),
    processed: false,
  };
}

// ── Mode Config ────────────────────────────────────────────────────────────
export const MODE_CONFIG: Record<HospitalOperatingMode, {
  label: string; color: string; bg: string; border: string; pulse: boolean; icon: string;
}> = {
  NORMAL:    { label: 'Normal Operations',  color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: '#22c55e', pulse: false, icon: '✅' },
  WARNING:   { label: 'Elevated Load',      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: '#f59e0b', pulse: false, icon: '⚠️' },
  HIGH_LOAD: { label: 'High Load',          color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: '#f97316', pulse: false, icon: '🔶' },
  CRITICAL:  { label: 'Critical State',     color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: '#ef4444', pulse: true,  icon: '🔴' },
  EMERGENCY: { label: '🚨 EMERGENCY',       color: '#dc2626', bg: 'rgba(220,38,38,0.20)',   border: '#dc2626', pulse: true,  icon: '🚨' },
  RECOVERY:  { label: 'Recovery Mode',      color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: '#8b5cf6', pulse: false, icon: '🔄' },
};

export const DEPT_ALERT_CONFIG: Record<DepartmentAlertLevel, { color: string; bg: string; label: string }> = {
  NORMAL:   { color: '#22c55e', bg: 'rgba(34,197,94,0.10)',   label: 'Normal' },
  ELEVATED: { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', label: 'Elevated' },
  HIGH:     { color: '#f97316', bg: 'rgba(249,115,22,0.10)', label: 'High Load' },
  CRITICAL: { color: '#ef4444', bg: 'rgba(239,68,68,0.10)',   label: 'Critical' },
};
