export const PLAN_CONFIG = {
  BASIC: {
    id: 'BASIC',
    name: 'Basic Plan',
    price: 499,
    doctorLimit: 1,
    maxServices: 5,
    templates: ['basic_minimal'],
    templateType: 'basic',
    publicWebsite: true,
    appointmentBooking: true,
    weeklyAvailability: true,
    patientList: 'basic',
    urlType: 'subdomain',
    customDomainAllowed: false,
    advancedAnalytics: false,
    exportReports: false,
    patientFilters: false,
    customization: 'basic',
    analytics: 'basic_count',
    platformBranding: 'visible',
    customBrandingToggle: false,
    whatsappWidget: false,
    patientReviews: false,
    facilityHighlights: false,
    patientFaqs: false,
    videoBioSupport: false,
    vipSupportBadge: false,
    supportTier: 'Standard'
  },
  PRO: {
    id: 'PRO',
    name: 'Advanced / Pro',
    price: 999,
    doctorLimit: 1,
    maxServices: 999,
    templates: ['basic_minimal', 'modern_converter'],
    templateType: 'all',
    publicWebsite: true,
    appointmentBooking: true,
    weeklyAvailability: true,
    patientList: 'advanced',
    urlType: 'custom_domain',
    customDomainAllowed: true,
    advancedAnalytics: true,
    exportReports: true,
    patientFilters: true,
    customization: 'full',
    analytics: 'advanced',
    platformBranding: 'optional',
    customBrandingToggle: false,
    whatsappWidget: true,
    patientReviews: true,
    facilityHighlights: true,
    patientFaqs: true,
    videoBioSupport: false,
    vipSupportBadge: false,
    supportTier: 'Priority'
  },
  ADVANCED: {
    id: 'ADVANCED',
    name: 'Advanced Plan',
    price: 999,
    doctorLimit: 1,
    maxServices: 999,
    templates: ['basic_minimal', 'modern_converter'],
    templateType: 'all',
    publicWebsite: true,
    appointmentBooking: true,
    weeklyAvailability: true,
    patientList: 'advanced',
    urlType: 'custom_domain',
    customDomainAllowed: true,
    advancedAnalytics: true,
    exportReports: true,
    patientFilters: true,
    customization: 'full',
    analytics: 'advanced',
    platformBranding: 'optional',
    customBrandingToggle: false,
    whatsappWidget: true,
    patientReviews: true,
    facilityHighlights: true,
    patientFaqs: true,
    videoBioSupport: false,
    vipSupportBadge: false,
    supportTier: 'Priority'
  },
  PREMIUM: {
    id: 'PREMIUM',
    name: 'Premium Tier',
    price: 1499,
    doctorLimit: 1,
    maxServices: 999,
    templates: ['basic_minimal', 'modern_converter', 'executive_luxury', 'specialist_dark'],
    templateType: 'all',
    publicWebsite: true,
    appointmentBooking: true,
    weeklyAvailability: true,
    patientList: 'full_emr',
    urlType: 'custom_domain',
    customDomainAllowed: true,
    advancedAnalytics: true,
    exportReports: true,
    patientFilters: true,
    customization: 'full_white_label',
    analytics: 'full_reports',
    platformBranding: 'removed', // 100% White-label
    customBrandingToggle: true,
    whatsappWidget: true,
    patientReviews: true,
    facilityHighlights: true,
    patientFaqs: true,
    videoBioSupport: true,
    vipSupportBadge: true,
    supportTier: 'VIP Priority + Onboarding Assist'
  }
};

export const PLAN_TIERS = {
  BASIC: {
    id: 'BASIC',
    name: 'Basic Plan',
    allowedColors: ['teal', 'blue'], // 2 Colors
    allowedShapes: ['curved', 'rounded-2xl'],
    allowedTemplates: ['basic_minimal', 'template-1'], // 1 Template
    features: {
      whatsappFloating: false,
      testimonials: false,
      customDomain: false,
      whiteLabel: false,
      videoBio: false
    }
  },
  ADVANCED: {
    id: 'ADVANCED',
    name: 'Advanced Plan',
    allowedColors: ['teal', 'blue', 'emerald', 'navy'], // 4 Colors
    allowedShapes: ['soft', 'curved', 'pill', 'rounded-xl', 'rounded-2xl', 'rounded-full'],
    allowedTemplates: ['basic_minimal', 'modern_converter', 'template-1', 'template-2'], // 2 Templates
    features: {
      whatsappFloating: true,
      testimonials: true,
      customDomain: true,
      whiteLabel: false,
      videoBio: false
    }
  },
  PRO: {
    id: 'PRO',
    name: 'Advanced Plan',
    allowedColors: ['teal', 'blue', 'emerald', 'navy'], // 4 Colors
    allowedShapes: ['soft', 'curved', 'pill', 'rounded-xl', 'rounded-2xl', 'rounded-full'],
    allowedTemplates: ['basic_minimal', 'modern_converter', 'template-1', 'template-2'], // 2 Templates
    features: {
      whatsappFloating: true,
      testimonials: true,
      customDomain: true,
      whiteLabel: false,
      videoBio: false
    }
  },
  PREMIUM: {
    id: 'PREMIUM',
    name: 'Premium Tier',
    allowedColors: ['teal', 'blue', 'emerald', 'navy', 'rose', 'indigo', 'gold'], // All 7 Colors
    allowedShapes: ['soft', 'curved', 'pill', 'sharp', 'rounded-xl', 'rounded-2xl', 'rounded-full', 'rounded-none'], // All Shapes
    allowedTemplates: ['basic_minimal', 'modern_converter', 'executive_luxury', 'specialist_dark', 'template-1', 'template-2', 'template-3', 'template-4'], // All Templates
    features: {
      whatsappFloating: true,
      testimonials: true,
      customDomain: true,
      whiteLabel: true,
      videoBio: true
    }
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

export const getPlanTier = (planId = 'BASIC') => {
  const normalized = String(planId || 'BASIC').toUpperCase().trim();
  if (normalized === 'STARTER' || normalized === 'BASIC') return PLAN_TIERS.BASIC;
  if (normalized === 'ADVANCED') return PLAN_TIERS.ADVANCED;
  if (normalized === 'PRO') return PLAN_TIERS.PRO;
  if (normalized === 'PREMIUM' || normalized === 'ENTERPRISE') return PLAN_TIERS.PREMIUM;
  return PLAN_TIERS.BASIC;
};

export const isFeatureAllowed = (planId = 'BASIC', featureKey) => {
  const plan = getPlanConfig(planId);
  return Boolean(plan[featureKey]);
};
