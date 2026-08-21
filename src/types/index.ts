export type UserRole =
  | 'SUPER_ADMIN'
  | 'HOSPITAL_ADMIN'
  | 'DOCTOR'
  | 'NURSE'
  | 'PHARMACIST'
  | 'LAB_TECH'
  | 'LAB_TECHNICIAN'
  | 'ACCOUNTANT'
  | 'RECEPTIONIST'
  | 'PATIENT'
  | 'TECHNICAL_STAFF';

export type Permission =
  | 'PATIENT_VIEW'
  | 'PATIENT_CREATE'
  | 'PATIENT_UPDATE'
  | 'PATIENT_DELETE'
  | 'APPOINTMENT_VIEW'
  | 'APPOINTMENT_CREATE'
  | 'APPOINTMENT_UPDATE'
  | 'PRESCRIPTION_VIEW'
  | 'PRESCRIPTION_CREATE'
  | 'LAB_VIEW'
  | 'LAB_CREATE'
  | 'LAB_UPDATE'
  | 'BILLING_VIEW'
  | 'BILLING_CREATE'
  | 'INVENTORY_VIEW'
  | 'INVENTORY_MANAGE'
  | 'STAFF_MANAGE'
  | 'ADMISSION_MANAGE'
  | 'REPORT_VIEW'
  | 'SETTINGS_MANAGE'
  | 'AUDIT_VIEW'
  | 'SUPER_ADMIN_ACCESS';

export interface Organization {
  id: string;
  name: string;
  code: string;
  slug?: string;
  tagline?: string;
  type?: 'HOSPITAL' | 'CLINIC' | 'DIAGNOSTIC_CENTER' | 'SPECIALTY_CARE';
  tier?: 'STARTER_CLINIC' | 'PROFESSIONAL_HOSPITAL' | 'ENTERPRISE_HOSPITAL';
  logoUrl?: string;
  brandColor: string;
  secondaryColor?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  phone: string;
  email: string;
  website?: string;
  currency?: string;
  timezone?: string;
  taxRate?: number;
  maxDoctors?: number;
  maxBeds?: number;
  status?: 'ACTIVE' | 'TRIAL' | 'PAST_DUE' | 'SUSPENDED';
  subscriptionPlan?: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  subscriptionStatus?: 'ACTIVE' | 'TRIAL' | 'PAST_DUE' | 'SUSPENDED';
  subscriptionExpiresAt?: string;
  patientLimit?: number;
  staffLimit?: number;
  aiUsageThisMonth?: number;
  aiUsageLimit?: number;
  createdAt: string;
}

export interface User {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  department?: string;
  departmentId?: string;
  specialization?: string;
  licenseNumber?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  permissions: Permission[];
}

export interface Department {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  description: string;
  headDoctorId?: string;
  headDoctorName?: string;
  floor: string;
  totalBeds: number;
  availableBeds: number;
  activeDoctorsCount: number;
}

export interface Patient {
  id: string;
  organizationId: string;
  patientIdNumber: string; // e.g. PAT-2026-0042
  name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob?: string;
  dateOfBirth?: string;
  age: number;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  phone: string;
  email: string;
  address: string;
  city?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  insurance?: {
    provider: string;
    policyNumber: string;
    coverageLimit: number;
    validUntil: string;
  };
  allergies: string[];
  chronicConditions: string[];
  currentMedications?: string[];
  registeredDate?: string;
  lastVisitDate?: string;
  status: 'OUTPATIENT' | 'INPATIENT' | 'DISCHARGED';
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  currentWardBed?: string;
}

export interface VitalSign {
  id: string;
  patientId: string;
  organizationId?: string;
  recordedAt: string;
  recordedBy: string;
  bloodPressure?: string;
  systolicBp?: number;
  diastolicBp?: number;
  heartRate?: number;
  pulseRate?: number;
  temperatureC?: number;
  temperatureF?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  spO2?: number;
  bloodSugar?: number;
  bloodSugarMgDl?: number;
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
  notes?: string;
}

