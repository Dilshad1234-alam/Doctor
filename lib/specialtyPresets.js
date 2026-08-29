export const SPECIALTY_LABELS = {
  dental: 'Dentistry & Oral Surgery',
  dermatology: 'Dermatology & Cosmetology',
  general_opd: 'Family Health & General OPD',
  physiotherapy: 'Physiotherapy & Rehabilitation',
  pediatric: 'Pediatric & Child Clinic',
  ayurveda_homeopathy: 'Ayurvedic & Holistic Wellness',
  eye_ent: 'Eye & ENT Specialist Clinic'
};

export const SPECIALTY_PRESETS = {
  dental: {
    id: 'dental',
    name: 'Dentistry & Oral Surgery',
    shortName: 'Dental Care',
    defaultSpecialization: 'Dentist & Oral Surgeon',
    color: 'teal',
    icon: 'tooth',
    headline: 'Modern, Painless Dental Care & Precision Smile Aesthetics',
    description: 'State-of-the-art dental solutions with computerized painless anesthesia, zero-radiation digital imaging, and clinical grade autoclave sterilization.',
    badges: [
      '100% Autoclave Sterilized',
      'Painless Anesthesia',
      'Digital RVG X-Ray',
      'Zero Wait Token'
    ],
    defaultServices: [
      { name: 'Comprehensive Dental Consultation', fee: 300, duration: 20, description: 'Complete oral examination with intraoral camera screening and customized roadmap.' },
      { name: 'Teeth Cleaning & Ultrasonic Polishing', fee: 800, duration: 30, description: 'Advanced calculus removal, plaque decontamination, and enamel gloss polishing.' },
      { name: 'Root Canal Treatment (Single Sitting)', fee: 2500, duration: 45, description: 'Precision microscopic rotary endodontics with biocompatible seal.' },
      { name: 'Invisible Aligners & Braces Consult', fee: 500, duration: 30, description: 'Digital smile analysis for teeth straightening with clear invisible aligners.' }
    ],
    services: [
      { name: 'Comprehensive Dental Consultation', price: 300, durationMins: 20, description: 'Complete oral examination with intraoral camera screening and customized roadmap.' },
      { name: 'Teeth Cleaning & Ultrasonic Polishing', price: 800, durationMins: 30, description: 'Advanced calculus removal, plaque decontamination, and enamel gloss polishing.' },
      { name: 'Root Canal Treatment (Single Sitting)', price: 2500, durationMins: 45, description: 'Precision microscopic rotary endodontics with biocompatible seal.' },
      { name: 'Invisible Aligners & Braces Consult', price: 500, durationMins: 30, description: 'Digital smile analysis for teeth straightening with clear invisible aligners.' }
    ],
    reviews: [
      { patientName: 'Ananya Sharma', rating: 5, comment: 'Dr. was extremely gentle during my root canal. Truly painless experience with zero waiting time.', date: '3 days ago' },
      { patientName: 'Vikram Mehta', rating: 5, comment: 'Clean and sterile clinic. Ultrasonic teeth cleaning made my teeth noticeably brighter!', date: '1 week ago' }
    ]
  },

  dermatology: {
    id: 'dermatology',
    name: 'Dermatology & Cosmetology',
    shortName: 'Dermatology',
    defaultSpecialization: 'Consultant Dermatologist & Cosmetologist',
    color: 'rose',
    icon: 'sparkles',
    headline: 'Advanced Clinical Dermatology, Laser Aesthetics & Hair Care',
    description: 'Evidence-based clinical skincare, US-FDA approved laser technology, and customized trichology solutions for healthy skin and hair.',
    badges: [
      'FDA-Approved Protocols',
      'US-FDA Laser Technology',
      'Board Certified Dermatologist',
      'Sterilized Clinical Suite'
    ],
    defaultServices: [
      { name: 'Skin & Hair Consultation', fee: 500, duration: 20, description: 'Comprehensive dermoscopic evaluation of acne, pigmentation, eczema, and hair loss.' },
      { name: 'Acne & Scar Clarifying Peel', fee: 1200, duration: 30, description: 'Targeted medical peel with pore unclogging and skin barrier repair.' },
      { name: 'Laser Hair Reduction Consult', fee: 800, duration: 30, description: 'Triple-wavelength US-FDA laser spot test and customized reduction session.' },
      { name: 'Hydra-Glow Facial Treatment', fee: 2500, duration: 45, description: 'Deep vacuum pore purification with hyaluronic acid infusion and LED therapy.' }
    ],
    services: [
      { name: 'Skin & Hair Consultation', price: 500, durationMins: 20, description: 'Comprehensive dermoscopic evaluation of acne, pigmentation, eczema, and hair loss.' },
      { name: 'Acne & Scar Clarifying Peel', price: 1200, durationMins: 30, description: 'Targeted medical peel with pore unclogging and skin barrier repair.' },
      { name: 'Laser Hair Reduction Consult', price: 800, durationMins: 30, description: 'Triple-wavelength US-FDA laser spot test and customized reduction session.' },
      { name: 'Hydra-Glow Facial Treatment', price: 2500, durationMins: 45, description: 'Deep vacuum pore purification with hyaluronic acid infusion and LED therapy.' }
    ],
    reviews: [
      { patientName: 'Pooja Verma', rating: 5, comment: 'Cleared my hormonal acne in 2 months. The customized skincare routine did wonders!', date: '5 days ago' },
      { patientName: 'Rohan Gupta', rating: 5, comment: 'Hydra-Glow treatment gave instant radiance for my wedding. Highly recommended!', date: '2 weeks ago' }
    ]
  },

  general_opd: {
    id: 'general_opd',
    name: 'Family Health & General OPD',
    shortName: 'General OPD',
    defaultSpecialization: 'General Physician & Family Medicine',
    color: 'teal',
    icon: 'stethoscope',
    headline: 'Comprehensive Family Healthcare & General OPD Clinic',
    description: 'Personalized primary care, disease diagnostics, digital verified WhatsApp prescriptions, and dedicated emergency first-aid.',
    badges: [
      'Zero Queue Delay Token',
      'Digital WhatsApp Prescription',
      'Complete Family Healthcare',
      'Emergency First-Aid Ready'
    ],
    defaultServices: [
      { name: 'General OPD Consultation', fee: 300, duration: 15, description: 'Complete clinical assessment, vitals checkup, and instant digital prescription.' },
      { name: 'BP, Blood Sugar & Vitals Check', fee: 150, duration: 15, description: 'Routine hypertension and blood glucose screening with medication review.' },
      { name: 'Seasonal Viral / Fever OPD', fee: 300, duration: 15, description: 'Specialized protocol for acute fever, viral infections, cough, and gastro relief.' }
    ],
    services: [
      { name: 'General OPD Consultation', price: 300, durationMins: 15, description: 'Complete clinical assessment, vitals checkup, and instant digital prescription.' },
      { name: 'BP, Blood Sugar & Vitals Check', price: 150, durationMins: 15, description: 'Routine hypertension and blood glucose screening with medication review.' },
      { name: 'Seasonal Viral / Fever OPD', price: 300, durationMins: 15, description: 'Specialized protocol for acute fever, viral infections, cough, and gastro relief.' }
    ],
    reviews: [
      { patientName: 'Sanjay Deshmukh', rating: 5, comment: 'Dr. took time to listen and explained the dosage carefully. Token system is great.', date: '2 days ago' },
      { patientName: 'Meenakshi Iyer', rating: 5, comment: 'Got my WhatsApp prescription within seconds. Very professional clinic setup.', date: '1 week ago' }
    ]
  },

  physiotherapy: {
    id: 'physiotherapy',
    name: 'Physiotherapy & Rehabilitation',
    shortName: 'Physiotherapy',
    defaultSpecialization: 'Senior Physiotherapist & Rehab Specialist',
    color: 'emerald',
    icon: 'activity',
    headline: 'Pain Relief, Spinal Rehabilitation & Biomechanical Recovery',
    description: 'Targeted kinesiology, advanced electrotherapy, ultrasound pain relief, and postural retraining for effortless painless movement.',
    badges: [
      'Electrotherapy & Ultrasound',
      'Targeted Posture Correction',
      'Certified Rehab Specialists',
      'Dedicated Exercise Bay'
    ],
    defaultServices: [
      { name: 'Initial Physiotherapy Assessment', fee: 400, duration: 30, description: 'Musculoskeletal evaluation, range of motion tests, and pain relief roadmap.' },
      { name: 'Back & Spine Pain Therapy', fee: 600, duration: 45, description: 'Manual spinal mobilization combined with TENS electrotherapy and core release.' },
      { name: 'Knee Rehab & Joint Mobility Session', fee: 500, duration: 40, description: 'Ultrasound therapy with quadriceps strengthening for osteoarthritis mobility.' }
    ],
    services: [
      { name: 'Initial Physiotherapy Assessment', price: 400, durationMins: 30, description: 'Musculoskeletal evaluation, range of motion tests, and pain relief roadmap.' },
      { name: 'Back & Spine Pain Therapy', price: 600, durationMins: 45, description: 'Manual spinal mobilization combined with TENS electrotherapy and core release.' },
      { name: 'Knee Rehab & Joint Mobility Session', price: 500, durationMins: 40, description: 'Ultrasound therapy with quadriceps strengthening for osteoarthritis mobility.' }
    ],
    reviews: [
      { patientName: 'Amit Trivedi', rating: 5, comment: 'Severe lower back pain relieved after 4 sessions. Exercises were easy to follow.', date: '4 days ago' },
      { patientName: 'Sunita Rao', rating: 5, comment: 'Recovered full knee mobility after my meniscus strain. Excellent therapist.', date: '2 weeks ago' }
    ]
  },

  pediatric: {
    id: 'pediatric',
    name: 'Pediatric & Child Clinic',
    shortName: 'Pediatrics',
    defaultSpecialization: 'Consultant Pediatrician & Child Health Specialist',
    color: 'amber',
    icon: 'baby',
    headline: 'Gentle, Compassionate Pediatric Care & WHO Immunization',
    description: 'Child-friendly OPD consultations, growth & milestone charting, and painless vaccination schedules in a welcoming environment.',
    badges: [
      'Child-Friendly Safe OPD',
      'WHO Vaccination Schedule',
      'Growth & Milestones Tracker',
      'Gentle Pediatric Care'
    ],
    defaultServices: [
      { name: 'Child OPD Consultation', fee: 400, duration: 20, description: 'Complete physical examination, vitals, respiratory review, and fever care.' },
      { name: 'Infant Vaccination & Immunization', fee: 500, duration: 20, description: 'Painless vaccine administration with growth percentile tracking.' },
      { name: 'Growth & Nutrition Assessment', fee: 600, duration: 30, description: 'Comprehensive dietary planning, height/weight velocity, and milestone evaluation.' }
    ],
    services: [
      { name: 'Child OPD Consultation', price: 400, durationMins: 20, description: 'Complete physical examination, vitals, respiratory review, and fever care.' },
      { name: 'Infant Vaccination & Immunization', price: 500, durationMins: 20, description: 'Painless vaccine administration with growth percentile tracking.' },
      { name: 'Growth & Nutrition Assessment', price: 600, durationMins: 30, description: 'Comprehensive dietary planning, height/weight velocity, and milestone evaluation.' }
    ],
    reviews: [
      { patientName: 'Neha Kapoor', rating: 5, comment: 'My toddler was completely comfortable. Dr. is warm, patient, and knowledgeable.', date: '3 days ago' },
      { patientName: 'Kunal Sen', rating: 5, comment: 'Timely vaccination reminders and painless shots. Best pediatric clinic around.', date: '1 week ago' }
    ]
  },

  ayurveda_homeopathy: {
    id: 'ayurveda_homeopathy',
    name: 'Ayurvedic & Holistic Wellness',
    shortName: 'Ayurvedic Wellness',
    defaultSpecialization: 'Ayurvedic Practitioner & Nadi Pariksha Specialist',
    color: 'emerald',
    icon: 'leaf',
    headline: 'Root-Cause Healing, Nadi Pariksha & Ayurvedic Rejuvenation',
    description: '100% herbal therapies, personalized dietary regimens, dosha balancing, and non-invasive chronic lifestyle disease reversal.',
    badges: [
      '100% Herbal & Chemical-Free',
      'Traditional Nadi Pariksha',
      'Chronic Lifestyle Reversal',
      'Personalized Diet Chart'
    ],
    defaultServices: [
      { name: 'Holistic Prakriti Consultation', fee: 400, duration: 30, description: 'Pulse diagnosis (Nadi Pariksha), constitution assessment, and herbal roadmap.' },
      { name: 'Panchakarma & Detox Therapy Consult', fee: 700, duration: 40, description: 'Deep bio-purification and cellular detoxification treatment planning.' },
      { name: 'Chronic Illness Dietary Plan', fee: 500, duration: 30, description: 'Personalized food as medicine plan for digestive, metabolic, and joint health.' }
    ],
    services: [
      { name: 'Holistic Prakriti Consultation', price: 400, durationMins: 30, description: 'Pulse diagnosis (Nadi Pariksha), constitution assessment, and herbal roadmap.' },
      { name: 'Panchakarma & Detox Therapy Consult', price: 700, durationMins: 40, description: 'Deep bio-purification and cellular detoxification treatment planning.' },
      { name: 'Chronic Illness Dietary Plan', price: 500, durationMins: 30, description: 'Personalized food as medicine plan for digestive, metabolic, and joint health.' }
    ],
    reviews: [
      { patientName: 'Rajesh Nair', rating: 5, comment: 'Cured my chronic acidity and fatigue naturally. Nadi Pariksha was surprisingly accurate.', date: '5 days ago' },
      { patientName: 'Geeta Patel', rating: 5, comment: 'Authentic Ayurvedic remedies with no side effects. Truly transformative care.', date: '2 weeks ago' }
    ]
  },

  eye_ent: {
    id: 'eye_ent',
    name: 'Eye & ENT Specialist Clinic',
    shortName: 'Eye & ENT',
    defaultSpecialization: 'Ophthalmologist & ENT Specialist',
    color: 'indigo',
    icon: 'eye',
    headline: 'Precision Vision Refraction, Otoscopy & ENT Specialist Care',
    description: 'Digital auto-refraction eye testing, microscopic painless ear wax removal, allergy testing, and nasal endoscopy.',
    badges: [
      'Digital Refraction Vision Check',
      'Microscopic Ear Wax Removal',
      'Sinus & Allergy Testing',
      'Advanced Otoscopy'
    ],
    defaultServices: [
      { name: 'Comprehensive Eye & Vision Test', fee: 300, duration: 20, description: 'Digital auto-refraction, visual acuity testing, and intraocular pressure check.' },
      { name: 'ENT Specialist Consultation', fee: 400, duration: 20, description: 'Clinical otoscopy for ear pain, nasal congestion, tonsils, and vertigo.' },
      { name: 'Ear Wax Micro-Suction Cleaning', fee: 600, duration: 25, description: 'Painless microscopic suction removal of stubborn ear wax without water syringe.' }
    ],
    services: [
      { name: 'Comprehensive Eye & Vision Test', price: 300, durationMins: 20, description: 'Digital auto-refraction, visual acuity testing, and intraocular pressure check.' },
      { name: 'ENT Specialist Consultation', price: 400, durationMins: 20, description: 'Clinical otoscopy for ear pain, nasal congestion, tonsils, and vertigo.' },
      { name: 'Ear Wax Micro-Suction Cleaning', price: 600, durationMins: 25, description: 'Painless microscopic suction removal of stubborn ear wax without water syringe.' }
    ],
    reviews: [
      { patientName: 'Deepak Joshi', rating: 5, comment: 'Micro-suction ear cleaning took 5 minutes and was completely painless. Hearing restored!', date: '3 days ago' },
      { patientName: 'Shalini Roy', rating: 5, comment: 'Accurate spectacle power check. Very patient and thorough doctor.', date: '1 week ago' }
    ]
  }
};

