import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase.js';

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
  AiPrescriptionDraftRequest,
  AiPrescriptionDraftResponse,
} from '../types/index.js';

class ApiService {
  private tenantId: string = 'org-apex-01';

  setTenantId(id: string) {
    this.tenantId = id;
  }

  getTenantId(): string {
    return this.tenantId;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      'x-tenant-id': this.tenantId,
      ...(options.headers || {}),
    };

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.data !== undefined ? data.data : data;
  }

  // Auth & Organizations
  async login(payload: { email?: string; role?: string; organizationId?: string }) {
    return this.request<{ success: boolean; token: string; user: User; organization: Organization }>(
      '/api/v1/auth/login',
      { method: 'POST', body: JSON.stringify(payload) }
    );
  }

  async signup(payload: any) {
    return this.request<{ success: boolean; organization: Organization; user: User; token: string }>(
      '/api/v1/auth/signup',
      { method: 'POST', body: JSON.stringify(payload) }
    );
  }

  async getOrganizations(): Promise<Organization[]> {
    return this.request<Organization[]>('/api/v1/organizations');
  }

  async createOrganization(payload: Partial<Organization>): Promise<Organization> {
    return this.request<Organization>('/api/v1/organizations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization> {
    return this.request<Organization>(`/api/v1/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/api/v1/users');
  }

  async getStaff(): Promise<User[]> {
    return this.getUsers();
  }

  async createStaff(payload: any): Promise<User> {
    return this.inviteStaff(payload);
  }

  async inviteStaff(payload: any): Promise<User> {
    return this.request<User>('/api/v1/users/invite', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getDepartments(): Promise<Department[]> {
    return this.request<Department[]>('/api/v1/departments');
  }

  async getPatients(search?: string): Promise<Patient[]> {
    try {
      const q = query(collection(db, 'patients'), where('organizationId', '==', this.tenantId));
      const snap = await getDocs(q);
      const patients = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
      if (search) {
        return patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.patientIdNumber.includes(search));
      }
      return patients;
    } catch (err) {
      console.warn("Firestore fallback", err);
      const queryStr = search ? `?search=${encodeURIComponent(search)}` : '';
      return this.request<Patient[]>(`/api/v1/patients${queryStr}`);
    }
  }

  async getPatientById(id: string): Promise<Patient & { vitals: VitalSign[]; prescriptions: Prescription[]; appointments: Appointment[]; labOrders: LabOrder[]; invoices: Invoice[] }> {
    try {
      const docRef = doc(db, 'patients', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const patient = { id: docSnap.id, ...docSnap.data() } as Patient;
        const vitals = await this.getVitals(id);
        const prescriptions = await this.getPrescriptions(id);
        const appointments = await this.getAppointments({ status: '' });
        return { ...patient, vitals, prescriptions, appointments: appointments.filter(a => a.patientId === id), labOrders: [], invoices: [] };
      }
      throw new Error('Patient not found');
    } catch (err) {
      return this.request<Patient & { vitals: VitalSign[]; prescriptions: Prescription[]; appointments: Appointment[]; labOrders: LabOrder[]; invoices: Invoice[] }>(`/api/v1/patients/${id}`);
    }
  }

  async createPatient(payload: Partial<Patient>): Promise<Patient> {
    try {
      const docRef = await addDoc(collection(db, 'patients'), {
        ...payload,
        organizationId: this.tenantId,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...payload } as Patient;
    } catch (err) {
      return this.request<Patient>('/api/v1/patients', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
  }

  async updatePatient(id: string, payload: Partial<Patient>): Promise<Patient> {
    try {
      const docRef = doc(db, 'patients', id);
      await updateDoc(docRef, payload);
      return { id, ...payload } as Patient;
    } catch (err) {
      return this.request<Patient>(`/api/v1/patients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    }
  }

  async getVitals(patientId: string): Promise<VitalSign[]> {
    try {
      const q = query(collection(db, 'vitals'), where('patientId', '==', patientId));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as VitalSign));
    } catch (err) {
      return this.request<VitalSign[]>(`/api/v1/vitals/${patientId}`);
    }
  }

  async createVital(payload: Partial<VitalSign>): Promise<VitalSign> {
    try {
      const docRef = await addDoc(collection(db, 'vitals'), {
        ...payload,
        organizationId: this.tenantId,
        recordedAt: new Date().toISOString()
      });
      return { id: docRef.id, ...payload } as VitalSign;
    } catch (err) {
      return this.request<VitalSign>('/api/v1/vitals', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
  }

  async getAppointments(filters?: { doctorId?: string; date?: string; status?: string }): Promise<Appointment[]> {
    try {
      let q = query(collection(db, 'appointments'), where('organizationId', '==', this.tenantId));
      if (filters?.doctorId) q = query(q, where('doctorId', '==', filters.doctorId));
      if (filters?.date) q = query(q, where('date', '==', filters.date));
      if (filters?.status) q = query(q, where('status', '==', filters.status));
      
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
    } catch (err) {
      const params = new URLSearchParams();
      if (filters?.doctorId) params.append('doctorId', filters.doctorId);
      if (filters?.date) params.append('date', filters.date);
      if (filters?.status) params.append('status', filters.status);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return this.request<Appointment[]>(`/api/v1/appointments${queryString}`);
    }
  }

  async createAppointment(payload: Partial<Appointment>): Promise<Appointment> {
    try {
      const docRef = await addDoc(collection(db, 'appointments'), {
        ...payload,
        organizationId: this.tenantId
      });
      return { id: docRef.id, ...payload } as Appointment;
    } catch (err) {
      return this.request<Appointment>('/api/v1/appointments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
  }

  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<Appointment> {
    try {
      const docRef = doc(db, 'appointments', id);
      await updateDoc(docRef, { status });
      return { id, status } as any;
    } catch (err) {
      return this.request<Appointment>(`/api/v1/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    }
  }

  async getPrescriptions(patientId?: string): Promise<Prescription[]> {
    try {
      let q = query(collection(db, 'prescriptions'), where('organizationId', '==', this.tenantId));
      if (patientId) q = query(q, where('patientId', '==', patientId));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prescription));
    } catch (err) {
      const queryStr = patientId ? `?patientId=${patientId}` : '';
      return this.request<Prescription[]>(`/api/v1/prescriptions${queryStr}`);
    }
  }

  async createPrescription(payload: Partial<Prescription>): Promise<Prescription> {
    try {
      const docRef = await addDoc(collection(db, 'prescriptions'), {
        ...payload,
        organizationId: this.tenantId
      });
      return { id: docRef.id, ...payload } as Prescription;
    } catch (err) {
      return this.request<Prescription>('/api/v1/prescriptions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
  }

  async getLabTests(): Promise<LabTest[]> {
    return this.request<LabTest[]>('/api/v1/labs/tests');
  }

  async getLabOrders(patientId?: string): Promise<LabOrder[]> {
    const queryStr = patientId ? `?patientId=${patientId}` : '';
    return this.request<LabOrder[]>(`/api/v1/labs/orders${queryStr}`);
  }

  async createLabOrder(payload: Partial<LabOrder>): Promise<LabOrder> {
    return this.request<LabOrder>('/api/v1/labs/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateLabOrder(id: string, payload: Partial<LabOrder>): Promise<LabOrder> {
    return this.request<LabOrder>(`/api/v1/labs/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async getMedicines(): Promise<Medicine[]> {
    return this.request<Medicine[]>('/api/v1/pharmacy/medicines');
  }

  async createMedicine(payload: Partial<Medicine>): Promise<Medicine> {
    return this.request<Medicine>('/api/v1/pharmacy/medicines', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async dispenseMedications(payload: { items: any[]; patientId: string; patientName: string }) {
    return this.request('/api/v1/pharmacy/dispense', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getInventory(): Promise<InventoryItem[]> {
    return this.request<InventoryItem[]>('/api/v1/inventory');
  }

  async getInvoices(patientId?: string): Promise<Invoice[]> {
    const queryStr = patientId ? `?patientId=${patientId}` : '';
    return this.request<Invoice[]>(`/api/v1/billing/invoices${queryStr}`);
  }

  async createInvoice(payload: Partial<Invoice>): Promise<Invoice> {
    return this.request<Invoice>('/api/v1/billing/invoices', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async payInvoice(id: string, payload: { amount: number; method: string; reference: string; receivedBy: string }): Promise<Invoice> {
    return this.request<Invoice>(`/api/v1/billing/invoices/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getBeds(): Promise<WardBed[]> {
    return this.request<WardBed[]>('/api/v1/beds');
  }

  async updateBedStatus(id: string, updates: Partial<WardBed>): Promise<WardBed> {
    return this.request<WardBed>(`/api/v1/beds/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async getAdmissions(): Promise<Admission[]> {
    return this.request<Admission[]>('/api/v1/admissions');
  }

  async createAdmission(payload: Partial<Admission>): Promise<Admission> {
    return this.request<Admission>('/api/v1/admissions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getNotifications(role?: string): Promise<Notification[]> {
    const queryStr = role ? `?role=${role}` : '';
    return this.request<Notification[]>(`/api/v1/notifications${queryStr}`);
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return this.request<AuditLog[]>('/api/v1/audit');
  }

  async getAnalyticsOverview(): Promise<any> {
    return this.request<any>('/api/v1/analytics/overview');
  }

  async generateAiPrescription(request: AiPrescriptionDraftRequest): Promise<AiPrescriptionDraftResponse> {
    return this.request<AiPrescriptionDraftResponse>('/api/v1/ai/prescription-draft', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async parseVoiceAudio(transcript: string): Promise<any> {
    return this.request<any>('/api/v1/ai/voice-parse', {
      method: 'POST',
      body: JSON.stringify({ transcript }),
    });
  }

  async getClinicalSummary(patientData: any, labResults: any[]): Promise<any> {
    return this.request<any>('/api/v1/ai/clinical-summary', {
      method: 'POST',
      body: JSON.stringify({ patientData, labResults }),
    });
  }

  async askAdminAssistant(query: string, contextData: any): Promise<{ answer: string }> {
    return this.request<{ answer: string }>('/api/v1/ai/admin-assistant', {
      method: 'POST',
      body: JSON.stringify({ query, contextData }),
    });
  }

  async chatWithGemini(messages: Array<{ role: 'user' | 'model' | 'system'; content: string }>, context?: any): Promise<{ reply: string }> {
    return this.request<{ reply: string }>('/api/v1/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, context }),
    });
  }
}

export const api = new ApiService();
