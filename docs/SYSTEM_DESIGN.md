# AVORA HMS — System Design & Architecture
## Presentation-Ready Technical Overview

---

## 🏗️ System Architecture Overview

```mermaid
graph TB
    subgraph CLIENT["🖥️ CLIENT LAYER — React 19 + Vite SPA"]
        direction TB
        SPLASH["AvoraSplashScreen<br/>Loading Animation"]
        LOGIN["UnifiedLoginPage<br/>5-Role Auth Portal"]
        ROUTER["App.tsx<br/>Role-Based Router + Guard"]
        
        subgraph DASHBOARDS["📊 Role Dashboards"]
            D1["🛡️ Hospital Admin<br/>HospitalAdminDashboard"]
            D2["🩺 Doctor<br/>DoctorWorkspace"]
            D3["💉 Nurse<br/>NurseDashboard"]
            D4["❤️ Patient<br/>PatientPortal"]
            D5["⚙️ Tech Ops<br/>TechnicalDashboard"]
        end

        subgraph AVORA_MODULES["🤖 AVORA AI Modules"]
            A1["HospitalCommandCenter"]
            A2["SmartBooking"]
            A3["EmergencyCoordinator"]
            A4["WorkflowDesigner"]
            A5["ReceptionistWorkspace"]
            A6["PatientJourneyTracker"]
        end

        subgraph SHARED["🔧 Shared Components"]
            SC1["GeminiChatbotWidget"]
            SC2["VoiceRecorderModal"]
            SC3["CommandPalette"]
            SC4["NotificationToasts"]
            SC5["AIAssistantDrawer"]
            SC6["AvoraIconLaunchpad"]
        end
    end

    subgraph CONTEXT["⚛️ React Context Layer"]
        AUTH["AuthContext<br/>User State • Role Guard<br/>Firebase Session"]
        NOTIF["NotificationContext<br/>Toast Queue"]
    end

    subgraph SERVER["🖧 SERVER LAYER — Node.js + Express"]
        direction TB
        API["Express REST API<br/>server.ts"]
        
        subgraph ENDPOINTS["📡 API Endpoints"]
            E_AUTH["🔐 /api/v1/auth/*<br/>login · signup · send-otp · verify-otp"]
            E_PATIENTS["👥 /api/v1/patients/*<br/>CRUD + Vitals"]
            E_APPTS["📅 /api/v1/appointments/*<br/>Schedule + Queue"]
            E_RX["💊 /api/v1/prescriptions/*<br/>Digital Rx"]
            E_LABS["🔬 /api/v1/labs/*<br/>Orders + Results"]
            E_BILLING["💰 /api/v1/billing/*<br/>Invoices + Payments"]
            E_BEDS["🛏️ /api/v1/beds + admissions/*<br/>Ward Management"]
            E_PHARM["💊 /api/v1/pharmacy/*<br/>Medicine + Dispense"]
            E_AI["🤖 /api/v1/ai/*<br/>chat · prescription-draft<br/>voice-parse · clinical-summary"]
            E_ORG["🏢 /api/v1/organizations/*<br/>Multi-Tenant Config"]
        end

        subgraph ENGINES["⚙️ Business Logic Engines"]
            ENG1["automationOrchestrator<br/>Workflow Automation"]
            ENG2["hospitalStateEngine<br/>Real-Time Hospital State"]
            ENG3["taskEngine<br/>Task Assignment"]
            ENG4["schedulingEngine<br/>Smart Scheduling"]
            ENG5["escalationEngine<br/>Priority Escalation"]
            ENG6["patientJourneyEngine<br/>Journey Tracking"]
            ENG7["resourceEngine<br/>Resource Allocation"]
            ENG8["avoraAI<br/>AI Decision Layer"]
        end

        SMTP["📧 emailService.ts<br/>Gmail SMTP via Nodemailer<br/>OTP Delivery"]
        INMEM["🗄️ In-Memory DB (db.ts)<br/>Multi-Tenant Data Store<br/>Organizations · Users · Patients<br/>Appointments · Prescriptions · Labs<br/>Beds · Invoices · Inventory"]
    end

    subgraph EXTERNAL["☁️ EXTERNAL SERVICES"]
        FIREBASE["🔥 Firebase<br/>Authentication<br/>Firestore DB<br/>User Profiles"]
        GEMINI["✨ Google Gemini AI<br/>Clinical Summaries<br/>AI Chat · Voice Parsing<br/>Prescription Drafts"]
        GMAIL["📨 Gmail SMTP<br/>OTP Emails<br/>Notifications"]
        VERCEL["▲ Vercel<br/>Production Hosting<br/>CI/CD Pipeline"]
        GITHUB["🐙 GitHub<br/>Source Control<br/>satyajitpratihar07/Aevora"]
    end

    SPLASH --> LOGIN
    LOGIN --> ROUTER
    ROUTER --> DASHBOARDS
    ROUTER --> AVORA_MODULES
    DASHBOARDS --- SHARED
    AVORA_MODULES --- SHARED
    CLIENT <--> CONTEXT
    CLIENT <-->|REST API Calls| SERVER
    AUTH <-->|signInWithPopup<br/>signUpWithEmail| FIREBASE
    AUTH -->|saveUserToFirestore| FIREBASE
    SERVER <-->|Gemini SDK| GEMINI
    SMTP -->|SMTP TLS| GMAIL
    VERCEL -->|Serves| CLIENT
    GITHUB -->|git push triggers| VERCEL
```

