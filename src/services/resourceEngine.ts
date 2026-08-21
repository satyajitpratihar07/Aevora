/**
 * AVORA Resource Engine
 * Finds the best available staff, beds, and resources for task assignment.
 */
import { StaffAvailability, ResourceCandidate, ResourceSearchResult, UserRole, WardBed } from '../types/index.js';

export function findBestStaff(
  candidates: StaffAvailability[],
  requiredRole: UserRole,
  preferredDept?: string
): ResourceSearchResult {
  const available = candidates.filter(s =>
    s.staffRole === requiredRole &&
    s.isOnDuty &&
    s.status !== 'OFF_DUTY' &&
    s.status !== 'OVERLOADED'
  );

  const ranked: ResourceCandidate[] = available.map((s, i) => {
    let score = 100;
    if (s.status === 'AVAILABLE') score += 30;
    if (s.status === 'BUSY') score -= 20;
    if (s.status === 'ON_BREAK') score -= 40;
    score -= s.workloadScore * 0.5;
    score -= s.overdueTaskCount * 10;
    if (preferredDept && s.departmentId === preferredDept) score += 20;
    const minutesLeft = s.minutesUntilShiftEnd ?? 480;
    if (minutesLeft < 30) score -= 30;

    let reason = `${s.pendingTaskCount} pending tasks, workload ${s.workloadScore}%`;
    if (s.status === 'AVAILABLE') reason = 'Available and ready';
    if (s.overdueTaskCount > 0) reason += `, ${s.overdueTaskCount} overdue`;

    return {
      resourceId: s.staffId,
      resourceName: s.staffName,
      resourceType: 'STAFF',
      role: s.staffRole,
      score: Math.max(0, Math.min(100, score)),
      rank: i + 1,
      isAvailable: s.status === 'AVAILABLE',
      reason,
      workloadScore: s.workloadScore,
    };
  }).sort((a, b) => b.score - a.score).map((c, i) => ({ ...c, rank: i + 1 }));

  return {
    searchId: `search-${Date.now()}`,
    requirement: `${requiredRole} in ${preferredDept ?? 'any department'}`,
    candidates: ranked,
    recommendedId: ranked[0]?.resourceId,
    recommendedReason: ranked[0]?.reason,
    searchedAt: new Date().toISOString(),
    noResultReason: ranked.length === 0 ? `No available ${requiredRole} found on duty` : undefined,
  };
}

export function findAvailableBeds(beds: WardBed[], wardType?: string): WardBed[] {
  return beds.filter(b =>
    b.status === 'AVAILABLE' &&
    (!wardType || b.wardType === wardType || b.type === wardType)
  );
}

export function computeWorkloadScore(pendingTasks: number, overdueTasks: number, taskCapacity: number): number {
  const base = (pendingTasks / Math.max(taskCapacity, 1)) * 70;
  const overdueBonus = overdueTasks * 10;
  return Math.min(100, Math.round(base + overdueBonus));
}

export function generateMockStaffAvailability(organizationId: string): StaffAvailability[] {
  const now = new Date();
  const shiftEnd = new Date(now.getTime() + 4 * 3600000).toISOString();
  return [
    { staffId: 'doc-1', staffName: 'Dr. Ramesh Iyer',     staffRole: 'DOCTOR',    departmentId: 'dept-2', departmentName: 'Cardiology OPD',  isOnDuty: true,  status: 'IN_CONSULTATION', pendingTaskCount: 4, overdueTaskCount: 0, workloadScore: 65, shiftEndsAt: shiftEnd, minutesUntilShiftEnd: 240 },
    { staffId: 'doc-2', staffName: 'Dr. Anita Bose',      staffRole: 'DOCTOR',    departmentId: 'dept-3', departmentName: 'General Medicine', isOnDuty: true,  status: 'AVAILABLE',       pendingTaskCount: 2, overdueTaskCount: 0, workloadScore: 30, shiftEndsAt: shiftEnd, minutesUntilShiftEnd: 240 },
    { staffId: 'nur-1', staffName: 'Sunita Sharma',       staffRole: 'NURSE',     departmentId: 'dept-2', departmentName: 'Cardiology OPD',  isOnDuty: true,  status: 'BUSY',            pendingTaskCount: 6, overdueTaskCount: 1, workloadScore: 78, shiftEndsAt: shiftEnd, minutesUntilShiftEnd: 240 },
    { staffId: 'nur-2', staffName: 'Meena Krishnan',      staffRole: 'NURSE',     departmentId: 'dept-3', departmentName: 'General Medicine', isOnDuty: true,  status: 'AVAILABLE',       pendingTaskCount: 2, overdueTaskCount: 0, workloadScore: 25, shiftEndsAt: shiftEnd, minutesUntilShiftEnd: 240 },
    { staffId: 'nur-3', staffName: 'Priya Nair',          staffRole: 'NURSE',     departmentId: 'dept-4', departmentName: 'Pediatrics',       isOnDuty: true,  status: 'OVERLOADED',      pendingTaskCount: 9, overdueTaskCount: 3, workloadScore: 95, shiftEndsAt: shiftEnd, minutesUntilShiftEnd: 240 },
    { staffId: 'lab-1', staffName: 'Arjun Patel',         staffRole: 'LAB_TECH',  departmentId: 'dept-9', departmentName: 'Laboratory',       isOnDuty: true,  status: 'BUSY',            pendingTaskCount: 5, overdueTaskCount: 0, workloadScore: 60, shiftEndsAt: shiftEnd, minutesUntilShiftEnd: 240 },
    { staffId: 'pha-1', staffName: 'Deepa Menon',         staffRole: 'PHARMACIST', departmentId: 'dept-10', departmentName: 'Pharmacy',       isOnDuty: true,  status: 'AVAILABLE',       pendingTaskCount: 3, overdueTaskCount: 0, workloadScore: 40, shiftEndsAt: shiftEnd, minutesUntilShiftEnd: 240 },
  ];
}
