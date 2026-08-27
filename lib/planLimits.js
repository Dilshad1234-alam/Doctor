export const PLAN_CONFIG = {
  BASIC: {
    id: 'BASIC',
    name: 'Basic Plan',
    price: 499,
    doctorLimit: 1,
    maxServices: 5,
    templateType: 'basic', // Only Basic Modern template
    publicWebsite: true,
    appointmentBooking: true,
    weeklyAvailability: true,
    patientList: 'basic', // Contact + basic booking history
    urlType: 'subdomain', // Platform subdomain only
    customDomainAllowed: false,
    customization: 'basic', // Basic colors + text content
    analytics: 'basic_count', // Only simple count metrics
    platformBranding: 'visible', // Visible "Powered by DocPulse"
    whatsappWidget: false,
    patientReviews: false,
    facilityHighlights: false,
    patientFaqs: false,
    supportTier: 'Standard'
  },
  PRO: {
    id: 'PRO',
    name: 'Advanced / Pro',
    price: 999,
    doctorLimit: 1,
    maxServices: 999,
    templateType: 'all',
    publicWebsite: true,
    appointmentBooking: true,
    weeklyAvailability: true,
    patientList: 'advanced',
    urlType: 'custom_domain',
    customDomainAllowed: true,
    customization: 'full',
    analytics: 'advanced',
    platformBranding: 'optional',
    whatsappWidget: true,
    patientReviews: true,
    facilityHighlights: true,
    patientFaqs: true,
    supportTier: 'Priority'
  },
  ADVANCED: {
    id: 'ADVANCED',
    name: 'Advanced Plan',
    price: 999,
    doctorLimit: 1,
    maxServices: 999,
    templateType: 'all',
    publicWebsite: true,
    appointmentBooking: true,
    weeklyAvailability: true,
    patientList: 'advanced',
    urlType: 'custom_domain',
    customDomainAllowed: true,
    customization: 'full',
    analytics: 'advanced',
    platformBranding: 'optional',
    whatsappWidget: true,
    patientReviews: true,
    facilityHighlights: true,
    patientFaqs: true,
    supportTier: 'Priority'
  },
  PREMIUM: {
    id: 'PREMIUM',
    name: 'Premium',
    price: 1499,
    doctorLimit: 5,
    maxServices: 999,
    templateType: 'all',
    publicWebsite: true,
    appointmentBooking: true,
    weeklyAvailability: true,
    patientList: 'full_emr',
    urlType: 'custom_domain',
    customDomainAllowed: true,
    customization: 'full_white_label',
    analytics: 'full_reports',
    platformBranding: 'hidden',
    whatsappWidget: true,
    patientReviews: true,
    facilityHighlights: true,
    patientFaqs: true,
    supportTier: '24/7 VIP'
  }
};

export const getPlanConfig = (planId = 'BASIC') => {
  const normalized = String(planId || 'BASIC').toUpperCase().trim();
  if (normalized === 'STARTER' || normalized === 'BASIC') return PLAN_CONFIG.BASIC;
  if (normalized === 'ADVANCED') return PLAN_CONFIG.ADVANCED;
  if (normalized === 'PRO') return PLAN_CONFIG.PRO;
  if (normalized === 'PREMIUM' || normalized === 'ENTERPRISE') return PLAN_CONFIG.PREMIUM;
  return PLAN_CONFIG.BASIC;
};

export const isFeatureAllowed = (planId = 'BASIC', featureKey) => {
  const plan = getPlanConfig(planId);
  return Boolean(plan[featureKey]);
};
