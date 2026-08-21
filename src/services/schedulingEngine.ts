/**
 * AVORA Scheduling Engine
 * Intelligent appointment slot management with congestion scoring.
 */
import { AppointmentSlot, SlotCongestion } from '../types/index.js';

export function computeSlotCongestion(bookedCount: number, maxCapacity: number): SlotCongestion {
  const ratio = bookedCount / maxCapacity;
  if (ratio >= 1.0) return 'FULL';
  if (ratio >= 0.75) return 'HIGH';
  if (ratio >= 0.45) return 'MEDIUM';
  return 'LOW';
}

export function computeExpectedWait(bookedCount: number, avgConsultMinutes: number = 15): number {
  return bookedCount * avgConsultMinutes;
}

export function generateMockSlots(doctorId: string, doctorName: string, date: string): AppointmentSlot[] {
  const slots: AppointmentSlot[] = [];
  const times = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30'];
  const caps  = [3,4,3,4,3,2,4,3,4,3,2,3];
  const books = [3,4,2,3,1,0,4,2,3,1,0,1];

  times.forEach((time, i) => {
    const booked = books[i];
    const cap = caps[i];
    const congestion = computeSlotCongestion(booked, cap);
    const expectedWait = computeExpectedWait(booked);
    const isRecommended = congestion === 'LOW' && expectedWait < 20;
    slots.push({
      slotId: `slot-${doctorId}-${date}-${time}`,
      doctorId, doctorName, date,
      startTime: time,
      endTime: `${String(parseInt(time)+1).padStart(2,'0')}:${time.slice(3)}`,
      isAvailable: congestion !== 'FULL',
      congestion, expectedWaitMinutes: expectedWait,
      bookedCount: booked, maxCapacity: cap, isRecommended,
      recommendationReason: isRecommended ? 'Low congestion, minimal wait time expected' : undefined,
      congestionScore: Math.round((booked / cap) * 100),
    });
  });
  return slots;
}

export function getSpecialClinicWorkflow(clinicType: string): { steps: string[]; totalMins: number } {
  const workflows: Record<string, { steps: string[]; totalMins: number }> = {
    DIABETES_CLINIC: { steps: ['Registration','Vitals & Weight','HbA1c Lab Test','Endocrinologist Consultation','Dietitian Counseling','Pharmacy','Billing'], totalMins: 180 },
    CARDIAC_CLINIC:  { steps: ['Registration','Vitals & BP','ECG','Cardiologist Consultation','Echocardiogram (if ordered)','Pharmacy','Billing'], totalMins: 150 },
    ANTENATAL:       { steps: ['Registration','Vitals & Weight','Obstetric Ultrasound','Gynecologist Consultation','Lab Tests','Pharmacy','Billing'], totalMins: 120 },
    NEUROLOGY:       { steps: ['Registration','Vitals','Neurologist Consultation','MRI/CT (if ordered)','Pharmacy','Billing'], totalMins: 120 },
    DEFAULT:         { steps: ['Registration','Vitals','Doctor Consultation','Pharmacy','Billing'], totalMins: 60 },
  };
  return workflows[clinicType] ?? workflows.DEFAULT;
}