---

## 🔐 Authentication & OTP Flow

```mermaid
sequenceDiagram
    actor U as 👤 User
    participant UI as React UI<br/>(UnifiedLoginPage)
    participant CTX as AuthContext
    participant SRV as Express Server
    participant FB as Firebase Auth
    participant FS as Firestore DB
    participant SMTP as Gmail SMTP

    Note over U,SMTP: ── SIGN UP WITH OTP VERIFICATION ──

    U->>UI: Fill Name, Email, Password → "Send Code"
    UI->>SRV: POST /api/v1/auth/send-otp
    SRV->>SRV: Generate 6-digit OTP (10min TTL)
    SRV->>SMTP: sendOtpEmail(email, otpCode)
    SMTP-->>U: 📧 Email with OTP Code
    SRV-->>UI: { success: true }
    UI->>U: Show 6-box OTP input panel

    U->>UI: Enter 6 digits → "Verify"
    UI->>SRV: POST /api/v1/auth/verify-otp
    SRV->>SRV: Validate OTP + expiry check
    SRV-->>UI: { verified: true }
    UI->>FB: createUserWithEmailAndPassword()
    FB-->>CTX: Firebase User object
    CTX->>FS: saveUserToFirestore(userObj)
    FS-->>CTX: Saved ✅
    CTX-->>UI: User logged in → Route to Dashboard

    Note over U,SMTP: ── FORGOT PASSWORD FLOW ──

    U->>UI: "Forgot Password?" → Enter email
    UI->>SRV: POST /api/v1/auth/send-otp (purpose: Password Reset)
    SRV->>SMTP: sendOtpEmail(email, resetCode)
    SMTP-->>U: 📧 Reset Code Email
    U->>UI: Enter OTP → Verify
    UI->>SRV: POST /api/v1/auth/verify-otp
    SRV-->>UI: { verified: true }
    UI->>U: Show "Set New Password" form
    U->>FB: updatePassword(newPassword)
    FB-->>U: ✅ Password Updated

    Note over U,SMTP: ── GOOGLE SIGN-IN ──
    U->>UI: "Continue with Google"
    UI->>FB: signInWithPopup(googleProvider)
    FB-->>U: Native Google Account Picker
    U->>FB: Select Gmail account
    FB-->>CTX: { user.email, displayName, photoURL }
    CTX->>FS: saveUserToFirestore(userObj)
    CTX-->>UI: Route to Role Dashboard
```

---

## 🏥 Role-Based Access Control Matrix

