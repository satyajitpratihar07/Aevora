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
