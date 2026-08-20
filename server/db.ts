import {
  Organization,
  User,
  Department,
  Patient,
  VitalSign,
  Appointment,
  Prescription,
  LabTest,
  LabOrder,
  Medicine,
  InventoryItem,
  Invoice,
  WardBed,
  Admission,
  Notification,
  AuditLog,
} from '../src/types/index.js';

// Central in-memory multi-tenant relational store
export interface DatabaseSchema {
  organizations: Organization[];
  users: User[];
  departments: Department[];
  patients: Patient[];
  vitals: VitalSign[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  labTests: LabTest[];
  labOrders: LabOrder[];
  medicines: Medicine[];
  inventory: InventoryItem[];
  invoices: Invoice[];
  beds: WardBed[];
  admissions: Admission[];
  notifications: Notification[];
  auditLogs: AuditLog[];
}

const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-apex-01',
    name: 'Apex Apollo Super-Specialty Hospital',
    code: 'APEX-HMS',
    type: 'HOSPITAL',
    logoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=128&auto=format&fit=crop&q=80',
    brandColor: '#0284c7', // Sky Blue
    secondaryColor: '#0369a1',
    address: '742 MG Road, Bandra West',
    city: 'Mumbai',
    state: 'MH',
    country: 'India',
    postalCode: '400050',
    phone: '+91 98200 12345',
    email: 'admin@apexapollo.in',
    website: 'https://apexapollo.in',
    currency: 'INR',
    timezone: 'AmeriMH/Los_Angeles',
    taxRate: 7.5,
    subscriptionPlan: 'ENTERPRISE',
    subscriptionStatus: 'ACTIVE',
    patientLimit: 10000,
    staffLimit: 500,
    aiUsageThisMonth: 1420,
    aiUsageLimit: 10000,
    createdAt: '2025-01-10T08:00:00Z',
  },
  {
    id: 'org-stjude-02',
    name: 'St. Jude Max MHre Clinic & Family Health',
    code: 'STJUDE-MED',
    type: 'CLINIC',
    brandColor: '#059669', // Emerald Green
    secondaryColor: '#047857',
    address: '108 Outer Ring Road, Indiranagar',
    city: 'Bengaluru',
    state: 'MH',
    country: 'India',
    postalCode: '560038',
    phone: '+91 98765 43210',
    email: 'contact@stjudemax.in',
    website: 'https://stjudeclinic.org',
    currency: 'INR',
    timezone: 'AmeriMH/Los_Angeles',
    taxRate: 6.0,
    subscriptionPlan: 'PROFESSIONAL',
    subscriptionStatus: 'ACTIVE',
    patientLimit: 2500,
    staffLimit: 50,
    aiUsageThisMonth: 410,
    aiUsageLimit: 2500,
    createdAt: '2025-02-01T09:30:00Z',
  },
  {
    id: 'org-nova-03',
    name: 'Nova BioDiagnostics & Diagnostics Centre',
    code: 'NOVA-LABS',
    type: 'DIAGNOSTIC_CENTER',
    brandColor: '#7c3aed', // Purple Violet
    secondaryColor: '#6d28d9',
    address: '45 Connaught Place',
    city: 'New Delhi',
    state: 'MH',
    country: 'India',
    postalCode: '110001',
    phone: '+91 91234 56789',
    email: 'info@novabiodiagnostics.com',
    website: 'https://novabiodiagnostics.com',
    currency: 'INR',
    timezone: 'AmeriMH/Los_Angeles',
    taxRate: 8.0,
    subscriptionPlan: 'STARTER',
    subscriptionStatus: 'TRIAL',
    patientLimit: 1000,
    staffLimit: 20,
    aiUsageThisMonth: 120,
    aiUsageLimit: 1000,
    createdAt: '2025-03-15T11:00:00Z',
  },
];

const INITIAL_USERS: User[] = [
  // Super Admin (Platform level)
  {
    id: 'user-super-01',
    organizationId: 'org-apex-01',
    email: 'superadmin@pulsecloud.io',
    name: 'Ananya Deshmukh',
    role: 'SUPER_ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
    phone: '+91 98100 12345',
    status: 'ACTIVE',
    permissions: [
      'PATIENT_VIEW', 'PATIENT_CREATE', 'PATIENT_UPDATE', 'PATIENT_DELETE',
      'APPOINTMENT_VIEW', 'APPOINTMENT_CREATE', 'APPOINTMENT_UPDATE',
      'PRESCRIPTION_VIEW', 'PRESCRIPTION_CREATE',
      'LAB_VIEW', 'LAB_CREATE', 'LAB_UPDATE',
      'BILLING_VIEW', 'BILLING_CREATE',
      'INVENTORY_VIEW', 'INVENTORY_MANAGE',
      'STAFF_MANAGE', 'ADMISSION_MANAGE',
      'REPORT_VIEW', 'SETTINGS_MANAGE', 'AUDIT_VIEW', 'SUPER_ADMIN_ACCESS',
    ],
  },
  // Apex Hospital Admin
  {
    id: 'user-admin-01',
    organizationId: 'org-apex-01',
    email: 'admin@apexapollo.in',
    name: 'Dr. Rajesh Sharma',
    role: 'HOSPITAL_ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&auto=format&fit=crop&q=80',
    phone: '+91 98200 12346',
    status: 'ACTIVE',
    permissions: [
      'PATIENT_VIEW', 'PATIENT_CREATE', 'PATIENT_UPDATE', 'PATIENT_DELETE',
      'APPOINTMENT_VIEW', 'APPOINTMENT_CREATE', 'APPOINTMENT_UPDATE',
      'PRESCRIPTION_VIEW', 'PRESCRIPTION_CREATE',
      'LAB_VIEW', 'LAB_CREATE', 'LAB_UPDATE',
      'BILLING_VIEW', 'BILLING_CREATE',
      'INVENTORY_VIEW', 'INVENTORY_MANAGE',
      'STAFF_MANAGE', 'ADMISSION_MANAGE',
      'REPORT_VIEW', 'SETTINGS_MANAGE', 'AUDIT_VIEW',
    ],
  },
  // Apex Doctor (MHrdiologist)
  {
    id: 'user-doc-01',
    organizationId: 'org-apex-01',
    email: 'dr.chen@apexmemorial.org',
    name: 'Dr. Vikramaditya Singh, MD (AIIMS)',
    role: 'DOCTOR',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=128&auto=format&fit=crop&q=80',
    phone: '+91 98200 12347',
    departmentId: 'dept-MHrdio-01',
    specialization: 'Interventional MHrdiology & Electrophysiology',
    licenseNumber: 'MD-MH-88921',
    status: 'ACTIVE',
    permissions: [
      'PATIENT_VIEW', 'PATIENT_CREATE', 'PATIENT_UPDATE',
      'APPOINTMENT_VIEW', 'APPOINTMENT_UPDATE',
      'PRESCRIPTION_VIEW', 'PRESCRIPTION_CREATE',
      'LAB_VIEW', 'LAB_CREATE',
      'REPORT_VIEW',
    ],
  },
  // Apex Doctor (Neurologist)
  {
    id: 'user-doc-02',
    organizationId: 'org-apex-01',
    email: 'dr.sophia@apexmemorial.org',
    name: 'Dr. Priya Patel, MD (DM Neuro)',
    role: 'DOCTOR',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813570-5880b91d24c0?w=128&auto=format&fit=crop&q=80',
    phone: '+91 98200 12348',
    departmentId: 'dept-neuro-02',
    specialization: 'Neurology & Stroke Management',
    licenseNumber: 'MD-MH-74512',
    status: 'ACTIVE',
    permissions: [
      'PATIENT_VIEW', 'PATIENT_CREATE', 'PATIENT_UPDATE',
      'APPOINTMENT_VIEW', 'APPOINTMENT_UPDATE',
      'PRESCRIPTION_VIEW', 'PRESCRIPTION_CREATE',
      'LAB_VIEW', 'LAB_CREATE',
      'REPORT_VIEW',
    ],
  },
  // Apex Nurse
  {
    id: 'user-nurse-01',
    organizationId: 'org-apex-01',
    email: 'nurse.sarah@apexmemorial.org',
    name: 'Sunita Sharma, RN',
    role: 'NURSE',
    avatarUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=128&auto=format&fit=crop&q=80',
    phone: '+91 98200 12349',
    departmentId: 'dept-er-04',
    licenseNumber: 'RN-MH-44910',
    status: 'ACTIVE',
    permissions: [
      'PATIENT_VIEW', 'PATIENT_UPDATE',
      'APPOINTMENT_VIEW',
      'ADMISSION_MANAGE',
      'LAB_VIEW',
    ],
  },
  // Apex Pharmacist
  {
    id: 'user-pharm-01',
    organizationId: 'org-apex-01',
    email: 'pharm.david@apexmemorial.org',
    name: 'Suresh Kumar, B.Pharm',
    role: 'PHARMACIST',
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=128&auto=format&fit=crop&q=80',
    phone: '+91 98200 12350',
    licenseNumber: 'RPH-MH-60312',
    status: 'ACTIVE',
    permissions: [
      'PRESCRIPTION_VIEW',
      'INVENTORY_VIEW', 'INVENTORY_MANAGE',
      'BILLING_VIEW',
    ],
  },
  // Apex Lab Tech
  {
    id: 'user-lab-01',
    organizationId: 'org-apex-01',
    email: 'lab.priya@apexmemorial.org',
    name: 'Kavitha Nair, M.Sc (Lab Tech)',
    role: 'LAB_TECH',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&auto=format&fit=crop&q=80',
    phone: '+91 98200 12351',
    departmentId: 'dept-path-05',
    licenseNumber: 'MLS-MH-99214',
    status: 'ACTIVE',
    permissions: [
      'LAB_VIEW', 'LAB_CREATE', 'LAB_UPDATE',
      'PATIENT_VIEW',
    ],
  },
  // Apex Accountant
  {
    id: 'user-acc-01',
    organizationId: 'org-apex-01',
    email: 'billing.robert@apexmemorial.org',
    name: 'Amitabh Verma, CA',
    role: 'ACCOUNTANT',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&auto=format&fit=crop&q=80',
    phone: '+91 98200 12352',
    status: 'ACTIVE',
    permissions: [
      'BILLING_VIEW', 'BILLING_CREATE',
      'PATIENT_VIEW',
      'REPORT_VIEW',
    ],
  },
  // Patient User
  {
    id: 'user-pat-01',
    organizationId: 'org-apex-01',
    email: 'james.wilson@patient.me',
    name: 'Aarav Sharma',
    role: 'PATIENT',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&auto=format&fit=crop&q=80',
    phone: '+91 99887 76655',
    status: 'ACTIVE',
    permissions: ['PATIENT_VIEW', 'APPOINTMENT_VIEW', 'PRESCRIPTION_VIEW', 'LAB_VIEW', 'BILLING_VIEW'],
  },
];

