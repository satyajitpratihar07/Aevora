/**
 * AVORA Patient Journey Engine
 * Initializes and advances the dynamic patient journey through hospital stages.
 */
import { PatientJourney, JourneyStage, JourneyStageRecord } from '../types/index.js';

const STAGE_EXPECTED_DURATIONS: Record<JourneyStage, number> = {
  PRE_REGISTERED: 0, REGISTERED: 5, WAITING_NURSE: 10, VITALS_IN_PROGRESS: 10,
  VITALS_DONE: 0, WAITING_DOCTOR: 20, IN_CONSULTATION: 20, CONSULTATION_DONE: 0,
  LAB_ORDERED: 0, SAMPLE_COLLECTED: 0, LAB_PROCESSING: 45, LAB_DONE: 0,
  WAITING_DOCTOR_REVIEW: 15, DOCTOR_REVIEW_DONE: 0, PHARMACY_QUEUED: 15,
  PHARMACY_DISPENSED: 0, BILLING_PENDING: 10, BILLING_DONE: 0,
  DISCHARGED: 0, ADMITTED: 0, EMERGENCY_TRIAGE: 5,
};

export function initializeJourney(
  patientId: string,
  patientName: string,
  organizationId: string,
  journeyType: PatientJourney['journeyType'],
  appointmentId?: string
): PatientJourney {
  const now = new Date().toISOString();
  const initialStage: JourneyStage = journeyType === 'EMERGENCY' ? 'EMERGENCY_TRIAGE' : 'REGISTERED';
  return {
    id: `journey-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    organizationId, patientId, patientName, appointmentId,
    journeyType, currentStage: initialStage,
    stages: [{ stage: initialStage, enteredAt: now, expectedDurationMinutes: STAGE_EXPECTED_DURATIONS[initialStage], isDelayed: false }],
    startedAt: now,
    totalWaitMinutes: 0, totalActiveMinutes: 0,
    isDelayed: false, status: 'ACTIVE', createdAt: now,
  };
}

export function advanceJourneyStage(journey: PatientJourney, nextStage: JourneyStage, handledBy?: string): PatientJourney {
  const now = new Date().toISOString();
  const updatedStages = journey.stages.map(s =>
    s.stage === journey.currentStage && !s.exitedAt
      ? {
          ...s,
          exitedAt: now,
          durationMinutes: Math.round((Date.now() - new Date(s.enteredAt).getTime()) / 60000),
          isDelayed: Math.round((Date.now() - new Date(s.enteredAt).getTime()) / 60000) > s.expectedDurationMinutes,
        }
      : s
  );
  const newStageRecord: JourneyStageRecord = {
    stage: nextStage, enteredAt: now,
    expectedDurationMinutes: STAGE_EXPECTED_DURATIONS[nextStage],
    isDelayed: false, handledBy,
  };
  return {
    ...journey,
    currentStage: nextStage,
    stages: [...updatedStages, newStageRecord],
    isDelayed: updatedStages.some(s => s.isDelayed),
  };
}

export function detectJourneyBottleneck(journey: PatientJourney): JourneyStage | undefined {
  const delayed = journey.stages.filter(s => s.isDelayed);
  if (delayed.length === 0) return undefined;
  return delayed.reduce((max, s) => (s.delayMinutes ?? 0) > (max.delayMinutes ?? 0) ? s : max).stage;
}

export function generateMockJourneys(organizationId: string): PatientJourney[] {
  const now = Date.now();
  const patients = [
    { id: 'pt-001', name: 'Ananya Sharma', stage: 'WAITING_DOCTOR' as JourneyStage, startMinsAgo: 45 },
    { id: 'pt-002', name: 'Rajesh Kumar',  stage: 'IN_CONSULTATION' as JourneyStage, startMinsAgo: 30 },
    { id: 'pt-003', name: 'Priya Menon',   stage: 'LAB_PROCESSING' as JourneyStage, startMinsAgo: 90 },
    { id: 'pt-004', name: 'Mohammed A.',   stage: 'PHARMACY_QUEUED' as JourneyStage, startMinsAgo: 120 },
    { id: 'pt-005', name: 'Kavitha Reddy', stage: 'WAITING_NURSE' as JourneyStage, startMinsAgo: 15 },
  ];
  return patients.map(p => {
    const startedAt = new Date(now - p.startMinsAgo * 60000).toISOString();
    return {
      id: `journey-${p.id}`, organizationId,
      patientId: p.id, patientName: p.name,
      journeyType: 'OPD' as const, currentStage: p.stage,
      stages: [{ stage: p.stage, enteredAt: startedAt, expectedDurationMinutes: STAGE_EXPECTED_DURATIONS[p.stage], isDelayed: p.startMinsAgo > 30 }],
      startedAt, totalWaitMinutes: Math.round(p.startMinsAgo * 0.6), totalActiveMinutes: Math.round(p.startMinsAgo * 0.4),
      isDelayed: p.startMinsAgo > 60, status: 'ACTIVE' as const, createdAt: startedAt,
    };
  });
}

export const JOURNEY_STAGE_LABELS: Record<JourneyStage, string> = {
  PRE_REGISTERED: 'Pre-Registered', REGISTERED: 'Registered', WAITING_NURSE: 'Waiting for Nurse',
  VITALS_IN_PROGRESS: 'Vitals Being Taken', VITALS_DONE: 'Vitals Done', WAITING_DOCTOR: 'Waiting for Doctor',
  IN_CONSULTATION: 'In Consultation', CONSULTATION_DONE: 'Consultation Done',
  LAB_ORDERED: 'Lab Tests Ordered', SAMPLE_COLLECTED: 'Sample Collected', LAB_PROCESSING: 'Lab Processing',
  LAB_DONE: 'Lab Results Ready', WAITING_DOCTOR_REVIEW: 'Waiting Doctor Review', DOCTOR_REVIEW_DONE: 'Review Done',
  PHARMACY_QUEUED: 'At Pharmacy', PHARMACY_DISPENSED: 'Medicines Dispensed',
  BILLING_PENDING: 'At Billing', BILLING_DONE: 'Payment Done',
  DISCHARGED: 'Discharged', ADMITTED: 'Admitted', EMERGENCY_TRIAGE: 'Emergency Triage',
};