```mermaid
graph LR
    subgraph ROLES["👥 User Roles"]
        R1["🛡️ SUPER_ADMIN"]
        R2["🏢 HOSPITAL_ADMIN"]
        R3["🩺 DOCTOR"]
        R4["💉 NURSE"]
        R5["❤️ RECEPTIONIST<br/>(Patient)"]
        R6["⚙️ TECHNICAL_STAFF"]
        R7["💊 PHARMACIST"]
        R8["🔬 LAB_TECH"]
        R9["💰 ACCOUNTANT"]
    end

    subgraph DASHBOARDS["📊 Dashboards & Modules"]
        SD["SuperAdminDashboard<br/>Platform-wide control"]
        AD["HospitalAdminDashboard<br/>Staff · Beds · Analytics"]
        DW["DoctorWorkspace<br/>EMR · Rx · AI Notes"]
        ND["NurseDashboard<br/>MAR · Vitals · Tasks"]
        PP["PatientPortal<br/>Records · Appointments"]
        TD["TechnicalDashboard<br/>Devices · Maintenance"]
        PH["PharmacistDashboard<br/>Dispense · Stock"]
        LB["LabTechDashboard<br/>Orders · Results"]
        ACC["AccountantDashboard<br/>Billing · Invoices"]
    end

    R1 --> SD
    R2 --> AD
    R3 --> DW
    R4 --> ND
    R5 --> PP
    R6 --> TD
    R7 --> PH
    R8 --> LB
    R9 --> ACC
```

---

## 🤖 AI Integration Architecture

```mermaid
graph TB
    subgraph AI_INPUT["📥 AI Input Sources"]
        V["🎙️ Voice Dictation<br/>VoiceRecorderModal"]
        C["💬 Chat Interface<br/>GeminiChatbotWidget"]
        D["🩺 Doctor Workspace<br/>Clinical Context"]
        A["📊 Admin Panel<br/>Hospital Analytics"]
    end

    subgraph GEMINI_LAYER["✨ Google Gemini AI Layer"]
        GC["chatWithGemini()<br/>General AI Assistant"]
        GP["generatePrescriptionDraft()<br/>Drug · Dosage · Instructions"]
        GV["parseVoiceDictation()<br/>Speech → Structured Data"]
        GS["generateClinicalSummary()<br/>Patient History Summary"]
        GA["adminAssistant()<br/>Operations Insights"]
    end

    subgraph AI_OUTPUT["📤 AI Outputs"]
        O1["Prescription Draft<br/>Ready for Doctor Review"]
        O2["Clinical SOAP Notes<br/>Auto-generated"]
        O3["Voice-to-Text<br/>Structured Medical Data"]
        O4["Chat Responses<br/>Medical & Admin Queries"]
        O5["Admin Insights<br/>Bed Utilization · Staffing"]
    end

    V --> GV --> O3
    C --> GC --> O4
    D --> GP --> O1
    D --> GS --> O2
    A --> GA --> O5
```

---

## 📦 Technology Stack Summary

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 + TypeScript + Vite | SPA with hot reload |
| **Styling** | TailwindCSS v4 + Inline CSS | Responsive design system |
| **Animations** | Motion (Framer Motion) | Micro-animations & transitions |
| **Charts** | Recharts | Analytics dashboards |
| **Icons** | Lucide React | 500+ medical & UI icons |
| **Backend** | Node.js + Express 4 | REST API server |
| **Auth** | Firebase Auth v12 | Email/Password + Google OAuth |
| **Database (Cloud)** | Firestore | User profiles + session data |
| **Database (Runtime)** | In-Memory Store (db.ts) | Multi-tenant HMS data |
| **AI Engine** | Google Gemini 2.0 | Clinical AI + voice parsing |
| **Email** | Nodemailer + Gmail SMTP | OTP delivery + notifications |
| **Deployment** | Vercel (CDN + Edge) | Production hosting |
| **Source Control** | GitHub | CI/CD integration |

---

## 🌐 Multi-Tenant Architecture