const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-MHrdio-01',
    organizationId: 'org-apex-01',
    name: 'MHrdiology & Heart Center',
    code: 'MHRD',
    description: 'Comprehensive non-invasive & interventional MHrdiovascular MHre and electrophysiology.',
    headDoctorId: 'user-doc-01',
    headDoctorName: 'Dr. Vikramaditya Singh, MD (AIIMS)',
    floor: 'Floor 3, East Wing',
    totalBeds: 40,
    availableBeds: 12,
    activeDoctorsCount: 8,
  },
  {
    id: 'dept-neuro-02',
    organizationId: 'org-apex-01',
    name: 'Neurology & Brain Sciences',
    code: 'NEUR',
    description: 'Advanced diagnosis and treatment for neurologiMHl disorders, stroke, and spinal health.',
    headDoctorId: 'user-doc-02',
    headDoctorName: 'Dr. Priya Patel, MD (DM Neuro)',
    floor: 'Floor 4, West Wing',
    totalBeds: 30,
    availableBeds: 7,
    activeDoctorsCount: 6,
  },
  {
    id: 'dept-ortho-03',
    organizationId: 'org-apex-01',
    name: 'Orthopedics & Joint Reconstruction',
    code: 'ORTH',
    description: 'Musculoskeletal trauma, arthroplasty, sports medicine, and rehabilitation.',
    floor: 'Floor 2, Central Wing',
    totalBeds: 35,
    availableBeds: 14,
    activeDoctorsCount: 5,
  },
  {
    id: 'dept-er-04',
    organizationId: 'org-apex-01',
    name: 'Emergency & Trauma Center (Level 1)',
    code: 'EMRG',
    description: '24/7 rapid response trauma resuscitation, acute mediMHl emergencies, and triage.',
    floor: 'Ground Floor, North Gate',
    totalBeds: 25,
    availableBeds: 4,
    activeDoctorsCount: 12,
  },
  {
    id: 'dept-path-05',
    organizationId: 'org-apex-01',
    name: 'Pathology & Diagnostic Laboratory',
    code: 'PATH',
    description: 'Automated clinical biochemistry, hematology, molecular diagnostics, and histopathology.',
    floor: 'Basement 1, Diagnostic Core',
    totalBeds: 0,
    availableBeds: 0,
    activeDoctorsCount: 4,
  },
];

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-001',
    organizationId: 'org-apex-01',
    patientIdNumber: 'PAT-2026-0042',
    name: 'Aarav Sharma',
    gender: 'MALE',
    dob: '1978-05-14',
    age: 48,
    bloodGroup: 'O+',
    phone: '+91 99887 76655',
    email: 'james.wilson@patient.me',
    address: '412 Elmhurst Lane, Mumbai, MH 400050',
    emergencyContact: {
      name: 'Kavita Sharma',
      relationship: 'Spouse',
      phone: '+91 99887 76656',
    },
    insurance: {
      provider: 'Star Health Comprehensive Insurance',
      policyNumber: 'BCBS-9941208',
      coverageLimit: 100000,
      validUntil: '2027-12-31',
    },
    allergies: ['Penicillin', 'Sulfa Drugs'],
    chronicConditions: ['Essential Hypertension (Grade II)', 'Type 2 Diabetes Mellitus'],
    currentMedications: ['Amlodipine 5mg OD', 'Metformin 500mg BD'],
    registeredDate: '2025-06-12',
    lastVisitDate: '2026-08-18',
    status: 'OUTPATIENT',
    assignedDoctorId: 'user-doc-01',
    assignedDoctorName: 'Dr. Vikramaditya Singh, MD (AIIMS)',
  },
  {
    id: 'pat-002',
    organizationId: 'org-apex-01',
    patientIdNumber: 'PAT-2026-0078',
    name: 'Ananya Iyer',
    gender: 'FEMALE',
    dob: '1989-11-23',
    age: 36,
    bloodGroup: 'A+',
    phone: '+91 98765 11223',
    email: 'elena.rostova@gmail.com',
    address: '89 Maple Crest Avenue, Apt 4B, Mumbai, MH',
    emergencyContact: {
      name: 'Raman Iyer',
      relationship: 'Brother',
      phone: '+91 98765 11224',
    },
    insurance: {
      provider: 'HDFC ERGO Optima Secure',
      policyNumber: 'AET-481902',
      coverageLimit: 75000,
      validUntil: '2027-06-30',
    },
    allergies: ['Latex', 'NSAIDs (Ibuprofen)'],
    chronicConditions: ['Migraine with Aura', 'Mild Asthma'],
    currentMedications: ['Sumatriptan 50mg PRN', 'Salbutamol Inhaler PRN'],
    registeredDate: '2025-09-20',
    lastVisitDate: '2026-08-19',
    status: 'INPATIENT',
    assignedDoctorId: 'user-doc-02',
    assignedDoctorName: 'Dr. Priya Patel, MD (DM Neuro)',
    currentWardBed: 'ICU-B03',
  },
  {
    id: 'pat-003',
    organizationId: 'org-apex-01',
    patientIdNumber: 'PAT-2026-0112',
    name: 'Rohan Mehta',
    gender: 'MALE',
    dob: '1964-03-08',
    age: 62,
    bloodGroup: 'B+',
    phone: '+91 91234 88776',
    email: 'm.chang@pacbell.net',
    address: '1504 Sunset Ridge Road, Mumbai, MH',
    emergencyContact: {
      name: 'Neha Mehta',
      relationship: 'Daughter',
      phone: '+91 91234 88777',
    },
    allergies: ['Shellfish'],
    chronicConditions: ['Coronary Artery Disease', 'Dyslipidemia'],
    currentMedications: ['Atorvastatin 40mg HS', 'Aspirin 81mg OD'],
    registeredDate: '2026-01-15',
    lastVisitDate: '2026-08-15',
    status: 'OUTPATIENT',
    assignedDoctorId: 'user-doc-01',
    assignedDoctorName: 'Dr. Vikramaditya Singh, MD (AIIMS)',
  },
  {
    id: 'pat-004',
    organizationId: 'org-apex-01',
    patientIdNumber: 'PAT-2026-0155',
    name: 'Pooja Reddy',
    gender: 'FEMALE',
    dob: '1995-08-17',
    age: 31,
    bloodGroup: 'AB-',
    phone: '+1 (555) 441-2098',
    email: 'amina.mansoor@techhealth.io',
    address: '220 Silicon Valley Way, New Delhi, MH',
    emergencyContact: {
      name: 'Tariq Mansoor',
      relationship: 'Father',
      phone: '+1 (555) 441-2099',
    },
    allergies: [],
    chronicConditions: ['Hypothyroidism'],
    currentMedications: ['Levothyroxine 75mcg OD'],
    registeredDate: '2026-04-10',
    lastVisitDate: '2026-08-10',
    status: 'OUTPATIENT',
    assignedDoctorId: 'user-doc-01',
    assignedDoctorName: 'Dr. Vikramaditya Singh, MD (AIIMS)',
  },
];

