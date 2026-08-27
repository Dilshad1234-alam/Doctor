export const SPECIALTY_LABELS = {
  dental: 'Dentistry & Oral Surgery',
  dermatology: 'Dermatology & Cosmetology',
  general_opd: 'Family OPD & General Physician',
  physiotherapy: 'Physiotherapy & Rehab Specialist',
  pediatric: 'Pediatric & Child Specialist',
  ayurveda_homeopathy: 'Holistic & Ayurvedic Medicine',
  eye_ent: 'Ophthalmology & ENT Specialist'
};

export const SPECIALTY_PRESETS = {
  general_opd: {
    id: 'general_opd',
    name: 'Family Health & General OPD',
    shortName: 'General OPD',
    defaultSpecialization: 'General Physician & Family Medicine',
    color: 'teal',
    icon: 'stethoscope',
    headline: 'Comprehensive Family Healthcare & OPD Consultations',
    description: 'Personalized primary medical care, diagnostics, and instant confirmed appointment booking for all family health needs.',
    badges: ['Zero Wait Token', 'Digital WhatsApp Rx', 'Family Health Protocol', 'Verified Specialist'],
    services: [
      { name: 'General OPD Consultation', price: 300, durationMins: 15, description: 'Complete clinical assessment, vitals checkup, and instant digital verified prescription.' },
      { name: 'BP, Sugar & Vitals Screening', price: 150, durationMins: 10, description: 'Routine hypertension, blood glucose level check and lifestyle medication advice.' },
      { name: 'Follow-up Consultation (within 7 days)', price: 150, durationMins: 10, description: 'Review of diagnostic reports, clinical progress, and prescription adjustment.' },
      { name: 'Acute Infection & Viral Care', price: 350, durationMins: 15, description: 'Specialized treatment plan for seasonal flu, viral fever, throat and gastro infections.' }
    ]
  },
  dental: {
    id: 'dental',
    name: 'Dental Care & Orthodontics',
    shortName: 'Dental Care',
    defaultSpecialization: 'Dentist & Orthodontic Surgeon',
    color: 'blue',
    icon: 'smile',
    headline: 'Modern, Painless Dental Care & Smile Design',
    description: 'State-of-the-art dental treatments with strict multi-step sterilization and certified painless anesthesia protocols.',
    badges: [
      '100% Autoclave Sterilized Operatory',
      'Painless Computerized Anesthesia',
      'Low-Radiation Digital RVG X-Ray',
      'Zero Waiting Room Token Appointments'
    ],
    services: [
      { name: 'Comprehensive Dental Consultation', price: 300, durationMins: 20, description: 'Complete oral examination with intraoral camera screening and customized treatment roadmap.' },
      { name: 'Teeth Cleaning & Ultrasonic Polishing', price: 800, durationMins: 30, description: 'Advanced calculus removal, plaque decontamination, and enamel gloss polishing.' },
      { name: 'Root Canal Treatment (Single Sitting)', price: 2500, durationMins: 45, description: 'Microscopic rotary endodontics with precision biocompatible crown seal.' },
      { name: 'Invisible Aligners & Braces Consult', price: 500, durationMins: 30, description: 'Digital smile analysis for teeth straightening with clear invisible aligners.' }
    ]
  },
  dermatology: {
    id: 'dermatology',
    name: 'Skin & Clinical Aesthetics',
    shortName: 'Dermatology',
    defaultSpecialization: 'Consultant Dermatologist & Cosmetologist',
    color: 'rose',
    icon: 'sparkles',
    headline: 'Certified Clinical Dermatology & Advanced Skin Aesthetics',
    description: 'Evidence-based clinical skincare, FDA-approved laser treatments, and individualized trichology hair loss therapy.',
    badges: ['FDA Approved Protocols', 'Medical Laser Suite', 'Board Certified Dermatologist', 'Personalized Skincare'],
    services: [
      { name: 'Clinical Skin Consultation', price: 500, durationMins: 20, description: 'In-depth dermoscopic analysis of acne, pigmentation, eczema, and skin allergies.' },
      { name: 'Advanced Acne & Scar Therapy', price: 1200, durationMins: 30, description: 'Targeted comedone extraction, anti-inflammatory peel, and barrier repair protocol.' },
      { name: 'PRP Hair Growth Therapy', price: 2500, durationMins: 45, description: 'Platelet-rich plasma scalp micro-infusion for hereditary and stress-induced hair loss.' },
      { name: 'Hydra-Glow Medical Facial', price: 1800, durationMins: 45, description: 'Deep vacuum pore purification with active hyaluronic acid infusion and LED light therapy.' }
    ]
  },
  physiotherapy: {
    id: 'physiotherapy',
    name: 'Physiotherapy & Rehabilitation',
    shortName: 'Physiotherapy',
    defaultSpecialization: 'Senior Physiotherapist & Rehab Specialist',
    color: 'emerald',
    icon: 'activity',
    headline: 'Pain Relief, Spinal Posture & Sports Injury Rehab',
    description: 'Targeted kinesiology, electrotherapy, and customized biomechanical exercises to restore painless movement.',
    badges: ['Advanced Electrotherapy', 'Posture Correction', 'Custom Rehab Protocol', 'Sports Injury Certified'],
    services: [
      { name: 'Physiotherapy Assessment & Plan', price: 400, durationMins: 30, description: 'Comprehensive musculoskeletal biomechanical testing and customized pain-relief roadmap.' },
      { name: 'Back & Cervical Neck Pain Therapy', price: 600, durationMins: 40, description: 'Manual spinal mobilization combined with TENS electrotherapy and postural release.' },
      { name: 'Knee & Joint Rehab Session', price: 500, durationMins: 35, description: 'Targeted quadriceps strengthening, ultrasound therapy, and osteoarthritis mobility rehab.' },
      { name: 'Post-Surgical Rehab & Recovery', price: 700, durationMins: 45, description: 'Graduated functional rehabilitation after orthopedic surgery or fracture repair.' }
    ]
  },
  pediatric: {
    id: 'pediatric',
    name: 'Child Healthcare & Pediatrics',
    shortName: 'Pediatrics',
    defaultSpecialization: 'Consultant Pediatrician & Neonatologist',
    color: 'gold',
    icon: 'heart',
    headline: 'Gentle, Compassionate Pediatric Care & Immunization',
    description: 'Child-friendly clinical consultations, growth & developmental milestone tracking, and WHO immunization programs.',
    badges: ['Child-Friendly OPD', 'WHO Vaccination Schedule', 'Developmental Milestone Check', 'Gentle Care Protocol'],
    services: [
      { name: 'Child OPD Health Checkup', price: 400, durationMins: 20, description: 'Complete physical examination, ear-nose-throat assessment, vitals, and fever management.' },
      { name: 'Baby Growth & Immunization Consult', price: 500, durationMins: 25, description: 'Vaccine administration, growth percentile charting, and infant nutritional counseling.' },
      { name: 'Pediatric Allergy & Asthma Review', price: 500, durationMins: 30, description: 'Diagnostic evaluation of recurring respiratory wheezing, childhood eczema, and nebulization advice.' }
    ]
  },
  ayurveda_homeopathy: {
    id: 'ayurveda_homeopathy',
    name: 'Ayurvedic & Holistic Wellness',
    shortName: 'Ayurveda & Holistic',
    defaultSpecialization: 'Ayurvedic Physician (BAMS, MD) & Holistic Healer',
    color: 'emerald',
    icon: 'leaf',
    headline: 'Time-Tested Natural Healing & Dosha Balancing',
    description: 'Traditional Nadi Pariksha, herbal formulations, and personalized holistic detox protocols for chronic wellness.',
    badges: ['100% Pure Herbal Therapy', 'Nadi Pariksha Assessment', 'Customized Detox Plan', 'Root-Cause Wellness'],
    services: [
      { name: 'Holistic Nadi Pariksha Consultation', price: 400, durationMins: 25, description: 'Traditional pulse reading, prakriti analysis, and personalized herbal medication prescription.' },
      { name: 'Chronic Digestion & Gut Detox Plan', price: 600, durationMins: 30, description: 'Herbal digestive fire (Agni) restoration plan with personalized diet and dinacharya guide.' },
      { name: 'Stress, Sleep & Joint Care Protocol', price: 500, durationMins: 30, description: 'Ayurvedic herbal therapy for arthritis joint relief, chronic migraine, and restful sleep.' }
    ]
  },
  eye_ent: {
    id: 'eye_ent',
    name: 'Eye & ENT Specialist Clinic',
    shortName: 'Eye & ENT',
    defaultSpecialization: 'Consultant Ophthalmologist & ENT Specialist',
    color: 'indigo',
    icon: 'eye',
    headline: 'Advanced Vision Diagnostics & Precision ENT Care',
    description: 'Digital refraction, ear micro-suction, sinus relief, and computerized ophthalmic diagnostics.',
    badges: ['Digital Auto-Refraction', 'Endoscopic ENT Screening', 'Ear Micro-Suction', 'Glaucoma Vitals Check'],
    services: [
      { name: 'Comprehensive Eye & Vision Test', price: 300, durationMins: 20, description: 'Computerized refraction, visual acuity testing, intraocular pressure check, and spectacle prescription.' },
      { name: 'ENT Specialist Consultation', price: 400, durationMins: 20, description: 'Video endoscopic examination of ear canal, nasal septum, tonsils, and vocal cords.' },
      { name: 'Painless Ear Wax Micro-Suction', price: 600, durationMins: 25, description: 'Gentle motorized aspiration of impacted ear wax without water syringe pressure.' }
    ]
  }
};