export interface Appointment {
  id: string;
  organizationId: string;
  appointmentNumber?: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty?: string;
  doctorSpecialization?: string;
  department?: string;
  departmentId?: string;
  departmentName?: string;
  date?: string;
  appointmentDate?: string;
  timeSlot?: string;
  appointmentTime?: string;
  type: 'GENERAL_CHECKUP' | 'FOLLOW_UP' | 'EMERGENCY' | 'SPECIALIST_CONSULT' | 'ROUTINE' | 'NEW_CONSULTATION' | 'ROUTINE_CHECKUP';
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  queueNumber?: number;
  tokenNumber?: string;
  qrCheckInToken?: string;
  symptoms?: string;
  reasonForVisit?: string;
  notes?: string;
  consultationFee?: number;
  isPaid?: boolean;
  createdAt: string;
}

export interface PrescriptionItem {
  id?: string;
  medicineId?: string;
  medicineName: string;
  genericName?: string;
  dosage: string; // e.g. "500 mg"
  frequency: string; // e.g. "1-0-1 (Twice daily after meals)"
  duration: string; // e.g. "5 Days"
  route?: 'ORAL' | 'IV' | 'IM' | 'TOPICAL' | 'INHALATION' | 'OPHTHALMIC';
  instructions: string; // e.g. "Take with plenty of water"
  isAiSuggested?: boolean;
}

export interface Prescription {
  id: string;
  organizationId: string;
  prescriptionNumber: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty?: string;
  doctorSpecialization?: string;
  doctorLicense?: string;
  appointmentId?: string;
  date?: string;
  diagnosis: string;
  chiefComplaints?: string[];
  symptoms?: string | string[];
  clinicalObservations?: string;
  clinicalNotes?: string;
  vitalsSummary?: {
    bp: string;
    pulse: string;
    temp: string;
    spo2: string;
  };
  items: PrescriptionItem[];
  advisedTests?: string[];
  testsAdvised?: string[];
  lifestyleAdvice?: string[];
  followUpDays?: number;
  followUpDate?: string;
  doctorNotes?: string;
  aiAssisted?: boolean;
  aiModelUsed?: string;
  aiPromptSummary?: string;
  clinicianVerified?: boolean;
  clinicianVerifiedAt?: string;
  status: 'DRAFT' | 'FINALIZED' | 'DISPENSED';
  digitalSignatureHash?: string;
  createdAt?: string;
}

export interface LabTestParameterDef {
  name: string;
  unit: string;
  minValue: number;
  maxValue: number;
}

export interface LabTest {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  category?: 'HEMATOLOGY' | 'BIOCHEMISTRY' | 'MICROBIOLOGY' | 'PATHOLOGY' | 'RADIOLOGY' | 'CARDIOLOGY';
  sampleType: 'BLOOD' | 'URINE' | 'SERUM' | 'SWAB' | 'TISSUE' | 'IMAGING' | 'OTHER';
  price: number;
  turnaroundHours?: number;
  referenceRange?: string;
  unit?: string;
  description?: string;
  normalMin?: number;
  normalMax?: number;
  parameters?: LabTestParameterDef[];
}

export interface LabResultParameter {
  name: string;
  value: string;
  numericValue?: number;
  unit: string;
  referenceRange: string;
  flag: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';
}

export interface LabOrder {
  id: string;
  organizationId: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  testId?: string;
  testCode?: string;
  testName: string;
  testCategory?: string;
  sampleType: string;
  priority: 'ROUTINE' | 'URGENT' | 'STAT_EMERGENCY';
  status: 'ORDERED' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'RESULT_ENTERED' | 'VERIFIED' | 'PUBLISHED';
  sampleCollectedAt?: string;
  sampleCollectedBy?: string;
  results?: LabResultParameter[];
  parameters?: LabResultParameter[];
  conclusion?: string;
  clinicalInterpretation?: string;
  technicianNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  orderedAt?: string;
  cost?: number;
  isPaid?: boolean;
  createdAt?: string;
}