const INITIAL_VITALS: VitalSign[] = [
  {
    id: 'vit-001',
    patientId: 'pat-001',
    organizationId: 'org-apex-01',
    recordedAt: '2026-08-18T10:30:00Z',
    recordedBy: 'Sarah Jenkins, RN',
    systolicBp: 138,
    diastolicBp: 88,
    heartRate: 74,
    temperatureC: 36.8,
    respiratoryRate: 16,
    oxygenSaturation: 98,
    bloodSugar: 126,
    weightKg: 82.5,
    heightCm: 178,
    bmi: 26.0,
    notes: 'Patient reports mild morning fatigue; adherence to amlodipine verified.',
  },
  {
    id: 'vit-002',
    patientId: 'pat-002',
    organizationId: 'org-apex-01',
    recordedAt: '2026-08-19T06:45:00Z',
    recordedBy: 'Sarah Jenkins, RN',
    systolicBp: 118,
    diastolicBp: 76,
    heartRate: 88,
    temperatureC: 38.2,
    respiratoryRate: 20,
    oxygenSaturation: 97,
    weightKg: 58.0,
    heightCm: 165,
    bmi: 21.3,
    notes: 'Elevated temperature post-admission; blood culture samples drawn.',
  },
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-001',
    organizationId: 'org-apex-01',
    appointmentNumber: 'APT-2026-0819-01',
    patientId: 'pat-001',
    patientName: 'Aarav Sharma',
    patientPhone: '+91 99887 76655',
    doctorId: 'user-doc-01',
    doctorName: 'Dr. Vikramaditya Singh, MD (AIIMS)',
    doctorSpecialty: 'MHrdiology',
    departmentId: 'dept-MHrdio-01',
    departmentName: 'MHrdiology & Heart Center',
    date: '2026-08-19',
    timeSlot: '09:00 AM - 09:30 AM',
    type: 'FOLLOW_UP',
    status: 'IN_CONSULTATION',
    queueNumber: 1,
    qrCheckInToken: 'qr-tok-apt001-sec782',
    symptoms: 'Mild exertional chest tightness during morning walk, ocMHsional palpitations.',
    notes: 'Review recent lipid profile and Holter monitor telemetry report.',
    consultationFee: 150,
    isPaid: true,
    createdAt: '2026-08-15T14:20:00Z',
  },
  {
    id: 'apt-002',
    organizationId: 'org-apex-01',
    appointmentNumber: 'APT-2026-0819-02',
    patientId: 'pat-003',
    patientName: 'Rohan Mehta',
    patientPhone: '+91 91234 88776',
    doctorId: 'user-doc-01',
    doctorName: 'Dr. Vikramaditya Singh, MD (AIIMS)',
    doctorSpecialty: 'MHrdiology',
    departmentId: 'dept-MHrdio-01',
    departmentName: 'MHrdiology & Heart Center',
    date: '2026-08-19',
    timeSlot: '09:30 AM - 10:00 AM',
    type: 'SPECIALIST_CONSULT',
    status: 'CHECKED_IN',
    queueNumber: 2,
    qrCheckInToken: 'qr-tok-apt002-sec991',
    symptoms: 'Routine 6-month coronary artery disease check-up, ECG review.',
    consultationFee: 150,
    isPaid: true,
    createdAt: '2026-08-16T10:00:00Z',
  },
  {
    id: 'apt-003',
    organizationId: 'org-apex-01',
    appointmentNumber: 'APT-2026-0819-03',
    patientId: 'pat-004',
    patientName: 'Pooja Reddy',
    patientPhone: '+1 (555) 441-2098',
    doctorId: 'user-doc-02',
    doctorName: 'Dr. Priya Patel, MD (DM Neuro)',
    doctorSpecialty: 'Neurology',
    departmentId: 'dept-neuro-02',
    departmentName: 'Neurology & Brain Sciences',
    date: '2026-08-19',
    timeSlot: '10:30 AM - 11:00 AM',
    type: 'GENERAL_CHECKUP',
    status: 'CONFIRMED',
    queueNumber: 3,
    qrCheckInToken: 'qr-tok-apt003-sec344',
    symptoms: 'Recurring unilateral throbbing headache with photophobia and nausea.',
    consultationFee: 175,
    isPaid: false,
    createdAt: '2026-08-17T11:45:00Z',
  },
];

