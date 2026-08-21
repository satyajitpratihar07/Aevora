import React, { useEffect, useState, useRef } from "react";
import {
  Activity, Shield, Zap, CheckCircle2, Building2, Stethoscope,
  Microscope, Pill, BedDouble, CreditCard, Mic, ArrowRight,
  Lock, Globe, Sparkles, HeartPulse, Brain, FlaskConical,
  TrendingUp, Clock, AlertTriangle, ChevronRight, ChevronLeft, Users,
  Search, Calendar, MapPin, Phone, Video, Award, FileText,
  ChevronDown, X, Star, Check, Filter, Heart, Eye,
  RefreshCw, Send, MessageSquare, ShieldAlert, Sparkle, ShieldCheck,
  Radio, Crosshair, Thermometer, UserCheck, Strikethrough, Plus,
  MoreHorizontal, MoreVertical, Baby, Bone, Smile, LayoutGrid, ListFilter
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { UserRole } from "../../types/index.js";

interface LandingPageProps {
  onLaunchApp: () => void;
  onSelectRole: (role: UserRole) => void;
}

interface Specialty {
  id: string;
  name: string;
  shortName?: string;
  doctorsCount: string;
  description: string;
  symptoms: string[];
  iconBg: string;
  iconColor: string;
  badge?: string;
  featuredDoctors: string[];
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experience: string;
  rating: number;
  reviews: number;
  hospital: string;
  availability: string;
  fee: string;
  image: string;
}

interface MegaMenuItem {
  name: string;
  highlighted?: boolean;
  icon: React.FC<{ className?: string }>;
}

const ECGWaveform: React.FC<{ color?: string }> = ({ color = "#0284c7" }) => (
  <svg viewBox="0 0 400 80" className="w-full h-full" preserveAspectRatio="none">
    <defs>
      <linearGradient id="avoraEcgGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={color} stopOpacity="0" />
        <stop offset="35%" stopColor={color} stopOpacity="1" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient>
      <filter id="avoraGlow">
        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <path
      d="M0,40 L50,40 L65,40 L70,12 L80,68 L90,2 L100,68 L110,40 L125,40 L190,40 L205,40 L210,12 L220,68 L230,2 L240,68 L250,40 L265,40 L330,40 L345,40 L350,12 L360,68 L370,2 L380,68 L390,40 L400,40"
      fill="none"
      stroke="url(#avoraEcgGrad)"
      strokeWidth="2.8"
      filter="url(#avoraGlow)"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        strokeDasharray: 1000,
        strokeDashoffset: 1000,
        animation: "avoraEcgDraw 2.8s ease-in-out infinite",
      }}
    />
  </svg>
);

const AnimatedCounter: React.FC<{ target: number; suffix?: string }> = ({ target, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const steps = 50;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(current));
        }, 1500 / steps);
      }
    }, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// 24 Specialty Master Data