export interface Medicine {
  id: string;
  organizationId: string;
  name: string;
  genericName: string;
  sku?: string;
  category: 'ANTIBIOTIC' | 'ANALGESIC' | 'ANTIHYPERTENSIVE' | 'ANTIDIABETIC' | 'ANTIVIRAL' | 'ANTIHISTAMINE' | 'SUPPLEMENT' | 'OTHER' | string;
  dosageForm?: 'TABLET' | 'CAPSULE' | 'SYRUP' | 'INJECTION' | 'OINTMENT' | 'DROPS' | string;
  form?: string;
  strength: string;
  manufacturer: string;
  currentStock: number;
  minStockLevel?: number;
  reorderLevel?: number;
  purchasePrice?: number;
  costPrice?: number;
  sellingPrice: number;
  batchNumber: string;
  expiryDate: string;
  locationRack?: string;
  requiresPrescription?: boolean;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED';
}

export interface InventoryItem {
  id: string;
  organizationId: string;
  itemCode: string;
  name: string;
  category: 'MEDICINE' | 'SURGICAL' | 'CONSUMABLE' | 'EQUIPMENT' | 'LAB_REAGENT' | 'OFFICE';
  unitOfMeasure: string;
  quantityOnHand: number;
  minReorderLevel: number;
  unitCost: number;
  supplierName: string;
  location: string;
  lastRestockedDate: string;
  status: 'ADEQUATE' | 'LOW_STOCK' | 'CRITICAL';
}

export interface InvoiceItem {
  id?: string;
  description: string;
  category: 'CONSULTATION' | 'LAB_TEST' | 'PHARMACY' | 'BED_CHARGE' | 'BED_CHARGES' | 'PROCEDURE' | 'SERVICE' | 'OTHER';
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  total?: number;
}

export interface Invoice {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  patientIdNumber?: string;
  patientPhone?: string;
  date?: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: 'DRAFT' | 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED' | 'CANCELLED';
  paymentMethod?: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'UPI_ONLINE' | 'INSURANCE_CLAIM' | string;
  paymentTransactions?: Array<{
    id: string;
    amount: number;
    date: string;
    method: string;
    reference: string;
    receivedBy: string;
  }>;
  insuranceClaimId?: string;
  notes?: string;
  createdAt?: string;
}

export interface WardBed {
  id: string;
  organizationId: string;
  wardId?: string;
  wardName: string;
  wardType?: 'GENERAL' | 'ICU' | 'NICU' | 'PEDIATRIC' | 'SURGICAL' | 'MATERNITY' | 'EMERGENCY' | 'DELUXE';
  type?: string;
  roomNumber: string;
  floorNumber?: number;
  bedNumber: string;
  dailyRate: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' | 'MAINTENANCE';
  patientId?: string;
  patientName?: string;
  occupiedByPatientId?: string;
  occupiedByPatientName?: string;
  admissionId?: string;
  admittedAt?: string;
  assignedDoctorName?: string;
  assignedNurseName?: string;
}

export interface Admission {
  id: string;
  organizationId: string;
  admissionNumber?: string;
  patientId: string;
  patientName: string;
  bedId: string;
  wardName: string;
  bedNumber: string;
  admittedDate: string;
  admittingDoctorId?: string;
  admittingDoctorName?: string;
  attendingDoctor?: string;
  admittingDiagnosis: string;
  dailyRoomRate?: number;
  status: 'ADMITTED' | 'TRANSFERRED' | 'DISCHARGED';
  dischargeDate?: string;
  dischargeSummary?: string;
  vitalsFrequencyHours?: number;
  careNotes?: Array<{
    id: string;
    timestamp: string;
    authorName: string;
    authorRole: string;
    note: string;
  }>;
}