const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx-001',
    organizationId: 'org-apex-01',
    prescriptionNumber: 'RX-2026-00891',
    patientId: 'pat-001',
    patientName: 'Aarav Sharma',
    patientAge: 48,
    patientGender: 'Male',
    doctorId: 'user-doc-01',
    doctorName: 'Dr. Vikramaditya Singh, MD (AIIMS)',
    doctorSpecialty: 'MHrdiology',
    doctorLicense: 'MD-MH-88921',
    appointmentId: 'apt-001',
    date: '2026-08-19',
    diagnosis: 'Stage 2 Hypertension with Exertional Angina Equivalents',
    chiefComplaints: ['Exertional retrosternal discomfort', 'Blood pressure spike to 142/90'],
    clinicalObservations: 'S1/S2 audible, no peripheral edema. Lungs clear to auscultation bilaterally.',
    vitalsSummary: {
      bp: '138/88 mmHg',
      pulse: '74 bpm',
      temp: '36.8 °C',
      spo2: '98%',
    },
    items: [
      {
        id: 'rxi-001',
        medicineId: 'med-001',
        medicineName: 'Amlodipine Besylate',
        genericName: 'Amlodipine',
        dosage: '10 mg',
        frequency: '1-0-0 (Once daily morning)',
        duration: '30 Days',
        route: 'ORAL',
        instructions: 'Take 30 mins before breakfast with water. Monitor BP regularly.',
        isAiSuggested: true,
      },
      {
        id: 'rxi-002',
        medicineId: 'med-002',
        medicineName: 'Atorvastatin MHlcium',
        genericName: 'Atorvastatin',
        dosage: '20 mg',
        frequency: '0-0-1 (Once daily at bedtime)',
        duration: '30 Days',
        route: 'ORAL',
        instructions: 'Take after dinner at bedtime.',
        isAiSuggested: false,
      },
      {
        id: 'rxi-003',
        medicineId: 'med-003',
        medicineName: 'Nitroglycerin Sublingual',
        genericName: 'Nitroglycerin',
        dosage: '0.4 mg',
        frequency: 'PRN (As needed for chest pain)',
        duration: '14 Days',
        route: 'ORAL',
        instructions: 'Place under tongue if acute chest pain occurs; repeat in 5 min if pain persists up to 3 doses.',
        isAiSuggested: true,
      },
    ],
    advisedTests: ['Lipid Profile Advanced Panel', '2D EchoMHrdiogram with Doppler', 'Serum Electrolytes'],
    followUpDays: 14,
    followUpDate: '2026-09-02',
    doctorNotes: 'Maintain low-sodium DASH diet. Avoid strenuous unmonitored MHrdiovascular exertion.',
    aiAssisted: true,
    aiModelUsed: 'gemini-3.7-flash',
    aiPromptSummary: 'Hypertension optimization with exertional angina symptom triage and allergy guardrails (Penicillin/Sulfa safe).',
    clinicianVerified: true,
    clinicianVerifiedAt: '2026-08-19T09:22:00Z',
    status: 'FINALIZED',
    digitalSignatureHash: 'SHA256:88921a-e89c47-verified-dr-arthur-chen-MHrdio',
    createdAt: '2026-08-19T09:20:00Z',
  },
];

const INITIAL_LAB_TESTS: LabTest[] = [
  {
    id: 'lab-t-001',
    organizationId: 'org-apex-01',
    code: 'CBC-01',
    name: 'Complete Blood Count (CBC) with Differential',
    category: 'HEMATOLOGY',
    sampleType: 'BLOOD',
    price: 45,
    turnaroundHours: 4,
    referenceRange: 'WBC: 4.5-11.0, Hb: 13.5-17.5 g/dL',
    unit: 'Multi-parameter',
    description: 'Quantitative cellular analysis of red cells, white cell differential, and platelet count.',
  },
  {
    id: 'lab-t-002',
    organizationId: 'org-apex-01',
    code: 'LIPID-02',
    name: 'Lipid Profile Comprehensive Panel',
    category: 'BIOCHEMISTRY',
    sampleType: 'SERUM',
    price: 65,
    turnaroundHours: 6,
    referenceRange: 'Total Chol: <200 mg/dL, LDL: <100 mg/dL, HDL: >40 mg/dL',
    unit: 'mg/dL',
    description: 'Assessment of MHrdiovascular atherosclerotic risk metrics.',
  },
  {
    id: 'lab-t-003',
    organizationId: 'org-apex-01',
    code: 'TROP-03',
    name: 'High-Sensitivity MHrdiac Troponin I (hs-cTnI)',
    category: 'CARDIOLOGY',
    sampleType: 'SERUM',
    price: 90,
    turnaroundHours: 1,
    referenceRange: '< 0.04 ng/mL (Normal)',
    unit: 'ng/mL',
    description: 'Urgent quantitative biomarker for myoMHrdial injury and acute coronary syndrome.',
    normalMax: 0.04,
  },
  {
    id: 'lab-t-004',
    organizationId: 'org-apex-01',
    code: 'HBA1C-04',
    name: 'GlyMHted Hemoglobin (HbA1c)',
    category: 'BIOCHEMISTRY',
    sampleType: 'BLOOD',
    price: 50,
    turnaroundHours: 8,
    referenceRange: '< 5.7% Normal, 5.7-6.4% Prediabetes, ≥6.5% Diabetes',
    unit: '%',
    description: 'Three-month average blood glucose control indiMHtor.',
  },
  {
    id: 'lab-t-005',
    organizationId: 'org-apex-01',
    code: 'CXR-05',
    name: 'Digital Chest Radiography (X-Ray PA View)',
    category: 'RADIOLOGY',
    sampleType: 'IMAGING',
    price: 110,
    turnaroundHours: 2,
    referenceRange: 'Clear lung fields, normal MHrdiothoracic ratio (<0.5)',
    unit: 'Visual Report',
    description: 'High-resolution thoracic radiology for pulmonary and MHrdiac sizing evaluation.',
  },
];