export function getSpecialtyPreset(presetId = 'general_opd') {
  if (!presetId) return SPECIALTY_PRESETS.general_opd;
  const key = presetId.toLowerCase().trim();
  return SPECIALTY_PRESETS[key] || SPECIALTY_PRESETS.general_opd;
}

export function detectSpecialtyFromText(text = '') {
  if (!text) return 'general_opd';
  const lower = text.toLowerCase();
  if (lower.includes('dent') || lower.includes('tooth') || lower.includes('oral') || lower.includes('orthodont')) return 'dental';
  if (lower.includes('derma') || lower.includes('skin') || lower.includes('cosmet') || lower.includes('aesthetic') || lower.includes('hair')) return 'dermatology';
  if (lower.includes('physio') || lower.includes('rehab') || lower.includes('chiro') || lower.includes('ortho')) return 'physiotherapy';
  if (lower.includes('pedia') || lower.includes('child') || lower.includes('baby') || lower.includes('infant')) return 'pediatric';
  if (lower.includes('ayur') || lower.includes('homeo') || lower.includes('naturopath') || lower.includes('holistic')) return 'ayurveda_homeopathy';
  if (lower.includes('eye') || lower.includes('ent') || lower.includes('ophthalm') || lower.includes('ear') || lower.includes('throat') || lower.includes('nose')) return 'eye_ent';
  return 'general_opd';
}