export interface Notification {
  id: string;
  organizationId: string;
  targetRole?: UserRole;
  targetUserId?: string;
  title: string;
  message: string;
  category: 'APPOINTMENT' | 'LAB_RESULT' | 'PHARMACY' | 'EMERGENCY' | 'BILLING' | 'SYSTEM' | 'SECURITY';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  userId?: string;
  userName: string;
  userRole?: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp?: string;
  createdAt?: string;
  ipAddress?: string;
  details?: string;
  status?: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export interface AiPrescriptionDraftRequest {
  patientAge: number;
  patientGender: string;
  chiefComplaints: string[];
  symptomsText: string;
  vitals?: {
    bp?: string;
    pulse?: string;
    temp?: string;
    spo2?: string;
  };
  allergies?: string[];
  chronicConditions?: string[];
  currentMedications?: string[];
  doctorClinicalNotes?: string;
}

export interface AiPrescriptionDraftResponse {
  assessment: string;
  possibleDiagnoses: string[];
  suggestedMedications: Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    route: 'ORAL' | 'IV' | 'IM' | 'TOPICAL' | 'INHALATION' | 'OPHTHALMIC';
    instructions: string;
    rational: string;
    caution: string;
  }>;
  recommendedTests: string[];
  suggestedFollowUpDays: number;
  lifestyleAdvice: string[];
  safetyWarnings: string[];
  missingInformationPrompts: string[];
  modelConfidence: 'HIGH' | 'MEDIUM' | 'REQUIRES_CLINICAL_VALIDATION';
  disclaimer: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// AVORA PRODUCTION TYPES — Hospital Operating System Core
// ─────────────────────────────────────────────────────────────────────────────

export type HospitalOperatingMode =
  | 'NORMAL'
  | 'WARNING'
  | 'HIGH_LOAD'
  | 'CRITICAL'
  | 'EMERGENCY'
  | 'RECOVERY';

export type TaskType =
  | 'VITALS' | 'CONSULTATION' | 'SAMPLE_COLLECTION' | 'LAB_PROCESSING'
  | 'LAB_RESULT_REVIEW' | 'DISPENSING' | 'BED_PREP' | 'BED_ASSIGNMENT'
  | 'DISCHARGE' | 'REGISTRATION' | 'TRIAGE' | 'DOCUMENTATION'
  | 'FOLLOW_UP_REVIEW' | 'PRESCRIPTION_COMPLETION' | 'MEDICATION_ADMINISTRATION'
  | 'PATIENT_TRANSPORT' | 'EQUIPMENT_CHECK' | 'EMERGENCY_RESPONSE'
  | 'HANDOVER' | 'CUSTOM';

export type TaskStatus =
  | 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED'
  | 'OVERDUE' | 'ESCALATED' | 'CANCELLED' | 'ON_HOLD';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EMERGENCY';

export interface AvoraTask {
  id: string;
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
  status: TaskStatus;
  estimatedDurationMinutes: number;
  dueAt: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  escalationLevel: number;
  escalationHistory: Array<{
    level: number;
    escalatedAt: string;
    escalatedTo: string;
    reason: string;
  }>;
  journeyId?: string;
  journeyStage?: JourneyStage;
  workflowTemplateId?: string;
  workflowStepIndex?: number;
  nextTaskType?: TaskType;
  createdAt: string;
  createdBy: string;
  notes?: string;
  completionNotes?: string;
  aiGenerated?: boolean;
}

export type JourneyStage =
  | 'PRE_REGISTERED' | 'REGISTERED' | 'WAITING_NURSE' | 'VITALS_IN_PROGRESS'
  | 'VITALS_DONE' | 'WAITING_DOCTOR' | 'IN_CONSULTATION' | 'CONSULTATION_DONE'
  | 'LAB_ORDERED' | 'SAMPLE_COLLECTED' | 'LAB_PROCESSING' | 'LAB_DONE'
  | 'WAITING_DOCTOR_REVIEW' | 'DOCTOR_REVIEW_DONE' | 'PHARMACY_QUEUED'
  | 'PHARMACY_DISPENSED' | 'BILLING_PENDING' | 'BILLING_DONE'
  | 'DISCHARGED' | 'ADMITTED' | 'EMERGENCY_TRIAGE';

export interface JourneyStageRecord {
  stage: JourneyStage;
  enteredAt: string;
  exitedAt?: string;
  durationMinutes?: number;
  expectedDurationMinutes: number;
  isDelayed: boolean;
  delayMinutes?: number;
  delayReason?: string;
  handledBy?: string;
  handledByRole?: UserRole;
  taskId?: string;
}

export interface PatientJourney {
  id: string;
  organizationId: string;
  patientId: string;
  patientName: string;
  appointmentId?: string;
  admissionId?: string;
  workflowTemplateId?: string;
  journeyType: 'OPD' | 'EMERGENCY' | 'SPECIAL_CLINIC' | 'INPATIENT' | 'PROCEDURE';
  currentStage: JourneyStage;
  stages: JourneyStageRecord[];
  startedAt: string;
  expectedCompletionAt?: string;
  completedAt?: string;
  totalWaitMinutes: number;
  totalActiveMinutes: number;
  isDelayed: boolean;
  bottleneckStage?: JourneyStage;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  createdAt: string;
}

export interface QueueEntry {
  id: string;
  organizationId: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  tokenNumber: string;
  displayToken: string;
  queuePosition: number;
  doctorId?: string;
  doctorName?: string;
  departmentId?: string;
  departmentName?: string;
  appointmentType: string;
  priority: TaskPriority;
  isEmergency: boolean;
  isWalkIn: boolean;
  checkedInAt: string;
  calledAt?: string;
  consultationStartAt?: string;
  exitedAt?: string;
  estimatedWaitMinutes: number;
  actualWaitMinutes?: number;
  estimatedCallTime?: string;
  status: 'WAITING' | 'CALLED' | 'IN_CONSULTATION' | 'COMPLETED' | 'SKIPPED' | 'NO_SHOW';
  isDelayed: boolean;
  delayMinutes?: number;
  journeyId?: string;
  createdAt: string;
}

export type DepartmentAlertLevel = 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';

export interface DepartmentLoad {
  departmentId: string;
  departmentName: string;
  organizationId: string;
  patientsWaiting: number;
  patientsInConsultation: number;
  patientsTotal: number;
  averageWaitMinutes: number;
  longestWaitMinutes: number;
  capacityPercentage: number;
  doctorsOnDuty: number;
  doctorsAvailable: number;
  nursesOnDuty: number;
  nursesAvailable: number;
  activeTasks: number;
  overdueTasks: number;
  tasksInEscalation: number;
  alertLevel: DepartmentAlertLevel;
  trend: 'IMPROVING' | 'STABLE' | 'WORSENING';
  trendPercentage: number;
  computedAt: string;
}

export interface HospitalAlert {
  id: string;
  organizationId: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'EMERGENCY';
  category: 'DEPARTMENT_LOAD' | 'TASK_OVERDUE' | 'RESOURCE_SHORTAGE' | 'EMERGENCY' | 'SYSTEM';
  departmentId?: string;
  departmentName?: string;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  createdAt: string;
  expiresAt?: string;
  actionRequired?: string;
  aiGenerated?: boolean;
}

export interface HospitalState {
  organizationId: string;
  operatingMode: HospitalOperatingMode;
  modeChangedAt: string;
  modeChangedReason?: string;
  computedAt: string;
  totalPatientsActive: number;
  totalPatientsWaiting: number;
  totalTasksActive: number;
  totalTasksOverdue: number;
  totalTasksEscalated: number;
  taskCompletionRateLastHour: number;
  departments: DepartmentLoad[];
  resources: {
    doctorsOnDuty: number;
    doctorsAvailable: number;
    nursesOnDuty: number;
    nursesAvailable: number;
    bedsAvailable: number;
    bedsOccupied: number;
    bedsTotal: number;
    labCapacityPercentage: number;
    pharmacyQueueDepth: number;
    emergencyBedsAvailable: number;
  };
  journeyStageDistribution: Partial<Record<JourneyStage, number>>;
  activeEmergencies: number;
  emergencyEvents: EmergencyEvent[];
  activeAlerts: HospitalAlert[];
}

export type EmergencyType =
  | 'MASS_CASUALTY' | 'CARDIAC_ARREST' | 'TRAUMA' | 'RESPIRATORY'
  | 'STROKE' | 'OBSTETRIC' | 'PEDIATRIC' | 'CHEMICAL_EXPOSURE'
  | 'FIRE' | 'SURGE_CAPACITY' | 'CUSTOM';

export type EmergencySeverity = 'MINOR' | 'MODERATE' | 'MAJOR' | 'CATASTROPHIC';

export interface EmergencyEvent {
  id: string;
  organizationId: string;
  eventType: EmergencyType;
  severity: EmergencySeverity;
  title: string;
  description?: string;
  declaredBy: string;
  declaredByRole: UserRole;
  declaredAt: string;
  status: 'ACTIVE' | 'CONTAINED' | 'RESOLVED' | 'RECOVERY';
  resolvedAt?: string;
  resolvedBy?: string;
  assignedDoctors: string[];
  assignedNurses: string[];
  emergencyBedsActivated: number;
  labCapacityReserved: boolean;
  pharmacyAlerted: boolean;
  firstResponseAt?: string;
  responseTimeMinutes?: number;
  createdTaskIds: string[];
  timeline: Array<{
    timestamp: string;
    action: string;
    performedBy: string;
    notes?: string;
  }>;
  postEventReport?: string;
  createdAt: string;
}

export type ShiftType = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'CUSTOM';

export interface ShiftSchedule {
  id: string;
  organizationId: string;
  staffId: string;
  staffName: string;
  staffRole: UserRole;
  departmentId: string;
  departmentName: string;
  shiftType: ShiftType;
  shiftDate: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'ABSENT' | 'ON_LEAVE' | 'EMERGENCY_EXTENDED';
  checkInTime?: string;
  checkOutTime?: string;
  taskCapacity: number;
  tasksAssigned: number;
  tasksCompleted: number;
  overloaded: boolean;
  notes?: string;
  createdAt: string;
}

export interface StaffAvailability {
  staffId: string;
  staffName: string;
  staffRole: UserRole;
  departmentId: string;
  departmentName: string;
  isOnDuty: boolean;
  currentShiftId?: string;
  status: 'AVAILABLE' | 'BUSY' | 'ON_BREAK' | 'OVERLOADED' | 'IN_CONSULTATION' | 'OFF_DUTY' | 'EMERGENCY';
  currentTaskId?: string;
  currentTaskType?: TaskType;
  pendingTaskCount: number;
  overdueTaskCount: number;
  workloadScore: number;
  shiftEndsAt?: string;
  minutesUntilShiftEnd?: number;
  qualifications?: string[];
  specializations?: string[];
}

export interface ResourceCandidate {
  resourceId: string;
  resourceName: string;
  resourceType: 'STAFF' | 'BED' | 'ROOM' | 'EQUIPMENT';
  role?: UserRole;
  score: number;
  rank: number;
  isAvailable: boolean;
  reason: string;
  workloadScore?: number;
  distanceIndicator?: 'SAME_FLOOR' | 'DIFFERENT_FLOOR' | 'DIFFERENT_BUILDING';
  estimatedAvailableAt?: string;
}

export interface ResourceSearchResult {
  searchId: string;
  requirement: string;
  candidates: ResourceCandidate[];
  recommendedId?: string;
  recommendedReason?: string;
  searchedAt: string;
  noResultReason?: string;
}

export type WorkflowStepRole = UserRole | 'AUTO' | 'SYSTEM';

export interface WorkflowStep {
  stepIndex: number;
  stepName: string;
  taskType: TaskType;
  assignedRole: WorkflowStepRole;
  estimatedDurationMinutes: number;
  isOptional: boolean;
  dependsOnStepIndex?: number;
  location?: string;
  instructions?: string;
  escalationAfterMinutes?: number;
}

export interface WorkflowTemplate {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  clinicType?: string;
  journeyType: 'OPD' | 'EMERGENCY' | 'SPECIAL_CLINIC' | 'INPATIENT' | 'PROCEDURE';
  steps: WorkflowStep[];
  totalEstimatedMinutes: number;
  isActive: boolean;
  isDefault?: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EscalationRule {
  id: string;
  organizationId: string;
  name: string;
  taskType?: TaskType;
  departmentId?: string;
  priority: TaskPriority;
  levels: Array<{
    level: number;
    triggerAfterMinutes: number;
    notifyRole: UserRole;
    notifyUserId?: string;
    notifyName: string;
    message: string;
  }>;
  isActive: boolean;
  createdAt: string;
}

export type SlotCongestion = 'LOW' | 'MEDIUM' | 'HIGH' | 'FULL';

export interface AppointmentSlot {
  slotId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  congestion: SlotCongestion;
  expectedWaitMinutes: number;
  bookedCount: number;
  maxCapacity: number;
  isRecommended: boolean;
  recommendationReason?: string;
  congestionScore: number;
}

export type InsightCategory =
  | 'DEPARTMENT_LOAD' | 'BOTTLENECK' | 'RESOURCE_OPTIMIZATION'
  | 'INVENTORY_FORECAST' | 'PATIENT_JOURNEY' | 'SHIFT_PLANNING' | 'EMERGENCY_PREDICTION';

export type InsightUrgency = 'INFORMATIONAL' | 'RECOMMENDATION' | 'ACTION_REQUIRED' | 'URGENT';

export interface AvoraInsight {
  id: string;
  organizationId: string;
  category: InsightCategory;
  urgency: InsightUrgency;
  title: string;
  summary: string;
  detail?: string;
  recommendation?: string;
  affectedDepartment?: string;
  affectedResource?: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  generatedAt: string;
  expiresAt?: string;
  isAcknowledged: boolean;
  isActedUpon: boolean;
  aiModelUsed?: string;
  disclaimer: string;
}

export type OperationalEventType =
  | 'PATIENT_ARRIVED' | 'PATIENT_CHECKED_IN' | 'PATIENT_DISCHARGED'
  | 'APPOINTMENT_BOOKED' | 'APPOINTMENT_CANCELLED' | 'APPOINTMENT_COMPLETED'
  | 'DOCTOR_CHECKED_IN' | 'DOCTOR_UNAVAILABLE'
  | 'NURSE_SHIFT_START' | 'NURSE_TASK_COMPLETED'
  | 'LAB_ORDER_CREATED' | 'LAB_RESULT_READY'
  | 'PRESCRIPTION_CREATED' | 'PHARMACY_DISPENSED'
  | 'BED_OCCUPIED' | 'BED_RELEASED'
  | 'EMERGENCY_DECLARED' | 'EMERGENCY_RESOLVED'
  | 'TASK_CREATED' | 'TASK_COMPLETED' | 'TASK_OVERDUE' | 'TASK_ESCALATED'
  | 'ESCALATION_TRIGGERED' | 'MODE_CHANGED';

export interface OperationalEvent {
  id: string;
  organizationId: string;
  eventType: OperationalEventType;
  payload: Record<string, any>;
  triggeredBy?: string;
  triggeredByRole?: UserRole;
  departmentId?: string;
  patientId?: string;
  taskId?: string;
  timestamp: string;
  processed: boolean;
  processedAt?: string;
}