const INITIAL_LAB_ORDERS: LabOrder[] = [
  {
    id: 'lbo-001',
    organizationId: 'org-apex-01',
    orderNumber: 'LBO-2026-00492',
    patientId: 'pat-001',
    patientName: 'Aarav Sharma',
    doctorId: 'user-doc-01',
    doctorName: 'Dr. Vikramaditya Singh, MD (AIIMS)',
    testId: 'lab-t-002',
    testName: 'Lipid Profile Comprehensive Panel',
    testCategory: 'BIOCHEMISTRY',
    sampleType: 'SERUM',
    priority: 'ROUTINE',
    status: 'VERIFIED',
    sampleCollectedAt: '2026-08-18T08:15:00Z',
    sampleCollectedBy: 'Priya Sharma, MLS',
    results: [
      { name: 'Total Cholesterol', value: '215', numericValue: 215, unit: 'mg/dL', referenceRange: '< 200 mg/dL', flag: 'HIGH' },
      { name: 'Triglycerides', value: '185', numericValue: 185, unit: 'mg/dL', referenceRange: '< 150 mg/dL', flag: 'HIGH' },
      { name: 'HDL Cholesterol (Good)', value: '42', numericValue: 42, unit: 'mg/dL', referenceRange: '> 40 mg/dL', flag: 'NORMAL' },
      { name: 'LDL Cholesterol (Bad)', value: '136', numericValue: 136, unit: 'mg/dL', referenceRange: '< 100 mg/dL', flag: 'HIGH' },
      { name: 'VLDL Cholesterol', value: '37', numericValue: 37, unit: 'mg/dL', referenceRange: '< 30 mg/dL', flag: 'HIGH' },
    ],
    clinicalInterpretation: 'Moderate mixed hyperlipidemia. Statin therapy dosage titration recommended.',
    technicianNotes: 'Fasting specimen verified (12-hour fast). No hemolysis detected in serum.',
    verifiedBy: 'Kavitha Nair, M.Sc (Lab Tech)',
    verifiedAt: '2026-08-18T13:40:00Z',
    orderedAt: '2026-08-17T15:00:00Z',
    cost: 65,
    isPaid: true,
  },
  {
    id: 'lbo-002',
    organizationId: 'org-apex-01',
    orderNumber: 'LBO-2026-00501',
    patientId: 'pat-002',
    patientName: 'Ananya Iyer',
    doctorId: 'user-doc-02',
    doctorName: 'Dr. Priya Patel, MD (DM Neuro)',
    testId: 'lab-t-003',
    testName: 'High-Sensitivity MHrdiac Troponin I (hs-cTnI)',
    testCategory: 'CARDIOLOGY',
    sampleType: 'SERUM',
    priority: 'STAT_EMERGENCY',
    status: 'RESULT_ENTERED',
    sampleCollectedAt: '2026-08-19T07:10:00Z',
    sampleCollectedBy: 'Sarah Jenkins, RN',
    results: [
      { name: 'hs-cTnI Level', value: '0.015', numericValue: 0.015, unit: 'ng/mL', referenceRange: '< 0.040 ng/mL', flag: 'NORMAL' },
    ],
    clinicalInterpretation: 'Negative for acute myoMHrdial necrosis. Serial sampling in 3 hours per chest pain protocol.',
    technicianNotes: 'STAT emergency queue expedited. MHlibration checked at 06:00.',
    orderedAt: '2026-08-19T07:00:00Z',
    cost: 90,
    isPaid: true,
  },
];

const INITIAL_MEDICINES: Medicine[] = [
  {
    id: 'med-001',
    organizationId: 'org-apex-01',
    name: 'Norvasc 10mg',
    genericName: 'Amlodipine Besylate',
    sku: 'MED-AML-10',
    category: 'ANTIHYPERTENSIVE',
    dosageForm: 'TABLET',
    strength: '10 mg',
    manufacturer: 'Pfizer Inc.',
    currentStock: 1450,
    reorderLevel: 300,
    purchasePrice: 0.35,
    sellingPrice: 0.95,
    batchNumber: 'BT-AML-9902',
    expiryDate: '2027-09-30',
    locationRack: 'Rack A-04',
    status: 'IN_STOCK',
  },
  {
    id: 'med-002',
    organizationId: 'org-apex-01',
    name: 'Lipitor 20mg',
    genericName: 'Atorvastatin MHlcium',
    sku: 'MED-ATV-20',
    category: 'ANTIHYPERTENSIVE',
    dosageForm: 'TABLET',
    strength: '20 mg',
    manufacturer: 'Viatris',
    currentStock: 820,
    reorderLevel: 250,
    purchasePrice: 0.45,
    sellingPrice: 1.20,
    batchNumber: 'BT-ATV-4412',
    expiryDate: '2027-11-15',
    locationRack: 'Rack A-05',
    status: 'IN_STOCK',
  },
  {
    id: 'med-003',
    organizationId: 'org-apex-01',
    name: 'Nitrostat 0.4mg SL',
    genericName: 'Nitroglycerin',
    sku: 'MED-NTG-04',
    category: 'ANTIHYPERTENSIVE',
    dosageForm: 'TABLET',
    strength: '0.4 mg',
    manufacturer: 'Parke-Davis',
    currentStock: 45,
    reorderLevel: 100,
    purchasePrice: 1.10,
    sellingPrice: 2.75,
    batchNumber: 'BT-NTG-2201',
    expiryDate: '2026-10-31', // Expiring relatively soon
    locationRack: 'Rack C-01 (Secure)',
    status: 'LOW_STOCK',
  },
  {
    id: 'med-004',
    organizationId: 'org-apex-01',
    name: 'Glucophage 500mg',
    genericName: 'Metformin Hydrochloride',
    sku: 'MED-MET-500',
    category: 'ANTIDIABETIC',
    dosageForm: 'TABLET',
    strength: '500 mg',
    manufacturer: 'Merck HealthMHre',
    currentStock: 2100,
    reorderLevel: 500,
    purchasePrice: 0.15,
    sellingPrice: 0.50,
    batchNumber: 'BT-MET-8890',
    expiryDate: '2028-02-28',
    locationRack: 'Rack B-02',
    status: 'IN_STOCK',
  },
  {
    id: 'med-005',
    organizationId: 'org-apex-01',
    name: 'Augmentin 625mg',
    genericName: 'Amoxicillin + Clavulanic Acid',
    sku: 'MED-AUG-625',
    category: 'ANTIBIOTIC',
    dosageForm: 'TABLET',
    strength: '625 mg',
    manufacturer: 'GlaxoSmithKline',
    currentStock: 180,
    reorderLevel: 200,
    purchasePrice: 0.85,
    sellingPrice: 2.10,
    batchNumber: 'BT-AUG-1108',
    expiryDate: '2027-04-30',
    locationRack: 'Rack D-03',
    status: 'LOW_STOCK',
  },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-001',
    organizationId: 'org-apex-01',
    itemCode: 'SURG-GLV-M',
    name: 'Sterile Powder-Free SurgiMHl Gloves (Size 7.5)',
    category: 'SURGICAL',
    unitOfMeasure: 'Box of 100',
    quantityOnHand: 340,
    minReorderLevel: 80,
    unitCost: 28.50,
    supplierName: 'MedTech SurgiMHl Global',
    location: 'Central Store - Bay 1',
    lastRestockedDate: '2026-08-01',
    status: 'ADEQUATE',
  },
  {
    id: 'inv-002',
    organizationId: 'org-apex-01',
    itemCode: 'CON-IV-20G',
    name: 'Safety IV MHnnula 20G with Injection Port',
    category: 'CONSUMABLE',
    unitOfMeasure: 'Pack of 50',
    quantityOnHand: 45,
    minReorderLevel: 100,
    unitCost: 18.00,
    supplierName: 'Becton Dickinson Direct',
    location: 'Central Store - Bay 3',
    lastRestockedDate: '2026-07-15',
    status: 'LOW_STOCK',
  },
  {
    id: 'inv-003',
    organizationId: 'org-apex-01',
    itemCode: 'LAB-VAC-SST',
    name: 'BD Vacutainer Gold Top Gel SST Tubes (5mL)',
    category: 'LAB_REAGENT',
    unitOfMeasure: 'Pack of 100',
    quantityOnHand: 520,
    minReorderLevel: 150,
    unitCost: 32.00,
    supplierName: 'LabCorp Supply Services',
    location: 'Lab Store - Cold Rack 2',
    lastRestockedDate: '2026-08-10',
    status: 'ADEQUATE',
  },
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    organizationId: 'org-apex-01',
    invoiceNumber: 'INV-2026-00912',
    patientId: 'pat-001',
    patientName: 'Aarav Sharma',
    patientPhone: '+91 99887 76655',
    date: '2026-08-19',
    dueDate: '2026-09-02',
    items: [
      { id: 'ii-01', description: 'Specialist MHrdiology Consultation (Dr. Arthur Chen)', category: 'CONSULTATION', quantity: 1, unitPrice: 150, total: 150 },
      { id: 'ii-02', description: 'Lipid Profile Comprehensive Panel', category: 'LAB_TEST', quantity: 1, unitPrice: 65, total: 65 },
      { id: 'ii-03', description: 'Pharmacy Prescription: Norvasc 10mg (30 Tabs)', category: 'PHARMACY', quantity: 1, unitPrice: 28.50, total: 28.50 },
      { id: 'ii-04', description: 'Pharmacy Prescription: Atorvastatin 20mg (30 Tabs)', category: 'PHARMACY', quantity: 1, unitPrice: 36.00, total: 36.00 },
    ],
    subtotal: 279.50,
    taxAmount: 20.96,
    discountAmount: 15.00,
    totalAmount: 285.46,
    paidAmount: 285.46,
    balanceDue: 0.00,
    status: 'PAID',
    paymentMethod: 'CREDIT_MHRD',
    paymentTransactions: [
      {
        id: 'pt-001',
        amount: 285.46,
        date: '2026-08-19T09:45:00Z',
        method: 'CREDIT_MHRD',
        reference: 'VISA-AUTH-991204',
        receivedBy: 'Amitabh Verma, CA',
      },
    ],
  },
  {
    id: 'inv-002',
    organizationId: 'org-apex-01',
    invoiceNumber: 'INV-2026-00913',
    patientId: 'pat-002',
    patientName: 'Ananya Iyer',
    patientPhone: '+91 98765 11223',
    date: '2026-08-19',
    dueDate: '2026-08-26',
    items: [
      { id: 'ii-05', description: 'Emergency Department Admission & Triage Fee', category: 'SERVICE', quantity: 1, unitPrice: 350, total: 350 },
      { id: 'ii-06', description: 'ICU Bed Stay (Day 1 - Level 3 Monitoring)', category: 'BED_CHARGE', quantity: 1, unitPrice: 850, total: 850 },
      { id: 'ii-07', description: 'MHrdiac Troponin hs-cTnI STAT Testing', category: 'LAB_TEST', quantity: 1, unitPrice: 90, total: 90 },
      { id: 'ii-08', description: 'Digital Chest X-Ray PA View', category: 'PROCEDURE', quantity: 1, unitPrice: 110, total: 110 },
    ],
    subtotal: 1400.00,
    taxAmount: 105.00,
    discountAmount: 0.00,
    totalAmount: 1505.00,
    paidAmount: 500.00,
    balanceDue: 1005.00,
    status: 'PARTIALLY_PAID',
    paymentMethod: 'INSURANCE_CLAIM',
    paymentTransactions: [
      {
        id: 'pt-002',
        amount: 500.00,
        date: '2026-08-19T08:00:00Z',
        method: 'INSURANCE_CLAIM',
        reference: 'AETNA-COPAY-DEPOSIT',
        receivedBy: 'Amitabh Verma, CA',
      },
    ],
    insuranceClaimId: 'CLM-AET-2026-901',
    notes: 'Remainder billed to Aetna policy #AET-481902 pending discharge pre-authorization.',
  },
];