const SPECIALTIES: Specialty[] = [
  {
    id: "gen_physician",
    name: "General Physician",
    doctorsCount: "480+ Doctors",
    description: "Primary care, fever, diabetes management, viral infections, & preventive health checkups.",
    symptoms: ["Fever & Chills", "Cold & Cough", "Body Pain & Fatigue", "High Blood Pressure", "General Wellness"],
    iconBg: "bg-blue-50 border-blue-100",
    iconColor: "text-blue-600",
    badge: "24/7 Available",
    featuredDoctors: ["Dr. Rajesh Sharma", "Dr. Meera Patel"]
  },
  {
    id: "dermatology",
    name: "Dermatology",
    doctorsCount: "320+ Doctors",
    description: "Expert care for skin disorders, acne, hair loss, eczema, psoriasis, and cosmetic procedures.",
    symptoms: ["Acne & Pimple Breakouts", "Hair Loss & Dandruff", "Skin Rashes & Allergies", "Pigmentation", "Fungal Infection"],
    iconBg: "bg-amber-50 border-amber-100",
    iconColor: "text-amber-600",
    badge: "Top Rated",
    featuredDoctors: ["Dr. Arvind Kejriwal", "Dr. Shalini Rai"]
  },
  {
    id: "obgyn",
    name: "Obstetrics & Gynaecology",
    doctorsCount: "350+ Doctors",
    description: "Comprehensive women's health care, pregnancy monitoring, PCOD/PCOS, and infertility treatment.",
    symptoms: ["Irregular Periods", "Pregnancy Care & ANC", "PCOD / PCOS", "Pelvic Pain", "Menopause Guidance"],
    iconBg: "bg-rose-50 border-rose-100",
    iconColor: "text-rose-600",
    badge: "Women Care",
    featuredDoctors: ["Dr. Priya Sharma", "Dr. Anita Desai"]
  },
  {
    id: "ortho",
    name: "Orthopaedics",
    doctorsCount: "410+ Doctors",
    description: "Bone & joint surgery, fracture care, arthritis treatment, sports injury rehab, and spine surgery.",
    symptoms: ["Joint & Knee Pain", "Backache & Sciatica", "Bone Fractures", "Arthritis", "Sports Injury"],
    iconBg: "bg-sky-50 border-sky-100",
    iconColor: "text-sky-600",
    featuredDoctors: ["Dr. Vikramaditya Roy", "Dr. Suresh Nambiar"]
  },
  {
    id: "ent",
    name: "ENT",
    doctorsCount: "230+ Doctors",
    description: "Diagnosis and treatment of Ear, Nose, Throat, sinusitis, hearing loss, and thyroid disorders.",
    symptoms: ["Ear Pain & Infection", "Sinus & Nasal Block", "Sore Throat & Tonsils", "Vertigo & Dizziness", "Hearing Issues"],
    iconBg: "bg-teal-50 border-teal-100",
    iconColor: "text-teal-600",
    featuredDoctors: ["Dr. Alok Verma", "Dr. Ritu Malhotra"]
  },
  {
    id: "neuro",
    name: "Neurology",
    doctorsCount: "210+ Doctors",
    description: "Advanced neurological care for migraine, stroke, epilepsy, nerve disorders, & memory loss.",
    symptoms: ["Severe Headache / Migraine", "Numbness & Tingling", "Seizures & Fits", "Memory Loss", "Tremors & Parkinsonism"],
    iconBg: "bg-purple-50 border-purple-100",
    iconColor: "text-purple-600",
    badge: "Specialized",
    featuredDoctors: ["Dr. Rajesh Kumar", "Dr. Sunita Rao"]
  },
  {
    id: "cardio",
    name: "Cardiology",
    doctorsCount: "430+ Doctors",
    description: "World-class heart care, angiography, ECG monitoring, hypertension management, & cardiac rehabilitation.",
    symptoms: ["Chest Pain & Discomfort", "Shortness of Breath", "High BP / Palpitations", "Dizziness", "Swollen Legs"],
    iconBg: "bg-emerald-50 border-emerald-100",
    iconColor: "text-emerald-600",
    badge: "AVORA Core",
    featuredDoctors: ["Dr. Ananya Deshmukh", "Dr. K. S. Reddy"]
  },
  {
    id: "uro",
    name: "Urology",
    doctorsCount: "190+ Doctors",
    description: "Treatment for kidney stones, prostate enlargement, urinary tract infections, and male fertility.",
    symptoms: ["Kidney Stones", "Burning Urination", "Prostate Enlargement", "Blood in Urine", "Male Infertility"],
    iconBg: "bg-orange-50 border-orange-100",
    iconColor: "text-orange-600",
    featuredDoctors: ["Dr. Nitin Saxena", "Dr. Ramesh Gupta"]
  },
  {
    id: "gastro",
    name: "Gastroenterology / GI",
    doctorsCount: "260+ Doctors",
    description: "Stomach, liver, pancreas, and intestinal disease treatment, endoscopy, & fatty liver care.",
    symptoms: ["Acidity & Gas", "Stomach Pain & Ulcers", "Fatty Liver & Jaundice", "Constipation / Diarrhea", "GERD & Heartburn"],
    iconBg: "bg-yellow-50 border-yellow-100",
    iconColor: "text-yellow-700",
    featuredDoctors: ["Dr. Mahesh Joshi", "Dr. Kavita Shenoy"]
  },
  {
    id: "psychiatry",
    name: "Psychiatry",
    doctorsCount: "185+ Doctors",
    description: "Compassionate mental healthcare for anxiety, depression, insomnia, OCD, and stress disorders.",
    symptoms: ["Anxiety & Panic Attacks", "Depression & Low Mood", "Insomnia / Sleep Issues", "Stress & Burnout", "Mood Swings"],
    iconBg: "bg-indigo-50 border-indigo-100",
    iconColor: "text-indigo-600",
    featuredDoctors: ["Dr. Sameer Parikh", "Dr. Rohini Iyengar"]
  },
  {
    id: "paediatrics",
    name: "Paediatrics",
    doctorsCount: "310+ Doctors",
    description: "Specialized child health care, newborn monitoring, growth tracking, and vaccination schedules.",
    symptoms: ["Child Fever & Cold", "Infant Vaccination", "Growth Delay", "Pediatric Asthma", "Loss of Appetite"],
    iconBg: "bg-cyan-50 border-cyan-100",
    iconColor: "text-cyan-600",
    badge: "Child Care",
    featuredDoctors: ["Dr. Sunita Menon", "Dr. Harish Kapoor"]
  },
  {
    id: "pulmono",
    name: "Pulmonology",
    doctorsCount: "220+ Doctors",
    description: "Comprehensive respiratory care for asthma, COPD, pneumonia, sleep apnea, and lung infections.",
    symptoms: ["Chronic Cough", "Wheezing & Asthma", "Difficulty Breathing", "Sleep Apnea / Snoring", "Post-COVID Lung Care"],
    iconBg: "bg-blue-50 border-blue-100",
    iconColor: "text-blue-700",
    featuredDoctors: ["Dr. Zarir Udwadia", "Dr. Vikas Goyal"]
  },
  {
    id: "endo",
    name: "Endocrinology",
    doctorsCount: "195+ Doctors",
    description: "Expert hormonal balance care for thyroid disorders, gestational diabetes, and metabolic disease.",
    symptoms: ["Thyroid Imbalance", "Unexplained Weight Gain/Loss", "Diabetes Control", "Hormonal Hair Growth", "Adrenal Issues"],
    iconBg: "bg-violet-50 border-violet-100",
    iconColor: "text-violet-600",
    featuredDoctors: ["Dr. Shashank Joshi", "Dr. Archana Roy"]
  },
  {
    id: "nephro",
    name: "Nephrology",
    doctorsCount: "165+ Doctors",
    description: "Specialized care for chronic kidney disease, dialysis management, protein in urine, & hypertension.",
    symptoms: ["Swelling in Ankles & Eyes", "High Creatinine", "Dialysis Consultation", "Proteinuria", "Polycystic Kidney"],
    iconBg: "bg-amber-50 border-amber-100",
    iconColor: "text-amber-700",
    featuredDoctors: ["Dr. Sandeep Guleria", "Dr. Vivek Pathak"]
  },
  {
    id: "neurosurg",
    name: "Neurosurgery",
    doctorsCount: "140+ Doctors",
    description: "Advanced brain tumor surgery, spine disc replacement, head trauma, and cerebrovascular surgery.",
    symptoms: ["Brain Tumor Symptoms", "Slipped Disc / Sciatica", "Spinal Cord Injury", "Aneurysm", "Trigeminal Neuralgia"],
    iconBg: "bg-slate-100 border-slate-200",
    iconColor: "text-slate-700",
    badge: "Surgical",
    featuredDoctors: ["Dr. B. K. Misra", "Dr. Rana Patir"]
  },
  {
    id: "rheum",
    name: "Rheumatology",
    doctorsCount: "125+ Doctors",
    description: "Treatment for autoimmune disorders, rheumatoid arthritis, lupus, gout, and ankylosing spondylitis.",
    symptoms: ["Morning Joint Stiffness", "Rheumatoid Arthritis", "Lupus (SLE)", "Gout & High Uric Acid", "Muscle Inflammation"],
    iconBg: "bg-rose-50 border-rose-100",
    iconColor: "text-rose-700",
    featuredDoctors: ["Dr. Rohini Handa", "Dr. S. K. Das"]
  },
  {
    id: "ophthal",
    name: "Ophthalmology",
    doctorsCount: "270+ Doctors",
    description: "Comprehensive eye checkups, cataract surgery, LASIK vision correction, glaucoma, & retina care.",
    symptoms: ["Blurry Vision", "Cataract", "Redness & Eye Pain", "Dry Eyes", "Glaucoma Checkup"],
    iconBg: "bg-emerald-50 border-emerald-100",
    iconColor: "text-emerald-700",
    featuredDoctors: ["Dr. Mahipal Sachdev", "Dr. Ritika Sharma"]
  },
  {
    id: "surg_gastro",
    name: "Surgical Gastroenterology",
    doctorsCount: "145+ Doctors",
    description: "Minimally invasive GI surgery, gallbladder removal, liver transplant, and bariatric surgery.",
    symptoms: ["Gallstones", "Hernia", "Appendicitis", "Bariatric Surgery", "Colon & Liver Surgery"],
    iconBg: "bg-lime-50 border-lime-100",
    iconColor: "text-lime-700",
    featuredDoctors: ["Dr. Adarsh Chaudhary", "Dr. P. S. Rao"]
  },
  {
    id: "inf_dis",
    name: "Infectious Disease",
    doctorsCount: "155+ Doctors",
    description: "Expert care for tropical fever, dengue, malaria, typhoid, chronic infection, & HIV care.",
    symptoms: ["Dengue / Chikungunya", "Typhoid & Malaria", "Unexplained High Fever", "Tuberculosis (TB)", "Fungal & Viral Outbreaks"],
    iconBg: "bg-red-50 border-red-100",
    iconColor: "text-red-600",
    featuredDoctors: ["Dr. Camilla Rodrigues", "Dr. V. Ramasubramanian"]
  },
  {
    id: "gen_surg",
    name: "General & Laparoscopic",
    doctorsCount: "290+ Doctors",
    description: "Keyhole laparoscopic surgery, hernia repair, thyroidectomy, piles, and trauma surgery.",
    symptoms: ["Laparoscopic Surgery", "Hernia Repair", "Piles & Fissures", "Gallbladder Stones", "Swelling & Cysts"],
    iconBg: "bg-cyan-50 border-cyan-100",
    iconColor: "text-cyan-700",
    featuredDoctors: ["Dr. Pradeep Chowbey", "Dr. Sanjay Kumar"]
  },
  {
    id: "psychology",
    name: "Psychology",
    doctorsCount: "175+ Doctors",
    description: "Psychotherapy, cognitive behavioral therapy (CBT), relationship counseling, and child therapy.",
    symptoms: ["Relationship Issues", "Behavioral Therapy", "Child Counseling", "Grief & Trauma", "Career Anxiety"],
    iconBg: "bg-pink-50 border-pink-100",
    iconColor: "text-pink-600",
    featuredDoctors: ["Dr. Rachna Singh", "Dr. Neerja Birla"]
  },
  {
    id: "oncology",
    name: "Medical Oncology",
    doctorsCount: "190+ Doctors",
    description: "Comprehensive cancer diagnosis, chemotherapy, immunotherapy, targeted therapy, & second opinions.",
    symptoms: ["Cancer Screening", "Chemotherapy Consult", "Tumor Evaluation", "Immunotherapy", "Second Opinion"],
    iconBg: "bg-purple-50 border-purple-100",
    iconColor: "text-purple-700",
    badge: "Cancer Care",
    featuredDoctors: ["Dr. Suresh Advani", "Dr. Harit Chaturvedi"]
  },
  {
    id: "diab",
    name: "Diabetology",
    doctorsCount: "230+ Doctors",
    description: "Specialized Type 1 & Type 2 diabetes management, insulin pump therapy, & diabetic foot care.",
    symptoms: ["High Blood Sugar (HbA1c)", "Frequent Urination & Thirst", "Diabetic Foot Care", "Insulin Dosage Adjustment", "Hypoglycemia"],
    iconBg: "bg-sky-50 border-sky-100",
    iconColor: "text-sky-700",
    featuredDoctors: ["Dr. V. Mohan", "Dr. Ambrish Mithal"]
  },
  {
    id: "dentist",
    name: "Dentist",
    doctorsCount: "340+ Doctors",
    description: "Dental implants, root canal treatment, braces, teeth whitening, and oral surgery.",
    symptoms: ["Toothache & Cavity", "Root Canal (RCT)", "Dental Implants", "Bleeding Gums", "Braces & Aligners"],
    iconBg: "bg-emerald-50 border-emerald-100",
    iconColor: "text-emerald-600",
    featuredDoctors: ["Dr. Gunita Singh", "Dr. Rajesh Kedia"]
  }
];

