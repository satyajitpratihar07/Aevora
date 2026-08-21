/**
 * AVORA Automation Engine
 * Deterministic workflow triggers responding to operational events.
 */
import { AvoraTask, UserRole } from '../types/index.js';
import { createTask, TASK_TYPE_CONFIG } from './taskEngine.js';

export function onPatientCheckedIn(
  organizationId: string, patientId: string, patientName: string,
  appointmentId: string, department: string
): AvoraTask {
  const dueAt = new Date(Date.now() + 10 * 60000).toISOString();
  return createTask({
    organizationId, taskType: 'VITALS', patientId, patientName, appointmentId,
    title: `Record vitals — ${patientName}`,
    description: 'Patient has checked in. Record vitals before doctor consultation.',
    assignedToRole: 'NURSE' as UserRole,
    priority: 'HIGH', estimatedDurationMinutes: 10, dueAt,
    department, location: 'Nursing Station',
    createdBy: 'AVORA_AUTOMATION',
    journeyStage: 'WAITING_NURSE',
  });
}

export function onLabResultReady(
  organizationId: string, patientId: string, patientName: string,
  labOrderId: string, doctorId: string, doctorName: string, department: string
): AvoraTask {
  const dueAt = new Date(Date.now() + 15 * 60000).toISOString();
  return createTask({
    organizationId, taskType: 'LAB_RESULT_REVIEW',
    patientId, patientName, labOrderId,
    title: `Review lab results — ${patientName}`,
    description: 'Lab results are ready and require doctor review.',
    assignedToId: doctorId, assignedToName: doctorName,
    assignedToRole: 'DOCTOR' as UserRole,
    priority: 'HIGH', estimatedDurationMinutes: 10, dueAt,
    department, createdBy: 'AVORA_AUTOMATION',
    journeyStage: 'LAB_DONE',
  });
}

export function onPrescriptionCreated(
  organizationId: string, patientId: string, patientName: string,
  prescriptionId: string, department: string
): AvoraTask {
  const dueAt = new Date(Date.now() + 20 * 60000).toISOString();
  return createTask({
    organizationId, taskType: 'DISPENSING',
    patientId, patientName,
    title: `Dispense prescription — ${patientName}`,
    description: `Prescription ${prescriptionId} ready for dispensing.`,
    assignedToRole: 'PHARMACIST' as UserRole,
    priority: 'MEDIUM', estimatedDurationMinutes: 10, dueAt,
    department: 'Pharmacy', location: 'Pharmacy Counter',
    createdBy: 'AVORA_AUTOMATION',
    journeyStage: 'PHARMACY_QUEUED',
  });
}

export function onBedReleased(
  organizationId: string, bedId: string, wardName: string, bedNumber: string
): AvoraTask {
  const dueAt = new Date(Date.now() + 30 * 60000).toISOString();
  return createTask({
    organizationId, taskType: 'BED_PREP', wardBedId: bedId,
    title: `Prepare bed — ${wardName} ${bedNumber}`,
    description: 'Bed released. Clean and prepare for next patient.',
    assignedToRole: 'NURSE' as UserRole,
    priority: 'MEDIUM', estimatedDurationMinutes: 20, dueAt,
    department: wardName, location: `${wardName} Bed ${bedNumber}`,
    createdBy: 'AVORA_AUTOMATION',
  });
}