const INITIAL_BEDS: WardBed[] = [
  {
    id: 'bed-icu-01',
    organizationId: 'org-apex-01',
    wardId: 'ward-icu-01',
    wardName: 'MHrdiac Intensive MHre Unit (CICU)',
    wardType: 'ICU',
    roomNumber: 'ICU-Room 1',
    bedNumber: 'ICU-B01',
    dailyRate: 850,
    status: 'AVAILABLE',
  },
  {
    id: 'bed-icu-02',
    organizationId: 'org-apex-01',
    wardId: 'ward-icu-01',
    wardName: 'MHrdiac Intensive MHre Unit (CICU)',
    wardType: 'ICU',
    roomNumber: 'ICU-Room 1',
    bedNumber: 'ICU-B02',
    dailyRate: 850,
    status: 'CLEANING',
  },
  {
    id: 'bed-icu-03',
    organizationId: 'org-apex-01',
    wardId: 'ward-icu-01',
    wardName: 'MHrdiac Intensive MHre Unit (CICU)',
    wardType: 'ICU',
    roomNumber: 'ICU-Room 2',
    bedNumber: 'ICU-B03',
    dailyRate: 850,
    status: 'OCCUPIED',
    occupiedByPatientId: 'pat-002',
    occupiedByPatientName: 'Ananya Iyer',
    admittedAt: '2026-08-19T06:00:00Z',
    assignedDoctorName: 'Dr. Priya Patel, MD (DM Neuro)',
    assignedNurseName: 'Sarah Jenkins, RN',
  },
  {
    id: 'bed-gen-01',
    organizationId: 'org-apex-01',
    wardId: 'ward-gen-02',
    wardName: 'General Inpatient Ward (North)',
    wardType: 'GENERAL',
    roomNumber: 'Ward 301',
    bedNumber: 'GEN-301-A',
    dailyRate: 250,
    status: 'AVAILABLE',
  },
  {
    id: 'bed-gen-02',
    organizationId: 'org-apex-01',
    wardId: 'ward-gen-02',
    wardName: 'General Inpatient Ward (North)',
    wardType: 'GENERAL',
    roomNumber: 'Ward 301',
    bedNumber: 'GEN-301-B',
    dailyRate: 250,
    status: 'AVAILABLE',
  },
  {
    id: 'bed-pvt-01',
    organizationId: 'org-apex-01',
    wardId: 'ward-pvt-03',
    wardName: 'Executive Private Suites',
    wardType: 'DELUXE',
    roomNumber: 'Suite 501',
    bedNumber: 'STE-501',
    dailyRate: 600,
    status: 'RESERVED',
  },
];

const INITIAL_ADMISSIONS: Admission[] = [
  {
    id: 'adm-001',
    organizationId: 'org-apex-01',
    admissionNumber: 'ADM-2026-0014',
    patientId: 'pat-002',
    patientName: 'Ananya Iyer',
    bedId: 'bed-icu-03',
    wardName: 'MHrdiac Intensive MHre Unit (CICU)',
    bedNumber: 'ICU-B03',
    admittedDate: '2026-08-19T06:00:00Z',
    admittingDoctorId: 'user-doc-02',
    admittingDoctorName: 'Dr. Priya Patel, MD (DM Neuro)',
    admittingDiagnosis: 'Acute Severe CompliMHted Migraine with NeurologiMHl FoMHl Deficits; r/o Transient Ischemic Attack',
    status: 'ADMITTED',
    vitalsFrequencyHours: 2,
    careNotes: [
      {
        id: 'cn-01',
        timestamp: '2026-08-19T06:30:00Z',
        authorName: 'Dr. Priya Patel, MD (DM Neuro)',
        authorRole: 'Attending Neurologist',
        note: 'Initiated IV hydration, magnesium sulfate infusion, and continuous telemetry monitoring. NeurologiMHl exam reveals left hemiparesis resolving.',
      },
      {
        id: 'cn-02',
        timestamp: '2026-08-19T07:15:00Z',
        authorName: 'Sarah Jenkins, RN',
        authorRole: 'Staff Nurse',
        note: 'IV line patent in right forearm. Patient resting comfortably with dimmed lighting.',
      },
    ],
  },
];