// MEGA MENU 4-COLUMN DATA STRUCTURE (Matching user screenshot!)
const MEGA_MENU_COLUMNS: { categoryId: string; title: string; items: MegaMenuItem[] }[] = [
  {
    categoryId: "col1",
    title: "Specialized Medicine",
    items: [
      { name: "Cardiac Sciences", icon: HeartPulse },
      { name: "Nephrology", icon: Activity },
      { name: "Diabetology/Endocrinology", icon: Pill },
      { name: "Foetal Medicine", icon: Sparkles },
      { name: "Infectious Diseases", icon: ShieldAlert },
      { name: "Mental Health and Behavioural Sciences", icon: Brain },
      { name: "Oncology", icon: FlaskConical },
      { name: "Orthopaedics", icon: Bone },
      { name: "Physiotherapy and Rehabilitation", icon: Activity },
      { name: "Rheumatology", icon: Crosshair },
      { name: "Urology", icon: Stethoscope },
    ]
  },
  {
    categoryId: "col2",
    title: "Critical & Surgery",
    items: [
      { name: "Nuclear Medicine", icon: Radio },
      { name: "Critical Care", icon: HeartPulse },
      { name: "Emergency and Trauma", icon: Phone },
      { name: "General Surgery", icon: Stethoscope },
      { name: "Internal Medicine", icon: Pill },
      { name: "Neurointerventional Radiology", icon: Brain },
      { name: "Obstetrics and Gynaecology", icon: Heart },
      { name: "Paediatrics", icon: Baby },
      { name: "Plastic and Reconstructive Surgery", icon: Sparkle },
      { name: "Support Specialties", icon: Users },
      { name: "Vascular Surgery", icon: Activity },
    ]
  },
  {
    categoryId: "col3",
    title: "Advanced Disciplines",
    items: [
      { name: "Infertility medicine", icon: Heart },
      { name: "Dental Science", highlighted: true, icon: Smile },
      { name: "Endocrine Surgery", icon: Thermometer },
      { name: "Geriatric Medicine", icon: UserCheck },
      { name: "Liver Transplant and Hepatobiliary Sciences", icon: Activity },
      { name: "Neurology", icon: Brain },
      { name: "Ophthalmology", icon: Eye },
      { name: "Pain and Palliative Medicine", icon: HeartPulse },
      { name: "Pulmonology", icon: Activity },
      { name: "Thoracic Surgery", icon: HeartPulse },
    ]
  },
  {
    categoryId: "col4",
    title: "Transplant & Diagnostics",
    items: [
      { name: "Gastroenterology and Hepatobiliary Sciences", icon: Activity },
      { name: "Dermatology", icon: Sparkle },
      { name: "ENT", icon: Radio },
      { name: "Haematology", icon: FlaskConical },
      { name: "Medical Genetics", icon: Microscope },
      { name: "Neurosurgery", icon: Brain },
      { name: "Organ Transplant", icon: HeartPulse },
      { name: "Palliative Medicine", icon: Heart },
      { name: "Radiology", icon: Eye },
      { name: "Transfusion Medicine", icon: Pill },
    ]
  }
];