```mermaid
graph TB
    subgraph PLATFORM["☁️ AVORA SaaS Platform"]
        direction LR
        
        subgraph T1["🏥 Tenant: Apex Apollo Hospital"]
            T1O["org-apex-01"]
            T1U["500 Staff Users"]
            T1P["10,000 Patient Limit"]
            T1S["ENTERPRISE Plan"]
        end
        
        subgraph T2["🏢 Tenant: St. Jude Clinic"]
            T2O["org-stjude-02"]
            T2U["50 Staff Users"]
            T2P["2,000 Patient Limit"]
            T2S["PROFESSIONAL Plan"]
        end
        
        subgraph T3["⊕ New Tenant..."]
            T3N["Signup → Configure<br/>White-label Branding<br/>Custom Domain"]
        end
    end

    subgraph ISOLATION["🔒 Data Isolation"]
        TENANT_ID["x-tenant-id Header<br/>Every Request"]
        FILTER["organizationId Filter<br/>All DB Queries"]
    end

    T1O & T2O -->|organizationId| FILTER
    TENANT_ID --> FILTER
```

---

## 🗂️ Key Data Models

```mermaid
erDiagram
    Organization ||--o{ User : "has staff"
    Organization ||--o{ Department : "has departments"
    Organization ||--o{ Patient : "manages"

    Patient ||--o{ Appointment : "books"
    Patient ||--o{ Prescription : "receives"
    Patient ||--o{ LabOrder : "has tests"
    Patient ||--o{ Invoice : "billed"
    Patient ||--o{ VitalSign : "recorded"
    Patient ||--o{ Admission : "admitted"

    User ||--o{ Prescription : "writes"
    User ||--o{ LabOrder : "orders"
    User ||--o{ Appointment : "manages"

    Department ||--o{ WardBed : "has beds"
    WardBed ||--o| Admission : "assigned"

    Organization {
        string id
        string name
        string subscriptionPlan
        int patientLimit
        int staffLimit
        int aiUsageLimit
    }

    Patient {
        string id
        string patientIdNumber
        string bloodGroup
        string allergies
        string medicalHistory
    }

    User {
        string id
        string role
        string department
        string licenseNumber
        string[] permissions
    }
```

---

## 🚀 Deployment Pipeline

```mermaid
graph LR
    DEV["👨‍💻 Developer<br/>Local: npm run dev<br/>tsx server.ts → Vite HMR"] 
    -->|git push| GH["🐙 GitHub<br/>satyajitpratihar07/Aevora<br/>main branch"]
    -->|Auto-deploy| VERCEL["▲ Vercel<br/>vite build + esbuild<br/>CDN Distribution"]
    -->|Live at| PROD["🌐 Production<br/>pulsecloud-hms-saas.vercel.app<br/>HTTPS + Edge Cache"]
```

---

## 📊 Feature Matrix by Role

| Feature | Admin | Doctor | Nurse | Patient | Tech |
|---|:---:|:---:|:---:|:---:|:---:|
| Staff Management | ✅ | — | — | — | — |
| Patient Directory | ✅ | ✅ | ✅ | — | — |
| Doctor Workspace (EMR) | — | ✅ | — | — | — |
| AI Prescription Draft | — | ✅ | — | — | — |
| Voice Dictation | — | ✅ | — | — | — |
| MAR / Vitals | — | — | ✅ | — | — |
| Nursing Task Board | — | — | ✅ | — | — |
| Patient Health Record | — | — | — | ✅ | — |
| Appointment Booking | ✅ | ✅ | — | ✅ | — |
| Billing & Invoices | ✅ | — | — | ✅ | — |
| Bed Management | ✅ | — | ✅ | — | — |
| Lab Orders | ✅ | ✅ | — | ✅ | — |
| Device Monitoring | — | — | — | — | ✅ |
| Maintenance Tickets | — | — | — | — | ✅ |
| Hospital Command Center | ✅ | — | — | — | — |
| Emergency Coordinator | ✅ | ✅ | — | — | — |
| AI Analytics | ✅ | ✅ | — | — | ✅ |
| Audit Logs | ✅ | — | — | — | ✅ |
| White-label Settings | ✅ | — | — | — | — |

---

> **AVORA HMS** — *AI-Powered Hospital Operating System*  
> Built with React 19 · Firebase · Google Gemini · Node.js · Vercel  
> © 2025 AVORA Technologies · HIPAA & NABH Certified Architecture  
> 🌐 https://pulsecloud-hms-saas.vercel.app
