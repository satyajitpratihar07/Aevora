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

  // Users / Staff
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

  // Departments
  async getDepartments(): Promise<Department[]> {
    return this.request<Department[]>('/api/v1/departments');
  }

  // Patients & Vitals
  async getPatients(search?: string): Promise<Patient[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request<Patient[]>(`/api/v1/patients${query}`);
  }

  async getPatientById(id: string): Promise<Patient & { vitals: VitalSign[]; prescriptions: Prescription[]; appointments: Appointment[]; labOrders: LabOrder[]; invoices: Invoice[] }> {
    return this.request<Patient & { vitals: VitalSign[]; prescriptions: Prescription[]; appointments: Appointment[]; labOrders: LabOrder[]; invoices: Invoice[] }>(`/api/v1/patients/${id}`);
  }

  async createPatient(payload: Partial<Patient>): Promise<Patient> {
    return this.request<Patient>('/api/v1/patients', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updatePatient(id: string, payload: Partial<Patient>): Promise<Patient> {
    return this.request<Patient>(`/api/v1/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async getVitals(patientId: string): Promise<VitalSign[]> {
    return this.request<VitalSign[]>(`/api/v1/vitals/${patientId}`);
  }

  async createVital(payload: Partial<VitalSign>): Promise<VitalSign> {
    return this.request<VitalSign>('/api/v1/vitals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Appointments
  async getAppointments(filters?: { doctorId?: string; date?: string; status?: string }): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (filters?.doctorId) params.append('doctorId', filters.doctorId);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.status) params.append('status', filters.status);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.request<Appointment[]>(`/api/v1/appointments${queryString}`);
  }

  async createAppointment(payload: Partial<Appointment>): Promise<Appointment> {
    return this.request<Appointment>('/api/v1/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<Appointment> {
    return this.request<Appointment>(`/api/v1/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Prescriptions
  async getPrescriptions(patientId?: string): Promise<Prescription[]> {
    const query = patientId ? `?patientId=${patientId}` : '';
    return this.request<Prescription[]>(`/api/v1/prescriptions${query}`);
  }

  async createPrescription(payload: Partial<Prescription>): Promise<Prescription> {
    return this.request<Prescription>('/api/v1/prescriptions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Lab Tests & Orders
  async getLabTests(): Promise<LabTest[]> {
    return this.request<LabTest[]>('/api/v1/labs/tests');
  }

  async getLabOrders(patientId?: string): Promise<LabOrder[]> {
    const query = patientId ? `?patientId=${patientId}` : '';
    return this.request<LabOrder[]>(`/api/v1/labs/orders${query}`);
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

  // Pharmacy & Inventory
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

  // Billing
  async getInvoices(patientId?: string): Promise<Invoice[]> {
    const query = patientId ? `?patientId=${patientId}` : '';
    return this.request<Invoice[]>(`/api/v1/billing/invoices${query}`);
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

  // Beds & Admissions
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

  // Notifications & Audit
  async getNotifications(role?: string): Promise<Notification[]> {
    const query = role ? `?role=${role}` : '';
    return this.request<Notification[]>(`/api/v1/notifications${query}`);
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return this.request<AuditLog[]>('/api/v1/audit');
  }

  async getAnalyticsOverview(): Promise<any> {
    return this.request<any>('/api/v1/analytics/overview');
  }

  // AI Features
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
}

export const api = new ApiService();