// Featured AVORA Doctors
const FEATURED_DOCTORS: Doctor[] = [
  {
    id: "doc1",
    name: "Dr. Ananya Deshmukh",
    specialty: "Senior Consultant — Cardiology",
    qualification: "MBBS, MD, DM (Cardiology), FACC",
    experience: "18+ Years Exp.",
    rating: 4.9,
    reviews: 1420,
    hospital: "AVORA Indraprastha Hospital, New Delhi",
    availability: "Available Today at 2:30 PM",
    fee: "₹1,200",
    image: "https://images.unsplash.com/photo-1594824813566-7885a3977346?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "doc2",
    name: "Dr. Rajesh Kumar",
    specialty: "HOD — Neurology & Stroke Care",
    qualification: "MBBS, MD, DM (Neurology)",
    experience: "22+ Years Exp.",
    rating: 4.9,
    reviews: 1890,
    hospital: "AVORA Hospitals, Greams Road, Chennai",
    availability: "Available Tomorrow at 10:00 AM",
    fee: "₹1,500",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "doc3",
    name: "Dr. Priya Sharma",
    specialty: "Lead Specialist — Obstetrics & Gynaecology",
    qualification: "MBBS, MS (OB-GYN), FICOG",
    experience: "15+ Years Exp.",
    rating: 4.8,
    reviews: 1150,
    hospital: "AVORA Jubilee Hills, Hyderabad",
    availability: "Available Today at 4:15 PM",
    fee: "₹1,000",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "doc4",
    name: "Dr. Vikramaditya Roy",
    specialty: "Chief Surgeon — Orthopaedics & Spine",
    qualification: "MBBS, MS (Ortho), M.Ch (UK)",
    experience: "20+ Years Exp.",
    rating: 4.9,
    reviews: 2100,
    hospital: "AVORA Multispeciality Hospital, Kolkata",
    availability: "Available Today at 5:00 PM",
    fee: "₹1,400",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80"
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp, onSelectRole }) => {
  // State for tabs & search
  const [activeTab, setActiveTab] = useState<"doctors" | "lab" | "pharmacy" | "beds" | "ai">("doctors");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Delhi NCR");
  const [specialtySearch, setSpecialtySearch] = useState("");

  // EMBEDDED PAGE SIDEBAR STATE
  const [activeSidebarCategory, setActiveSidebarCategory] = useState<string>("all");
  const [isSidebarPanelVisible, setIsSidebarPanelVisible] = useState(true);

  // Interactive Modal state
  const [activeSpecialtyModal, setActiveSpecialtyModal] = useState<Specialty | null>(null);
  const [bookingModalDoctor, setBookingModalDoctor] = useState<Doctor | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  
  // AI Symptom Checker State
  const [aiInput, setAiInput] = useState("");
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{ department: string; urgency: string; summary: string } | null>(null);

  // Vitals State
  const [vitals, setVitals] = useState({ hr: 74, spo2: 99, temp: 98.4, bp: "118/78" });

  useEffect(() => {
    const iv = setInterval(() => {
      setVitals({
        hr: 68 + Math.floor(Math.random() * 14),
        spo2: 97 + Math.floor(Math.random() * 3),
        temp: parseFloat((98.1 + Math.random() * 0.7).toFixed(1)),
        bp: `${116 + Math.floor(Math.random() * 12)}/${74 + Math.floor(Math.random() * 8)}`,
      });
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  // 5-Banner Auto Carousel State (5 seconds per slide)
  const [activeBanner, setActiveBanner] = useState(0);
  const [bannerPaused, setBannerPaused] = useState(false);

  useEffect(() => {
    if (bannerPaused) return;
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % 5);
    }, 5000);
    return () => clearInterval(timer);
  }, [bannerPaused]);

  // Filtered Specialties
  const filteredSpecialties = SPECIALTIES.filter((s) =>
    s.name.toLowerCase().includes(specialtySearch.toLowerCase()) ||
    s.description.toLowerCase().includes(specialtySearch.toLowerCase()) ||
    s.symptoms.some(sym => sym.toLowerCase().includes(specialtySearch.toLowerCase()))
  );

  // Helper to trigger specialty modal from Mega Menu item
  const handleSelectMegaMenuItem = (itemName: string) => {
    const matched = SPECIALTIES.find(s => s.name.toLowerCase().includes(itemName.toLowerCase()) || itemName.toLowerCase().includes(s.name.toLowerCase()));
    if (matched) {
      setActiveSpecialtyModal(matched);
    } else {
      setActiveSpecialtyModal({
        id: itemName.toLowerCase().replace(/[^a-z0-9]/g, "_"),
        name: itemName,
        doctorsCount: "150+ Doctors",
        description: `Expert clinical care, advanced diagnostics, and specialist consultations in ${itemName}.`,
        symptoms: ["Specialized Evaluation", "Second Opinion", "Clinical Triage", "Diagnostic Scan"],
        iconBg: "bg-indigo-50 border-indigo-100",
        iconColor: "text-indigo-600",
        badge: "Specialist Institute",
        featuredDoctors: ["Dr. Ananya Deshmukh", "Dr. Rajesh Kumar"]
      });
    }
  };

  // AI Triage Handler
  const handleRunAiTriage = () => {
    if (!aiInput.trim()) return;
    setAiAnalyzing(true);
    setAiResult(null);
    setTimeout(() => {
      setAiAnalyzing(false);
      const text = aiInput.toLowerCase();
      if (text.includes("chest") || text.includes("heart") || text.includes("bp") || text.includes("breath")) {
        setAiResult({
          department: "Cardiology",
          urgency: "Moderate to High",
          summary: "Based on symptoms of chest discomfort/breathlessness, immediate consultation with Dr. Ananya Deshmukh (Cardiology) is recommended. ECG advised."
        });
      } else if (text.includes("skin") || text.includes("rash") || text.includes("acne") || text.includes("hair")) {
        setAiResult({
          department: "Dermatology",
          urgency: "Routine",
          summary: "Symptoms suggest dermatological evaluation. Dr. Arvind Kejriwal (Dermatology) is available for online tele-consultation within 15 minutes."
        });
      } else if (text.includes("fever") || text.includes("cold") || text.includes("cough")) {
        setAiResult({
          department: "General Physician / Pulmonology",
          urgency: "Mild",
          summary: "Symptoms suggest viral infection or mild upper respiratory tract congestion. Hydration & tele-consult with General Physician recommended."
        });
      } else {
        setAiResult({
          department: "General Physician",
          urgency: "Routine Assessment",
          summary: "Gemini AI recommends starting with a General Physician for comprehensive diagnosis and triage."
        });
      }
    }, 1200);
  };

  // Scroll to Specialties Section when clicking 3-dots in top bar
  const scrollToSpecialties = () => {
    setIsSidebarPanelVisible(true);
    const el = document.getElementById("specialties");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <style>{`
        @keyframes avoraEcgDraw {
          0% { stroke-dashoffset: 1000; opacity: 0.3; }
          40% { opacity: 1; }
          80% { opacity: 1; }
          100% { stroke-dashoffset: -1000; opacity: 0.3; }
        }
        @keyframes avoraPulseGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(2, 132, 199, 0.25); }
          50% { box-shadow: 0 0 35px rgba(2, 132, 199, 0.5); }
        }
        .avora-glow { animation: avoraPulseGlow 3s infinite ease-in-out; }
      `}</style>

      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-sky-500 selection:text-white pb-20">
        
        {/* 1. TOP EMERGENCY & ANNOUNCEMENT TICKER (AVORA 24/7 Style) */}
        <div className="bg-gradient-to-r from-blue-900 via-sky-900 to-emerald-950 text-white text-xs py-2 px-4 border-b border-sky-800/50">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1.5 bg-rose-600/90 text-white px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider animate-pulse">
                <Phone className="w-3 h-3" />
                <span>24/7 Emergency Line</span>
              </span>
              <span className="font-semibold text-slate-200 text-xs">Call 1066 / +91-1800-425-2222</span>
              <span className="hidden md:inline text-sky-400">|</span>
              <span className="hidden md:flex items-center space-x-1 text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>AVORA AI Clinical Assistant Active</span>
              </span>
            </div>

            <div className="flex items-center space-x-4 text-[11px] text-sky-200">
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-transparent text-white font-bold cursor-pointer outline-none border-b border-sky-500/50 pb-0.5"
                >
                  <option value="Delhi NCR" className="bg-slate-900 text-white">Delhi NCR (AVORA Indraprastha)</option>
                  <option value="Mumbai" className="bg-slate-900 text-white">Mumbai (AVORA Navi Mumbai)</option>
                  <option value="Bengaluru" className="bg-slate-900 text-white">Bengaluru (AVORA Bannerghatta)</option>
                  <option value="Chennai" className="bg-slate-900 text-white">Chennai (AVORA Greams Road)</option>
                  <option value="Hyderabad" className="bg-slate-900 text-white">Hyderabad (AVORA Jubilee Hills)</option>
                  <option value="Global Campus" className="bg-slate-900 text-white">Global Enterprise Campus</option>
                </select>
              </div>
              <button
                onClick={onLaunchApp}
                className="hover:text-white transition underline font-bold flex items-center gap-1 text-sky-300"
              >
                <span>Institutional Login</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. MAIN HEADER WITH TOP BAR 3-DOT SIDEBAR EXPLORER BUTTON */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
            
            {/* Logo */}
            <div className="flex items-center space-x-3 shrink-0">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-sky-500/30 ring-2 ring-sky-100">
                  <Activity className="w-6 h-6 animate-pulse" />
                </div>
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-black text-2xl text-slate-900 tracking-tight">AVORA</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    AVORA OS
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Enterprise Healthcare & Clinical SaaS</p>
              </div>
            </div>

            {/* Header Search Bar */}
            <div className="hidden lg:flex items-center flex-1 max-w-md relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                placeholder="Search Doctors, Specialties, Hospitals, Labs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
              />
            </div>

            {/* Navigation & TOP BAR 3-DOTS BUTTON */}
            <div className="flex items-center space-x-3">
              <a href="#specialties" className="hidden md:inline-block text-xs font-bold text-slate-700 hover:text-sky-600 transition">
                Browse Specialties
              </a>

              {/* 3-DOTS BUTTON IN TOP BAR */}
              <button
                onClick={scrollToSpecialties}
                className="group relative px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-800 hover:text-sky-700 border border-slate-200 text-xs font-black transition flex items-center space-x-2 shadow-xs hover:border-sky-300"
                title="Toggle Sidebar & Listed Sections"
              >
                <div className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  <MoreVertical className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-xs">3-Dots (Sidebar Options)</span>
              </button>

              <a href="#services" className="hidden lg:inline-block text-xs font-bold text-slate-700 hover:text-sky-600 transition">
                Services
              </a>
              <a href="#doctors" className="hidden lg:inline-block text-xs font-bold text-slate-700 hover:text-sky-600 transition">
                Doctors
              </a>

              <button
                onClick={onLaunchApp}
                className="group relative overflow-hidden px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 text-white font-bold text-xs shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:scale-[1.02] transition-all flex items-center space-x-2 shrink-0"
              >
                <span>Launch Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </header>

        {/* 3. AVORA 5-BANNER AUTOMATED HERO CAROUSEL (Apollo-Style Light Medical Banner matching 1st image) */}
        <section
          className="relative py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
          onMouseEnter={() => setBannerPaused(true)}
          onMouseLeave={() => setBannerPaused(false)}
        >
          {/* Main Outer Banner Card Container */}
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-sky-200/60 border border-sky-200/80 bg-gradient-to-r from-sky-100 via-blue-50 to-cyan-100 text-slate-900 min-h-[460px] flex flex-col justify-between p-6 sm:p-10 lg:p-12 transition-all duration-700">
            
            {/* Background Medical Cross Pattern Watermark */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%3C%230284c7' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 16h40v8H0z'/%3E%3Cpath d='M16 0h8v40h-8z'/%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: "60px 60px"
              }}
            />

            {/* Left Floating Side Arrow Button */}
            <button
              onClick={() => setActiveBanner((prev) => (prev - 1 + 5) % 5)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-sky-200 text-sky-700 hover:text-orange-500 hover:border-orange-300 hover:scale-110 shadow-lg flex items-center justify-center transition cursor-pointer"
              title="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Right Floating Side Arrow Button */}
            <button
              onClick={() => setActiveBanner((prev) => (prev + 1) % 5)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-sky-200 text-sky-700 hover:text-orange-500 hover:border-orange-300 hover:scale-110 shadow-lg flex items-center justify-center transition cursor-pointer"
              title="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Banner Content Grid */}
            <div className="relative z-10 my-auto grid lg:grid-cols-12 gap-8 items-center px-4 sm:px-6">
              
              {/* Left Column: Headlines & Sub-features */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* Top Badge: Speech Bubble Style Orange Tag */}
                <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-orange-500 text-white font-black text-xs shadow-md shadow-orange-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                  <span>
                    {activeBanner === 0 && "Direct From AVORA Healthcare"}
                    {activeBanner === 1 && "Gemini AI Clinical Triage"}
                    {activeBanner === 2 && "24/7 ICU Telemetry Mesh"}
                    {activeBanner === 3 && "Code Red Emergency Dispatch"}
                    {activeBanner === 4 && "Zero Waiting Time OPD"}
                  </span>
                  {/* Speech bubble tail notch */}
                  <span className="absolute -bottom-1.5 left-5 border-t-[8px] border-t-orange-500 border-x-[6px] border-x-transparent" />
                </div>

                {/* Main Headline */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                  {activeBanner === 0 && (
                    <>Fast & Accurate Lab Tests<br /><span className="text-sky-700">& Tele-Triage At Home</span></>
                  )}
                  {activeBanner === 1 && (
                    <>Ambient AI Clinical Triage<br /><span className="text-purple-700">& Prescription Drafting</span></>
                  )}
                  {activeBanner === 2 && (
                    <>Continuous ICU Telemetry<br /><span className="text-teal-700">& Ward Bed Occupancy</span></>
                  )}
                  {activeBanner === 3 && (
                    <>Rapid Emergency Response<br /><span className="text-rose-700">& Task Escalation Engine</span></>
                  )}
                  {activeBanner === 4 && (
                    <>Smart OPD Queue Dispatch<br /><span className="text-blue-700">& Zero Waiting Time</span></>
                  )}
                </h1>

                {/* White Circle Feature Badges (Matching 1st image!) */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-sky-100 shadow-md shadow-sky-100">
                    <div className="w-9 h-9 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-xs text-slate-900">Same Day Reports</p>
                      <p className="text-[10px] text-slate-500 font-semibold">100% NABH Certified</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-sky-100 shadow-md shadow-sky-100">
                    <div className="w-9 h-9 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-xs text-slate-900">Home Sample Collection</p>
                      <p className="text-[10px] text-slate-500 font-semibold">Dispatch in 30 Mins</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Prominent Large Orange "Book Now" Button */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-4">
                <button
                  onClick={onLaunchApp}
                  className="group relative px-10 py-5 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xl sm:text-2xl shadow-xl shadow-orange-300 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
                >
                  <span>Book Now</span>
                  <ArrowRight className="w-7 h-7 group-hover:translate-x-1.5 transition-transform" />
                </button>

                <button
                  onClick={() => onSelectRole(activeBanner === 1 ? 'DOCTOR' : activeBanner === 2 ? 'NURSE' : activeBanner === 4 ? 'RECEPTIONIST' : 'HOSPITAL_ADMIN')}
                  className="text-xs font-bold text-slate-600 hover:text-sky-700 underline transition"
                >
                  Or Open Demo Role Workspace →
                </button>
              </div>

            </div>

            {/* Bottom Centered Dots Pagination Indicator (Matching 1st image!) */}
            <div className="relative z-10 flex items-center justify-center gap-2 pt-6">
              {[0, 1, 2, 3, 4].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveBanner(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    activeBanner === idx
                      ? "w-8 h-2 bg-teal-600 shadow-sm shadow-teal-300"
                      : "w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                  title={`Slide ${idx + 1}`}
                />
              ))}
            </div>

          </div>
        </section>

        {/* 4. EMBEDDED PAGE SIDEBAR + LISTED SECTIONS DIRECTORY (Exact Match to Screenshot Columns!) */}
        <section id="specialties" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Section Title & Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-2">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Embedded Sidebar & Listed Directory</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Browse Clinical Specialties & Services</h2>
              <p className="text-slate-600 text-xs font-medium mt-1">
                Select a category from the sidebar to view all listed medical options across 40+ specialized departments.
              </p>
            </div>

            {/* Filter Input */}
            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Filter across 42+ options..."
                  value={specialtySearch}
                  onChange={(e) => setSpecialtySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                />
              </div>

              <button
                onClick={() => setIsSidebarPanelVisible(!isSidebarPanelVisible)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition border border-slate-200"
              >
                <MoreVertical className="w-4 h-4 text-sky-600" />
                <span className="hidden sm:inline">{isSidebarPanelVisible ? "Hide Sidebar" : "Show Sidebar"}</span>
              </button>
            </div>
          </div>

          {/* SIDEBAR + LISTED SECTIONS GRID LAYOUT */}
          <div className="grid grid-cols-12 gap-6 items-start">
            
            {/* LEFT SIDEBAR PANEL (PAGE-EMBEDDED) */}
            {isSidebarPanelVisible && (
              <div className="col-span-12 md:col-span-4 lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-4 sticky top-24">
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                      <MoreVertical className="w-4 h-4" />
                    </div>
                    <span className="font-black text-sm text-slate-900">Department Sidebar</span>
                  </div>
                  <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                    42+ Listed
                  </span>
                </div>

                {/* Sidebar Navigation Items */}
                <div className="space-y-1">
                  {[
                    { id: "all", name: "All 42+ Medical Specialties", icon: LayoutGrid, badge: "Full Menu" },
                    { id: "col1", name: "Specialized Medicine", icon: HeartPulse, count: "11 Options" },
                    { id: "col2", name: "Critical & Surgery", icon: Stethoscope, count: "11 Options" },
                    { id: "col3", name: "Advanced & Dental Science", icon: Smile, highlighted: true, count: "10 Options" },
                    { id: "col4", name: "Transplant & Diagnostics", icon: FlaskConical, count: "10 Options" },
                  ].map((cat) => {
                    const Icon = cat.icon;
                    const active = activeSidebarCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveSidebarCategory(cat.id)}
                        className={`w-full text-left px-3.5 py-3 rounded-2xl transition duration-200 flex items-center justify-between text-xs font-bold border ${
                          active
                            ? "bg-gradient-to-r from-blue-600 to-sky-600 text-white border-transparent shadow-md"
                            : cat.highlighted
                            ? "bg-rose-50 border-rose-200 text-slate-900 hover:bg-rose-100"
                            : "bg-white border-slate-100 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                          <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : cat.highlighted ? "text-rose-600" : "text-sky-600"}`} />
                          <span className="truncate">{cat.name}</span>
                        </div>
                        {cat.badge ? (
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${active ? "bg-white/20 text-white" : "bg-sky-100 text-sky-700"}`}>
                            {cat.badge}
                          </span>
                        ) : (
                          <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${active ? "text-white" : "text-slate-400"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-500 font-medium">
                  <div className="p-3 bg-sky-50/70 rounded-2xl border border-sky-100 flex items-start space-x-2">
                    <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <p className="text-slate-700 leading-snug">
                      Click any category or item to view specialists, OPD timings, and online tele-consultation slots.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* RIGHT LISTED SECTIONS PANEL (MATCHING SCREENSHOT COLUMNS PRECISELY!) */}
            <div className={`${isSidebarPanelVisible ? "col-span-12 md:col-span-8 lg:col-span-9" : "col-span-12"} space-y-6`}>
              
              {/* 4 COLUMNS LISTED DIRECTORY VIEW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {MEGA_MENU_COLUMNS.map((col, cIdx) => {
                  if (activeSidebarCategory !== "all" && activeSidebarCategory !== col.categoryId) {
                    return null;
                  }

                  const filteredItems = col.items.filter(i =>
                    i.name.toLowerCase().includes(specialtySearch.toLowerCase())
                  );

                  if (filteredItems.length === 0) return null;

                  return (
                    <div key={col.title} className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-2 flex flex-col justify-between">
                      <div>
                        {/* Column Header */}
                        <div className="pb-2.5 mb-2.5 border-b border-slate-100">
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">
                            Column {cIdx + 1}
                          </span>
                          <h3 className="text-xs font-black text-slate-900">
                            {col.title}
                          </h3>
                        </div>

                        {/* Listed Items inside Column (Matching User Screenshot Layout) */}
                        <div className="space-y-1">
                          {filteredItems.map((item) => {
                            const Icon = item.icon;
                            const isHighlighted = item.highlighted || item.name.toLowerCase().includes("dental");
                            return (
                              <div
                                key={item.name}
                                onClick={() => handleSelectMegaMenuItem(item.name)}
                                className={`group px-3 py-2.5 rounded-xl transition duration-200 cursor-pointer flex items-center justify-between border ${
                                  isHighlighted
                                    ? "bg-rose-100/90 border-rose-300 text-slate-900 shadow-xs"
                                    : "bg-slate-50/60 border-slate-100 hover:bg-rose-50/80 hover:border-rose-200 text-slate-700 hover:text-slate-900"
                                }`}
                              >
                                <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                    isHighlighted ? "bg-rose-600 text-white" : "bg-purple-50 text-purple-600 group-hover:bg-rose-200 group-hover:text-rose-700"
                                  }`}>
                                    <Icon className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="text-xs font-bold tracking-tight truncate group-hover:translate-x-0.5 transition-transform">
                                    {item.name}
                                  </span>
                                </div>
                                <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                                  isHighlighted ? "text-rose-600" : "text-slate-400 group-hover:text-rose-600"
                                }`} />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-2 text-[10px] font-bold text-slate-400 text-right">
                        {filteredItems.length} Listed Items
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 24 SPECIALTY QUICK VISUAL CARDS GRID */}
              <div className="pt-6 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900">Featured Visual Specialty Cards</h3>
                  <span className="text-xs font-bold text-sky-600">{filteredSpecialties.length} Specialties Active</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                  {filteredSpecialties.map((spec) => (
                    <div
                      key={spec.id}
                      onClick={() => setActiveSpecialtyModal(spec)}
                      className="group relative rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs hover:shadow-xl hover:border-sky-400 transition-all duration-300 cursor-pointer hover:-translate-y-1 flex flex-col items-start justify-between min-h-[110px]"
                    >
                      {spec.badge && (
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-extrabold text-[8px]">
                          {spec.badge}
                        </span>
                      )}

                      <div className={`w-10 h-10 rounded-xl ${spec.iconBg} border flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110`}>
                        <Stethoscope className={`w-5 h-5 ${spec.iconColor}`} />
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2 leading-tight">
                          {spec.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium mt-1">
                          {spec.doctorsCount}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 5. CARE AT AVORA — HEALTHCARE SERVICES */}
        <section id="services" className="py-16 bg-slate-100/70 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                End-to-End Clinical Services
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Care Capabilities at AVORA</h2>
              <p className="text-xs text-slate-600">Integrated healthcare solutions designed for patients, clinicians, and hospital administrators.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  title: "Online Tele-Consultation",
                  desc: "Connect with certified AVORA doctors via 15-minute high-definition video calls with digital e-prescription generation.",
                  icon: Video,
                  color: "text-blue-600",
                  bg: "bg-blue-50 border-blue-200",
                  action: "Consult Online"
                },
                {
                  title: "Diagnostic Tests @ Home",
                  desc: "100+ health packages with doorstep sample collection by trained phlebotomists & NABL certified digital lab reports.",
                  icon: FlaskConical,
                  color: "text-purple-600",
                  bg: "bg-purple-50 border-purple-200",
                  action: "Book Lab Test"
                },
                {
                  title: "Express 2-Hour Pharmacy",
                  desc: "Order authentic prescription medicines and healthcare products with doorstep delivery from AVORA Pharmacy.",
                  icon: Pill,
                  color: "text-amber-600",
                  bg: "bg-amber-50 border-amber-200",
                  action: "Order Medicines"
                },
                {
                  title: "Live ICU & Ward Telemetry",
                  desc: "Real-time bed availability tracking, patient vital telemetry, and automated ward transfer queues.",
                  icon: BedDouble,
                  color: "text-sky-600",
                  bg: "bg-sky-50 border-sky-200",
                  action: "Bed Matrix"
                },
                {
                  title: "Gemini AI Clinical Dictation",
                  desc: "Ambient AI microphone transcribes doctor consults into structured EHR records with ICD-10 suggestions.",
                  icon: Mic,
                  color: "text-emerald-600",
                  bg: "bg-emerald-50 border-emerald-200",
                  action: "Try Voice AI"
                },
                {
                  title: "24/7 Emergency Ambulance",
                  desc: "Instant dispatch with live GPS tracking & paramedic telemetry sync directly to emergency response teams.",
                  icon: Phone,
                  color: "text-rose-600",
                  bg: "bg-rose-50 border-rose-200",
                  action: "Call Emergency"
                }
              ].map((srv) => {
                const Icon = srv.icon;
                return (
                  <div key={srv.title} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className={`w-12 h-12 rounded-2xl ${srv.bg} border flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${srv.color}`} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{srv.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">{srv.desc}</p>
                    </div>
                    <button
                      onClick={onLaunchApp}
                      className="w-full py-2.5 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-bold text-xs transition flex items-center justify-center space-x-1"
                    >
                      <span>{srv.action}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. TOP AVORA DOCTORS SHOWCASE */}
        <section id="doctors" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                AVORA Verified Specialists
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">Featured AVORA Specialists</h2>
            </div>
            <button onClick={onLaunchApp} className="text-xs font-bold text-sky-600 hover:underline flex items-center space-x-1">
              <span>View All 50,000+ Doctors</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURED_DOCTORS.map((doc) => (
              <div key={doc.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="relative">
                    <img src={doc.image} alt={doc.name} className="w-full h-44 object-cover rounded-2xl border border-slate-100" />
                    <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-white/90 backdrop-blur-md text-amber-600 text-[11px] font-black flex items-center space-x-1 shadow-md">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{doc.rating} ({doc.reviews})</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{doc.name}</h3>
                    <p className="text-[11px] font-bold text-sky-600">{doc.specialty}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{doc.qualification} · {doc.experience}</p>
                  </div>

                  <div className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <p className="font-semibold text-slate-800">{doc.hospital}</p>
                    <p className="text-emerald-600 font-bold mt-0.5">{doc.availability}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Consultation Fee</span>
                    <span className="text-sm font-black text-slate-900">{doc.fee}</span>
                  </div>
                  <button
                    onClick={() => { setBookingModalDoctor(doc); setBookingConfirmed(false); }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
                  >
                    Book Slot
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. INSTITUTIONAL ROLE-BASED WORKSPACES GATEWAY */}
        <section id="workspaces" className="py-16 bg-slate-900 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-900/50 px-3.5 py-1 rounded-full border border-sky-700">
                Institutional Role Gateways
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Dedicated Hospital Workspaces</h2>
              <p className="text-xs text-slate-300">
                AVORA powers every role in the healthcare facility with independent interfaces, real-time data sync, & AI workflows.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { role: "DOCTOR" as UserRole, title: "Doctor EHR", desc: "Digital prescription generator, ambient voice dictation, patient history.", icon: Stethoscope, border: "border-indigo-500/30 hover:border-indigo-400" },
                { role: "HOSPITAL_ADMIN" as UserRole, title: "Hospital Admin", desc: "Staff management, revenue analytics, multi-tenant white-label controls.", icon: Building2, border: "border-sky-500/30 hover:border-sky-400" },
                { role: "NURSE" as UserRole, title: "Nurse Station", desc: "Ward bed telemetry, MAR medicine administration, vital entry.", icon: HeartPulse, border: "border-emerald-500/30 hover:border-emerald-400" },
                { role: "TECHNICAL_STAFF" as UserRole, title: "Technical Staff", desc: "Biomedical device monitoring, server latency, maintenance tickets.", icon: Activity, border: "border-cyan-500/30 hover:border-cyan-400" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.role}
                    onClick={() => onSelectRole(item.role)}
                    className={`text-left p-5 rounded-2xl bg-slate-800/80 border ${item.border} hover:bg-slate-800 transition duration-300 space-y-3 group`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-700 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-white">{item.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                    <div className="pt-2 flex items-center text-[11px] font-bold text-sky-400">
                      <span>Launch Portal</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 8. SPECIALTY INTERACTIVE DETAIL MODAL */}
        {activeSpecialtyModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in duration-200">
              
              <button
                onClick={() => setActiveSpecialtyModal(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-2xl ${activeSpecialtyModal.iconBg} border flex items-center justify-center`}>
                  <Stethoscope className={`w-6 h-6 ${activeSpecialtyModal.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{activeSpecialtyModal.name}</h3>
                  <span className="text-xs font-bold text-sky-600">{activeSpecialtyModal.doctorsCount}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{activeSpecialtyModal.description}</p>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Common Symptoms & Conditions Treated</h4>
                <div className="flex flex-wrap gap-2">
                  {activeSpecialtyModal.symptoms.map(s => (
                    <span key={s} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center space-x-1">
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>{s}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  onClick={() => setActiveSpecialtyModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const doc = FEATURED_DOCTORS[0];
                    setActiveSpecialtyModal(null);
                    setBookingModalDoctor(doc);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5"
                >
                  <span>Book Consult in {activeSpecialtyModal.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 9. DOCTOR APPOINTMENT BOOKING MODAL */}
        {bookingModalDoctor && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
              
              <button
                onClick={() => setBookingModalDoctor(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>

              {!bookingConfirmed ? (
                <>
                  <div className="flex items-center space-x-3">
                    <img src={bookingModalDoctor.image} alt={bookingModalDoctor.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{bookingModalDoctor.name}</h3>
                      <p className="text-xs text-sky-600 font-semibold">{bookingModalDoctor.specialty}</p>
                    </div>
                  </div>

                  <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Hospital Branch</span>
                      <span className="font-bold text-slate-800">{bookingModalDoctor.hospital}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Consultation Fee</span>
                      <span className="font-black text-slate-900">{bookingModalDoctor.fee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Next Slot</span>
                      <span className="font-bold text-emerald-600">{bookingModalDoctor.availability}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Select Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="p-2.5 rounded-xl border-2 border-blue-600 bg-blue-50 font-bold text-xs text-blue-700 flex items-center justify-center space-x-1.5">
                        <Video className="w-4 h-4" />
                        <span>Video Consult</span>
                      </button>
                      <button className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-xs text-slate-700 flex items-center justify-center space-x-1.5">
                        <Building2 className="w-4 h-4" />
                        <span>In-Clinic Visit</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setBookingConfirmed(true)}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 text-white font-bold text-xs shadow-lg hover:scale-[1.01] transition"
                  >
                    Confirm & Reserve Slot
                  </button>
                </>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Appointment Reserved!</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Your consultation with {bookingModalDoctor.name} has been booked. Confirmation SMS & Video link sent to your mobile.
                    </p>
                  </div>
                  <button
                    onClick={() => setBookingModalDoctor(null)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 10. FOOTER */}
        <footer className="border-t border-slate-200 bg-white py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-sky-600" />
              <span className="font-black text-slate-900">AVORA</span>
              <span>© {new Date().getFullYear()} All Rights Reserved.</span>
            </div>
            <div className="flex items-center space-x-4 font-semibold text-slate-600">
              <a href="#specialties" className="hover:text-sky-600">24 Specialties</a>
              <button onClick={scrollToSpecialties} className="hover:text-sky-600 font-bold flex items-center gap-1 text-sky-600">
                <MoreVertical className="w-3.5 h-3.5" />
                <span>Page Sidebar Directory</span>
              </button>
              <a href="#services" className="hover:text-sky-600">Care Services</a>
              <a href="#doctors" className="hover:text-sky-600">Specialists</a>
              <button onClick={onLaunchApp} className="hover:text-sky-600">Institutional Gateway</button>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
};