const INITIAL_NOTIFIMHTIONS: Notification[] = [
  {
    id: 'notif-001',
    organizationId: 'org-apex-01',
    title: 'New Emergency Admission',
    message: 'Patient Ananya Iyer admitted to ICU-B03 under Dr. Sophia Rodriguez.',
    category: 'EMERGENCY',
    priority: 'HIGH',
    read: false,
    timestamp: '2026-08-19T06:05:00Z',
  },
  {
    id: 'notif-002',
    organizationId: 'org-apex-01',
    title: 'Low Stock Alert: Nitroglycerin SL',
    message: 'Inventory level at 45 units (below threshold of 100). Auto-purchase order drafted.',
    category: 'PHARMACY',
    priority: 'MEDIUM',
    read: false,
    timestamp: '2026-08-19T07:30:00Z',
  },
  {
    id: 'notif-003',
    organizationId: 'org-apex-01',
    title: 'Lab Result Verified',
    message: 'Lipid Panel for Aarav Sharma (PAT-2026-0042) verified by Priya Sharma.',
    category: 'LAB_RESULT',
    priority: 'LOW',
    read: true,
    timestamp: '2026-08-18T13:42:00Z',
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-001',
    organizationId: 'org-apex-01',
    userId: 'user-doc-01',
    userName: 'Dr. Vikramaditya Singh, MD (AIIMS)',
    userRole: 'DOCTOR',
    action: 'PRESCRIPTION_FINALIZED',
    resource: 'Prescription',
    resourceId: 'rx-001',
    timestamp: '2026-08-19T09:20:00Z',
    ipAddress: '10.0.4.12',
    details: 'Finalized and digitally signed prescription RX-2026-00891 with 3 items.',
    status: 'SUCCESS',
  },
  {
    id: 'aud-002',
    organizationId: 'org-apex-01',
    userId: 'user-admin-01',
    userName: 'Dr. Rajesh Sharma',
    userRole: 'HOSPITAL_ADMIN',
    action: 'TENANT_SETTINGS_UPDATED',
    resource: 'Organization',
    resourceId: 'org-apex-01',
    timestamp: '2026-08-18T16:00:00Z',
    ipAddress: '10.0.1.5',
    details: 'Updated hospital tax rate to 7.5% and adjusted AI monthly quota.',
    status: 'SUCCESS',
  },
];

class HospitalDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = {
      organizations: [...INITIAL_ORGANIZATIONS],
      users: [...INITIAL_USERS],
      departments: [...INITIAL_DEPARTMENTS],
      patients: [...INITIAL_PATIENTS],
      vitals: [...INITIAL_VITALS],
      appointments: [...INITIAL_APPOINTMENTS],
      prescriptions: [...INITIAL_PRESCRIPTIONS],
      labTests: [...INITIAL_LAB_TESTS],
      labOrders: [...INITIAL_LAB_ORDERS],
      medicines: [...INITIAL_MEDICINES],
      inventory: [...INITIAL_INVENTORY],
      invoices: [...INITIAL_INVOICES],
      beds: [...INITIAL_BEDS],
      admissions: [...INITIAL_ADMISSIONS],
      notifications: [...INITIAL_NOTIFIMHTIONS],
      auditLogs: [...INITIAL_AUDIT_LOGS],
    };
  }

  // Tenant-scoped lookups
  getOrganization(orgId: string): Organization | undefined {
    return this.data.organizations.find((o) => o.id === orgId);
  }

  getAllOrganizations(): Organization[] {
    return this.data.organizations;
  }

  updateOrganization(orgId: string, updates: Partial<Organization>): Organization | undefined {
    const idx = this.data.organizations.findIndex((o) => o.id === orgId);
    if (idx === -1) return undefined;
    this.data.organizations[idx] = { ...this.data.organizations[idx], ...updates };
    return this.data.organizations[idx];
  }

  createOrganization(org: Omit<Organization, 'id' | 'createdAt'>): Organization {
    const newOrg: Organization = {
      ...org,
      id: `org-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.organizations.push(newOrg);
    return newOrg;
  }

  // Users
  getUsers(orgId: string): User[] {
    return this.data.users.filter((u) => u.organizationId === orgId || u.role === 'SUPER_ADMIN');
  }

  getUserById(userId: string): User | undefined {
    return this.data.users.find((u) => u.id === userId);
  }

  createUser(user: Omit<User, 'id'>): User {
    const newUser: User = { ...user, id: `user-${Date.now()}` };
    this.data.users.push(newUser);
    return newUser;
  }

  // Departments
  getDepartments(orgId: string): Department[] {
    return this.data.departments.filter((d) => d.organizationId === orgId);
  }

  // Patients
  getPatients(orgId: string, search?: string): Patient[] {
    let list = this.data.patients.filter((p) => p.organizationId === orgId);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.patientIdNumber.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.email.toLowerCase().includes(q)
      );
    }
    return list;
  }

  getPatientById(orgId: string, id: string): Patient | undefined {
    return this.data.patients.find((p) => p.organizationId === orgId && p.id === id);
  }

  createPatient(orgId: string, patientData: Omit<Patient, 'id' | 'organizationId' | 'patientIdNumber' | 'registeredDate'>): Patient {
    const count = this.data.patients.filter((p) => p.organizationId === orgId).length + 1;
    const patientIdNumber = `PAT-2026-${String(count).padStart(4, '0')}`;
    const newPatient: Patient = {
      ...patientData,
      id: `pat-${Date.now()}`,
      organizationId: orgId,
      patientIdNumber,
      registeredDate: new Date().toISOString().split('T')[0],
    };
    this.data.patients.unshift(newPatient);
    return newPatient;
  }

  updatePatient(orgId: string, id: string, updates: Partial<Patient>): Patient | undefined {
    const idx = this.data.patients.findIndex((p) => p.organizationId === orgId && p.id === id);
    if (idx === -1) return undefined;
    this.data.patients[idx] = { ...this.data.patients[idx], ...updates };
    return this.data.patients[idx];
  }

  // Vitals
  getVitals(orgId: string, patientId: string): VitalSign[] {
    return this.data.vitals.filter((v) => v.organizationId === orgId && v.patientId === patientId);
  }

  createVital(vital: Omit<VitalSign, 'id'>): VitalSign {
    const newVital: VitalSign = { ...vital, id: `vit-${Date.now()}` };
    this.data.vitals.unshift(newVital);
    return newVital;
  }

  // Appointments
  getAppointments(orgId: string, filters?: { doctorId?: string; date?: string; status?: string }): Appointment[] {
    return this.data.appointments.filter((a) => {
      if (a.organizationId !== orgId) return false;
      if (filters?.doctorId && a.doctorId !== filters.doctorId) return false;
      if (filters?.date && a.date !== filters.date) return false;
      if (filters?.status && a.status !== filters.status) return false;
      return true;
    });
  }

  createAppointment(appointment: Omit<Appointment, 'id' | 'appointmentNumber' | 'qrCheckInToken' | 'createdAt'>): Appointment {
    const count = this.data.appointments.filter((a) => a.organizationId === appointment.organizationId).length + 1;
    const dateStr = appointment.date.replace(/-/g, '');
    const newApt: Appointment = {
      ...appointment,
      id: `apt-${Date.now()}`,
      appointmentNumber: `APT-${dateStr}-${String(count).padStart(2, '0')}`,
      qrCheckInToken: `qr-tok-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.appointments.unshift(newApt);
    return newApt;
  }

  updateAppointmentStatus(orgId: string, id: string, status: Appointment['status']): Appointment | undefined {
    const apt = this.data.appointments.find((a) => a.organizationId === orgId && a.id === id);
    if (!apt) return undefined;
    apt.status = status;
    return apt;
  }

  // Prescriptions
  getPrescriptions(orgId: string, patientId?: string): Prescription[] {
    return this.data.prescriptions.filter((p) => {
      if (p.organizationId !== orgId) return false;
      if (patientId && p.patientId !== patientId) return false;
      return true;
    });
  }

  createPrescription(prescription: Omit<Prescription, 'id' | 'prescriptionNumber' | 'digitalSignatureHash' | 'createdAt'>): Prescription {
    const count = this.data.prescriptions.filter((p) => p.organizationId === prescription.organizationId).length + 1;
    const prescriptionNumber = `RX-2026-${String(count).padStart(5, '0')}`;
    const digitalSignatureHash = `SHA256:${Math.random().toString(36).substring(2, 10)}-verified-${prescription.doctorName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const newRx: Prescription = {
      ...prescription,
      id: `rx-${Date.now()}`,
      prescriptionNumber,
      digitalSignatureHash,
      createdAt: new Date().toISOString(),
    };
    this.data.prescriptions.unshift(newRx);
    return newRx;
  }

  // Lab Tests & Orders
  getLabTests(orgId: string): LabTest[] {
    return this.data.labTests.filter((t) => t.organizationId === orgId);
  }

  getLabOrders(orgId: string, patientId?: string): LabOrder[] {
    return this.data.labOrders.filter((o) => {
      if (o.organizationId !== orgId) return false;
      if (patientId && o.patientId !== patientId) return false;
      return true;
    });
  }

  createLabOrder(order: Omit<LabOrder, 'id' | 'orderNumber' | 'orderedAt'>): LabOrder {
    const count = this.data.labOrders.filter((o) => o.organizationId === order.organizationId).length + 1;
    const newOrder: LabOrder = {
      ...order,
      id: `lbo-${Date.now()}`,
      orderNumber: `LBO-2026-${String(count).padStart(5, '0')}`,
      orderedAt: new Date().toISOString(),
    };
    this.data.labOrders.unshift(newOrder);
    return newOrder;
  }

  updateLabOrder(orgId: string, id: string, updates: Partial<LabOrder>): LabOrder | undefined {
    const idx = this.data.labOrders.findIndex((o) => o.organizationId === orgId && o.id === id);
    if (idx === -1) return undefined;
    this.data.labOrders[idx] = { ...this.data.labOrders[idx], ...updates };
    return this.data.labOrders[idx];
  }

  // Medicines & Inventory
  getMedicines(orgId: string): Medicine[] {
    return this.data.medicines.filter((m) => m.organizationId === orgId);
  }

  createMedicine(med: Omit<Medicine, 'id'>): Medicine {
    const newMed: Medicine = { ...med, id: `med-${Date.now()}` };
    this.data.medicines.unshift(newMed);
    return newMed;
  }

  updateMedicineStock(orgId: string, id: string, quantityChange: number): Medicine | undefined {
    const med = this.data.medicines.find((m) => m.organizationId === orgId && m.id === id);
    if (!med) return undefined;
    med.currentStock = Math.max(0, med.currentStock + quantityChange);
    if (med.currentStock === 0) med.status = 'OUT_OF_STOCK';
    else if (med.currentStock <= med.reorderLevel) med.status = 'LOW_STOCK';
    else med.status = 'IN_STOCK';
    return med;
  }

  getInventory(orgId: string): InventoryItem[] {
    return this.data.inventory.filter((i) => i.organizationId === orgId);
  }

  // Invoices & Billing
  getInvoices(orgId: string, patientId?: string): Invoice[] {
    return this.data.invoices.filter((inv) => {
      if (inv.organizationId !== orgId) return false;
      if (patientId && inv.patientId !== patientId) return false;
      return true;
    });
  }

  createInvoice(inv: Omit<Invoice, 'id' | 'invoiceNumber'>): Invoice {
    const count = this.data.invoices.filter((i) => i.organizationId === inv.organizationId).length + 1;
    const newInv: Invoice = {
      ...inv,
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${String(count).padStart(5, '0')}`,
    };
    this.data.invoices.unshift(newInv);
    return newInv;
  }

  recordPayment(orgId: string, invoiceId: string, payment: { amount: number; method: string; reference: string; receivedBy: string }): Invoice | undefined {
    const inv = this.data.invoices.find((i) => i.organizationId === orgId && i.id === invoiceId);
    if (!inv) return undefined;
    inv.paidAmount += payment.amount;
    inv.balanceDue = Math.max(0, inv.totalAmount - inv.paidAmount);
    inv.status = inv.balanceDue === 0 ? 'PAID' : 'PARTIALLY_PAID';
    inv.paymentTransactions.push({
      id: `pt-${Date.now()}`,
      amount: payment.amount,
      date: new Date().toISOString(),
      method: payment.method,
      reference: payment.reference,
      receivedBy: payment.receivedBy,
    });
    return inv;
  }

  // Inpatient Beds & Admissions
  getBeds(orgId: string): WardBed[] {
    return this.data.beds.filter((b) => b.organizationId === orgId);
  }

  updateBedStatus(orgId: string, bedId: string, updates: Partial<WardBed>): WardBed | undefined {
    const bed = this.data.beds.find((b) => b.organizationId === orgId && b.id === bedId);
    if (!bed) return undefined;
    Object.assign(bed, updates);
    return bed;
  }

  getAdmissions(orgId: string): Admission[] {
    return this.data.admissions.filter((a) => a.organizationId === orgId);
  }

  createAdmission(admission: Omit<Admission, 'id' | 'admissionNumber'>): Admission {
    const count = this.data.admissions.filter((a) => a.organizationId === admission.organizationId).length + 1;
    const newAdm: Admission = {
      ...admission,
      id: `adm-${Date.now()}`,
      admissionNumber: `ADM-2026-${String(count).padStart(4, '0')}`,
    };
    this.data.admissions.unshift(newAdm);
    // Mark bed as occupied
    this.updateBedStatus(admission.organizationId, admission.bedId, {
      status: 'OCCUPIED',
      occupiedByPatientId: admission.patientId,
      occupiedByPatientName: admission.patientName,
      admittedAt: admission.admittedDate,
      assignedDoctorName: admission.admittingDoctorName,
    });
    // Mark patient status
    this.updatePatient(admission.organizationId, admission.patientId, {
      status: 'INPATIENT',
      currentWardBed: admission.bedNumber,
    });
    return newAdm;
  }

  // Notifications
  getNotifications(orgId: string, role?: string): Notification[] {
    return this.data.notifications.filter((n) => {
      if (n.organizationId !== orgId) return false;
      if (n.targetRole && role && n.targetRole !== role) return false;
      return true;
    });
  }

  createNotification(notif: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
    const newN: Notification = {
      ...notif,
      id: `notif-${Date.now()}`,
      read: false,
      timestamp: new Date().toISOString(),
    };
    this.data.notifications.unshift(newN);
    return newN;
  }

  // Audit Logs
  getAuditLogs(orgId: string): AuditLog[] {
    return this.data.auditLogs.filter((a) => a.organizationId === orgId);
  }

  logAudit(entry: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const log: AuditLog = {
      ...entry,
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(log);
  }
}

export const db = new HospitalDatabase();