export function getSpecialtyPreset(specialtyKey) {
  if (!specialtyKey) return SPECIALTY_PRESETS.general_opd;
  const key = String(specialtyKey).toLowerCase().trim();
  return SPECIALTY_PRESETS[key] || SPECIALTY_PRESETS.general_opd;
}

export function detectSpecialtyFromText(text) {
  if (!text || typeof text !== 'string') return 'general_opd';
  const lower = text.toLowerCase();

  if (lower.includes('dent') || lower.includes('tooth') || lower.includes('teeth') || lower.includes('rct') || lower.includes('braces') || lower.includes('aligner') || lower.includes('oral')) {
    return 'dental';
  }
  if (lower.includes('skin') || lower.includes('derma') || lower.includes('cosmet') || lower.includes('laser') || lower.includes('acne') || lower.includes('hair') || lower.includes('tricho')) {
    return 'dermatology';
  }
  if (lower.includes('physio') || lower.includes('rehab') || lower.includes('spine') || lower.includes('posture') || lower.includes('joint') || lower.includes('ortho') || lower.includes('pain')) {
    return 'physiotherapy';
  }
  if (lower.includes('pediat') || lower.includes('child') || lower.includes('baby') || lower.includes('infant') || lower.includes('vaccin') || lower.includes('milestone')) {
    return 'pediatric';
  }
  if (lower.includes('ayur') || lower.includes('homeo') || lower.includes('nadi') || lower.includes('herbal') || lower.includes('dosha') || lower.includes('prakriti') || lower.includes('panchakarma')) {
    return 'ayurveda_homeopathy';
  }
  if (lower.includes('eye') || lower.includes('ent') || lower.includes('vision') || lower.includes('optic') || lower.includes('ear') || lower.includes('nose') || lower.includes('throat') || lower.includes('sinus')) {
    return 'eye_ent';
  }

  return 'general_opd';
}
