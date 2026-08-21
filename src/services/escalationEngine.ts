/**
 * AVORA Escalation Engine
 * Monitors task deadlines and triggers escalation chains.
 */
import { AvoraTask, EscalationRule, TaskPriority } from '../types/index.js';
import { isTaskOverdue, getOverdueMinutes, escalateTask } from './taskEngine.js';

// Default escalation rules by priority
const DEFAULT_ESCALATION_RULES: Record<TaskPriority, number[]> = {
  EMERGENCY: [5, 10, 20],
  CRITICAL:  [10, 20, 40],
  HIGH:      [20, 40, 90],
  MEDIUM:    [45, 90, 180],
  LOW:       [120, 240, 480],
};

export function shouldEscalate(task: AvoraTask): boolean {
  if (!isTaskOverdue(task)) return false;
  if (task.status === 'COMPLETED' || task.status === 'CANCELLED') return false;
  const overdueMins = getOverdueMinutes(task);
  const thresholds = DEFAULT_ESCALATION_RULES[task.priority];
  const nextThreshold = thresholds[task.escalationLevel];
  return nextThreshold !== undefined && overdueMins >= nextThreshold;
}

export function processEscalations(
  tasks: AvoraTask[],
  onEscalate: (task: AvoraTask, message: string) => void
): AvoraTask[] {
  return tasks.map(task => {
    if (!shouldEscalate(task)) return task;
    const overdueMins = getOverdueMinutes(task);
    const level = task.escalationLevel + 1;
    const message = `AVORA Escalation Level ${level}: Task "${task.title}" for patient ${task.patientName ?? 'Unknown'} is ${overdueMins} minutes overdue.`;
    const escalatedTo = level === 1 ? 'Department Supervisor' : level === 2 ? 'Department Head' : 'Hospital Administrator';
    onEscalate(task, message);
    return escalateTask(task, escalatedTo, `Overdue by ${overdueMins} minutes — auto-escalated by AVORA`);
  });
}

export function getEscalationUrgencyColor(level: number): string {
  if (level >= 3) return '#dc2626';
  if (level === 2) return '#f97316';
  if (level === 1) return '#f59e0b';
  return '#64748b';
}

export function generateMockEscalationRules(organizationId: string): EscalationRule[] {
  return [
    {
      id: 'esc-1', organizationId,
      name: 'Critical Task Escalation',
      priority: 'CRITICAL',
      isActive: true,
      createdAt: new Date().toISOString(),
      levels: [
        { level: 1, triggerAfterMinutes: 10, notifyRole: 'NURSE', notifyName: 'Charge Nurse', message: 'Critical task overdue by 10 minutes' },
        { level: 2, triggerAfterMinutes: 20, notifyRole: 'HOSPITAL_ADMIN', notifyName: 'Department Head', message: 'Critical task overdue by 20 minutes — escalated to head' },
        { level: 3, triggerAfterMinutes: 40, notifyRole: 'HOSPITAL_ADMIN', notifyName: 'Hospital Administrator', message: 'Critical task still unresolved — immediate action required' },
      ],
    },
    {
      id: 'esc-2', organizationId,
      name: 'Emergency Response Escalation',
      taskType: 'EMERGENCY_RESPONSE',
      priority: 'EMERGENCY',
      isActive: true,
      createdAt: new Date().toISOString(),
      levels: [
        { level: 1, triggerAfterMinutes: 5,  notifyRole: 'DOCTOR', notifyName: 'On-Call Doctor', message: 'Emergency task unacknowledged for 5 minutes' },
        { level: 2, triggerAfterMinutes: 10, notifyRole: 'HOSPITAL_ADMIN', notifyName: 'Emergency Director', message: 'Emergency task escalated to director level' },
      ],
    },
  ];
}
