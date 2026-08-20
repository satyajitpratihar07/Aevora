import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import {
  generatePrescriptionDraft,
  parseVoiceDictation,
  generateClinicalSummary,
  queryAdminAssistant,
} from './server/gemini.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request correlation & basic tenant extraction middleware
  app.use((req, res, next) => {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    req.headers['x-tenant-id'] = tenantId;
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'PulseCloud HMS SaaS API', timestamp: new Date().toISOString() });
  });

  // ----------------------------------------------------
  // AUTHENTICATION & MULTI-TENANCY
  // ----------------------------------------------------
  app.post('/api/v1/auth/login', (req, res) => {
    const { email, role, organizationId } = req.body;
    const orgId = organizationId || 'org-apex-01';
    const users = db.getUsers(orgId);
    let user = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
    
    // If selecting by role directly in demo switcher
    if (!user && role) {
      user = users.find((u) => u.role === role);
    }
    
    if (!user) {
      user = users[0]; // fallback
    }

    db.logAudit({
      organizationId: user.organizationId,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'USER_LOGIN',
      resource: 'Session',
      resourceId: user.id,
      ipAddress: req.ip || '127.0.0.1',
      details: `User ${user.name} logged into ${user.organizationId}`,
      status: 'SUCCESS',
    });

    const org = db.getOrganization(user.organizationId);

    res.json({
      success: true,
      token: `jwt-pulsecloud-${user.id}-${Date.now()}`,
      user,
      organization: org,
    });
  });

  app.post('/api/v1/auth/signup', (req, res) => {
    const { orgName, orgType, adminName, email, phone, city, brandColor } = req.body;
    
    const newOrg = db.createOrganization({
      name: orgName || 'New Medical Center',
      code: `HMS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      type: orgType || 'HOSPITAL',
      brandColor: brandColor || '#0284c7',
      address: '100 Medical Center Drive',
      city: city || 'Mumbai',
      state: 'MH',
      country: 'India',
      postalCode: '400001',
      phone: phone || '+91 98765 43210',
      email: email || 'admin@newhospital.org',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      taxRate: 18.0,
      subscriptionPlan: 'PROFESSIONAL',
      subscriptionStatus: 'TRIAL',
      patientLimit: 2500,
      staffLimit: 50,
      aiUsageThisMonth: 0,
      aiUsageLimit: 2500,
    });

    const newUser = db.createUser({
      organizationId: newOrg.id,
      email: email || 'admin@newhospital.org',
      name: adminName || 'Hospital Administrator',
      role: 'HOSPITAL_ADMIN',
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
    });

    res.json({
      success: true,
      organization: newOrg,
      user: newUser,
      token: `jwt-pulsecloud-${newUser.id}-${Date.now()}`,
    });
  });

  // ----------------------------------------------------
  // ORGANIZATIONS & WHITE-LABEL SETTINGS
  // ----------------------------------------------------
  app.get('/api/v1/organizations', (req, res) => {
    res.json({ success: true, data: db.getAllOrganizations() });
  });

  app.get('/api/v1/organizations/:id', (req, res) => {
    const org = db.getOrganization(req.params.id);
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });
    res.json({ success: true, data: org });
  });

  app.put('/api/v1/organizations/:id', (req, res) => {
    const updated = db.updateOrganization(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Organization not found' });
    
    db.logAudit({
      organizationId: req.params.id,
      userId: 'user-admin-01',
      userName: 'Administrator',
      userRole: 'HOSPITAL_ADMIN',
      action: 'ORGANIZATION_SETTINGS_UPDATED',
      resource: 'Organization',
      resourceId: req.params.id,
      ipAddress: req.ip || '127.0.0.1',
      details: 'Updated organization brand styling, taxes, or facility profile.',
      status: 'SUCCESS',
    });

    res.json({ success: true, data: updated });
  });

  // ----------------------------------------------------
  // USERS & STAFF
  // ----------------------------------------------------
  app.get('/api/v1/users', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    res.json({ success: true, data: db.getUsers(orgId) });
  });

  app.post('/api/v1/users/invite', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    const { name, email, role, departmentId, specialization, licenseNumber } = req.body;
    
    const newUser = db.createUser({
      organizationId: orgId,
      name,
      email,
      role,
      departmentId,
      specialization,
      licenseNumber,
      status: 'ACTIVE',
      permissions: ['PATIENT_VIEW', 'APPOINTMENT_VIEW', 'REPORT_VIEW'],
    });

    db.createNotification({
      organizationId: orgId,
      title: 'New Staff Member Onboarded',
      message: `${name} invited as ${role}`,
      category: 'SYSTEM',
      priority: 'LOW',
    });

    res.json({ success: true, data: newUser });
  });

  // ----------------------------------------------------
  // DEPARTMENTS
  // ----------------------------------------------------
  app.get('/api/v1/departments', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    res.json({ success: true, data: db.getDepartments(orgId) });
  });

  // ----------------------------------------------------
  // PATIENTS & VITALS
  // ----------------------------------------------------
  app.get('/api/v1/patients', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    const search = req.query.search as string;
    res.json({ success: true, data: db.getPatients(orgId, search) });
  });

  app.get('/api/v1/patients/:id', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    const patient = db.getPatientById(orgId, req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    
    const vitals = db.getVitals(orgId, patient.id);
    const prescriptions = db.getPrescriptions(orgId, patient.id);
    const appointments = db.getAppointments(orgId).filter((a) => a.patientId === patient.id);
    const labOrders = db.getLabOrders(orgId, patient.id);
    const invoices = db.getInvoices(orgId, patient.id);

    res.json({
      success: true,
      data: {
        ...patient,
        vitals,
        prescriptions,
        appointments,
        labOrders,
        invoices,
      },
    });
  });

  app.post('/api/v1/patients', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    const patient = db.createPatient(orgId, req.body);
    
    db.logAudit({
      organizationId: orgId,
      userId: 'user-admin-01',
      userName: 'Registrar',
      userRole: 'HOSPITAL_ADMIN',
      action: 'PATIENT_REGISTERED',
      resource: 'Patient',
      resourceId: patient.id,
      ipAddress: req.ip || '127.0.0.1',
      details: `New patient ${patient.name} registered (${patient.patientIdNumber})`,
      status: 'SUCCESS',
    });

    res.json({ success: true, data: patient });
  });

  app.put('/api/v1/patients/:id', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    const updated = db.updatePatient(orgId, req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, data: updated });
  });

  app.get('/api/v1/vitals/:patientId', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    res.json({ success: true, data: db.getVitals(orgId, req.params.patientId) });
  });

  app.post('/api/v1/vitals', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    const heightM = req.body.heightCm ? req.body.heightCm / 100 : 1.75;
    const bmi = req.body.weightKg ? Number((req.body.weightKg / (heightM * heightM)).toFixed(1)) : 22;
    
    const vital = db.createVital({
      ...req.body,
      organizationId: orgId,
      bmi,
      recordedAt: new Date().toISOString(),
    });
    res.json({ success: true, data: vital });
  });

  // ----------------------------------------------------
  // APPOINTMENTS
  // ----------------------------------------------------
  app.get('/api/v1/appointments', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    const { doctorId, date, status } = req.query as any;
    res.json({ success: true, data: db.getAppointments(orgId, { doctorId, date, status }) });
  });

  app.post('/api/v1/appointments', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    const appointment = db.createAppointment({
      ...req.body,
      organizationId: orgId,
    });

    db.createNotification({
      organizationId: orgId,
      title: 'Appointment Booked',
      message: `${appointment.patientName} scheduled with ${appointment.doctorName} for ${appointment.date} (${appointment.timeSlot})`,
      category: 'APPOINTMENT',
      priority: 'MEDIUM',
    });

    res.json({ success: true, data: appointment });
  });

  app.patch('/api/v1/appointments/:id/status', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    const { status } = req.body;
    const updated = db.updateAppointmentStatus(orgId, req.params.id, status);
    if (!updated) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: updated });
  });

  // ----------------------------------------------------
  // PRESCRIPTIONS & CLINICAL WORKSPACE
  // ----------------------------------------------------
  app.get('/api/v1/prescriptions', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    const patientId = req.query.patientId as string;
    res.json({ success: true, data: db.getPrescriptions(orgId, patientId) });
  });

  app.post('/api/v1/prescriptions', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    const rx = db.createPrescription({
      ...req.body,
      organizationId: orgId,
    });

    db.logAudit({
      organizationId: orgId,
      userId: req.body.doctorId || 'user-doc-01',
      userName: req.body.doctorName || 'Attending Physician',
      userRole: 'DOCTOR',
      action: 'PRESCRIPTION_FINALIZED',
      resource: 'Prescription',
      resourceId: rx.id,
      ipAddress: req.ip || '127.0.0.1',
      details: `Prescription ${rx.prescriptionNumber} approved for ${rx.patientName} (${rx.items.length} items).`,
      status: 'SUCCESS',
    });

    db.createNotification({
      organizationId: orgId,
      targetRole: 'PHARMACIST',
      title: 'New Prescription to Dispense',
      message: `Prescription ${rx.prescriptionNumber} generated for ${rx.patientName}.`,
      category: 'PHARMACY',
      priority: 'MEDIUM',
    });

    res.json({ success: true, data: rx });
  });

  // ----------------------------------------------------
  // LAB TESTS & DIAGNOSTICS
  // ----------------------------------------------------
  app.get('/api/v1/labs/tests', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    res.json({ success: true, data: db.getLabTests(orgId) });
  });

  app.get('/api/v1/labs/orders', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    const patientId = req.query.patientId as string;
    res.json({ success: true, data: db.getLabOrders(orgId, patientId) });
  });

  app.post('/api/v1/labs/orders', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    const order = db.createLabOrder({
      ...req.body,
      organizationId: orgId,
    });

    db.createNotification({
      organizationId: orgId,
      targetRole: 'LAB_TECH',
      title: 'New Diagnostic Order',
      message: `${order.testName} ordered for ${order.patientName} (${order.priority})`,
      category: 'LAB_RESULT',
      priority: order.priority === 'STAT_EMERGENCY' ? 'CRITICAL' : 'MEDIUM',
    });

    res.json({ success: true, data: order });
  });

  app.put('/api/v1/labs/orders/:id', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    const updated = db.updateLabOrder(orgId, req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Lab order not found' });
    res.json({ success: true, data: updated });
  });

  // ----------------------------------------------------
  // PHARMACY & INVENTORY
  // ----------------------------------------------------
  app.get('/api/v1/pharmacy/medicines', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    res.json({ success: true, data: db.getMedicines(orgId) });
  });

  app.post('/api/v1/pharmacy/medicines', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    const med = db.createMedicine({
      ...req.body,
      organizationId: orgId,
    });
    res.json({ success: true, data: med });
  });

  app.post('/api/v1/pharmacy/dispense', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    const { items, patientId, patientName } = req.body;
    
    // Adjust stocks atomically
    for (const item of items) {
      if (item.medicineId) {
        db.updateMedicineStock(orgId, item.medicineId, -Number(item.quantity || 1));
      }
    }

    db.logAudit({
      organizationId: orgId,
      userId: 'user-pharm-01',
      userName: 'David Kim, PharmD',
      userRole: 'PHARMACIST',
      action: 'MEDICATION_DISPENSED',
      resource: 'Pharmacy',
      resourceId: `dispense-${Date.now()}`,
      ipAddress: req.ip || '127.0.0.1',
      details: `Dispensed medications for ${patientName} (${items.length} items).`,
      status: 'SUCCESS',
    });

    res.json({ success: true, message: 'Medications dispensed and inventory updated.' });
  });

  app.get('/api/v1/inventory', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    res.json({ success: true, data: db.getInventory(orgId) });
  });

  // ----------------------------------------------------
  // BILLING & INVOICES
  // ----------------------------------------------------
  app.get('/api/v1/billing/invoices', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    const patientId = req.query.patientId as string;
    res.json({ success: true, data: db.getInvoices(orgId, patientId) });
  });

  app.post('/api/v1/billing/invoices', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    const invoice = db.createInvoice({
      ...req.body,
      organizationId: orgId,
    });
    res.json({ success: true, data: invoice });
  });

  app.post('/api/v1/billing/invoices/:id/pay', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    const updated = db.recordPayment(orgId, req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: updated });
  });

  // ----------------------------------------------------
  // INPATIENT BEDS & ADMISSIONS
  // ----------------------------------------------------
  app.get('/api/v1/beds', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    res.json({ success: true, data: db.getBeds(orgId) });
  });

  app.patch('/api/v1/beds/:id', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    const updated = db.updateBedStatus(orgId, req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Bed not found' });
    res.json({ success: true, data: updated });
  });

  app.get('/api/v1/admissions', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    res.json({ success: true, data: db.getAdmissions(orgId) });
  });

  app.post('/api/v1/admissions', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    const adm = db.createAdmission({
      ...req.body,
      organizationId: orgId,
    });
    res.json({ success: true, data: adm });
  });

  // ----------------------------------------------------
  // NOTIFICATIONS & AUDIT LOGS
  // ----------------------------------------------------
  app.get('/api/v1/notifications', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    const role = req.query.role as string;
    res.json({ success: true, data: db.getNotifications(orgId, role) });
  });

  app.get('/api/v1/audit', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    res.json({ success: true, data: db.getAuditLogs(orgId) });
  });

  // ----------------------------------------------------
  // ANALYTICS OVERVIEW
  // ----------------------------------------------------
  app.get('/api/v1/analytics/overview', (req, res) => {
    const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
    const patients = db.getPatients(orgId);
    const appointments = db.getAppointments(orgId);
    const invoices = db.getInvoices(orgId);
    const beds = db.getBeds(orgId);
    const medicines = db.getMedicines(orgId);
    const labOrders = db.getLabOrders(orgId);

    const totalRevenue = invoices.reduce((acc, i) => acc + i.paidAmount, 0);
    const outstandingInvoices = invoices.reduce((acc, i) => acc + i.balanceDue, 0);
    const occupiedBeds = beds.filter((b) => b.status === 'OCCUPIED').length;
    const lowStockMeds = medicines.filter((m) => m.status === 'LOW_STOCK' || m.status === 'OUT_OF_STOCK').length;

    res.json({
      success: true,
      data: {
        totalPatients: patients.length,
        todayAppointments: appointments.length,
        pendingAppointments: appointments.filter((a) => a.status === 'PENDING' || a.status === 'CONFIRMED').length,
        totalRevenue,
        outstandingInvoices,
        totalBeds: beds.length,
        occupiedBeds,
        availableBeds: beds.filter((b) => b.status === 'AVAILABLE').length,
        bedOccupancyRate: beds.length > 0 ? Math.round((occupiedBeds / beds.length) * 100) : 0,
        lowStockMedicines: lowStockMeds,
        activeLabOrders: labOrders.filter((l) => l.status !== 'VERIFIED' && l.status !== 'PUBLISHED').length,
        doctorUtilization: 88.5,
        monthlyRevenueTrend: [
          { month: 'Jan', revenue: 42000, outpatient: 320, inpatient: 45 },
          { month: 'Feb', revenue: 48500, outpatient: 380, inpatient: 52 },
          { month: 'Mar', revenue: 56000, outpatient: 410, inpatient: 60 },
          { month: 'Apr', revenue: 61000, outpatient: 460, inpatient: 64 },
          { month: 'May', revenue: 67500, outpatient: 505, inpatient: 72 },
          { month: 'Jun', revenue: 74200, outpatient: 540, inpatient: 78 },
          { month: 'Jul', revenue: 81000, outpatient: 590, inpatient: 85 },
          { month: 'Aug (MTD)', revenue: totalRevenue, outpatient: patients.length, inpatient: occupiedBeds },
        ],
        departmentBreakdown: [
          { name: 'Cardiology', patients: 145, revenue: 38500 },
          { name: 'Neurology', patients: 98, revenue: 29400 },
          { name: 'Orthopedics', patients: 112, revenue: 24800 },
          { name: 'Emergency', patients: 220, revenue: 45000 },
          { name: 'Diagnostics', patients: 310, revenue: 18600 },
        ],
      },
    });
  });

  // ----------------------------------------------------
  // AI-POWERED CLINICAL & ADMINISTRATIVE SERVICES
  // ----------------------------------------------------
  app.post('/api/v1/ai/prescription-draft', async (req, res) => {
    try {
      const draft = await generatePrescriptionDraft(req.body);
      
      const orgId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';
      db.logAudit({
        organizationId: orgId,
        userId: 'user-doc-01',
        userName: 'Physician AI Workspace',
        userRole: 'DOCTOR',
        action: 'AI_PRESCRIPTION_DRAFTED',
        resource: 'AI_Service',
        resourceId: 'gemini-3.7-flash',
        ipAddress: req.ip || '127.0.0.1',
        details: `Generated AI prescription recommendation for patient (Assessment: ${draft.assessment.substring(0, 40)}...)`,
        status: 'SUCCESS',
      });

      res.json({ success: true, data: draft });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'AI service unavailable' });
    }
  });

  app.post('/api/v1/ai/voice-parse', async (req, res) => {
    try {
      const { transcript } = req.body;
      if (!transcript) return res.status(400).json({ success: false, message: 'Transcript required' });
      const parsed = await parseVoiceDictation(transcript);
      res.json({ success: true, data: parsed });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Voice parser failed' });
    }
  });

  app.post('/api/v1/ai/clinical-summary', async (req, res) => {
    try {
      const { patientData, labResults } = req.body;
      const summary = await generateClinicalSummary(patientData, labResults || []);
      res.json({ success: true, data: summary });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Summary generation failed' });
    }
  });

  app.post('/api/v1/ai/admin-assistant', async (req, res) => {
    try {
      const { query, contextData } = req.body;
      const response = await queryAdminAssistant(query, contextData);
      res.json({ success: true, data: { answer: response } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Admin assistant failed' });
    }
  });

  // ----------------------------------------------------
  // VITE DEV MIDDLEWARE / STATIC ASSETS
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PulseCloud HMS SaaS running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start PulseCloud HMS Server:', err);
});

