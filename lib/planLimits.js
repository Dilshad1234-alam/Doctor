export const PLAN_CONFIG = {
  BASIC: {
    id: 'BASIC',
    name: 'Basic Plan',
    price: 499,
    doctorLimit: 1,
    maxServices: 5,
    allowSplitShifts: false,
    allowSlotIntervals: false,
    defaultSlotDuration: 30,
    allowClinicalNotes: false,
    allowDataExport: false,
    allowCustomDomain: false,
    whiteLabel: false,
    websiteTemplate: 'minimal',
    navbarType: 'basic',
    templates: ['minimal-solo', 'clean-clinic', 'basic_minimal', 'template-1'],
    allowedTemplates: ['minimal-solo', 'clean-clinic', 'basic_minimal', 'template-1'],
    allowedColors: ['teal', 'blue', 'navy', 'green', 'rose', 'purple', 'emerald', 'indigo', 'gold', 'emerald-pro', 'royal-indigo', 'luxury-gold', 'sunset-amber', 'magenta-luxe', 'slate-graphite'],
    allowedShapes: ['pill', 'soft', 'sharp', 'curved', 'rounded-full', 'rounded-2xl', 'rounded-none'],
    publicWebsite: true,
    appointmentBooking: true,
    weeklyAvailability: true,
    whatsappWidget: false,
    patientReviews: false,
    videoBioSupport: false,
    vipSupportBadge: false,
    supportTier: 'Standard',
    brandingFooter: 'visible'
  },
  ADVANCED: {
    id: 'ADVANCED',
    name: 'Advanced Plan',
    price: 999,
    doctorLimit: 1,
    maxServices: Infinity,
    allowSplitShifts: true,
    allowSlotIntervals: true,
    defaultSlotDuration: 15,
    allowClinicalNotes: true,
    allowDataExport: false,
    allowCustomDomain: true,
    whiteLabel: false,
    websiteTemplate: 'specialty',
    navbarType: 'advanced',
    templates: ['minimal-solo', 'clean-clinic', 'oceanic-pro', 'pulse-compact', 'care-grid', 'basic_minimal', 'modern_converter', 'template-1', 'template-2'],
    allowedTemplates: ['minimal-solo', 'clean-clinic', 'oceanic-pro', 'pulse-compact', 'care-grid', 'basic_minimal', 'modern_converter', 'template-1', 'template-2'],
    allowedColors: ['teal', 'blue', 'emerald', 'navy', 'green', 'rose', 'purple', 'emerald-pro', 'royal-indigo', 'luxury-gold', 'sunset-amber', 'magenta-luxe', 'slate-graphite', 'indigo', 'gold'],
    allowedShapes: ['curved', 'soft', 'pill', 'sharp', 'rounded-full', 'rounded-2xl', 'rounded-none'],
    publicWebsite: true,
    appointmentBooking: true,
    weeklyAvailability: true,
    whatsappWidget: true,
    patientReviews: true,
    videoBioSupport: false,
    vipSupportBadge: false,
    supportTier: 'Priority',
    brandingFooter: 'subtle'
  },
  PRO: {
    id: 'ADVANCED',
    name: 'Advanced Plan',
    price: 999,
    doctorLimit: 1,
    maxServices: Infinity,
    allowSplitShifts: true,
    allowSlotIntervals: true,
    defaultSlotDuration: 15,
    allowClinicalNotes: true,
    allowDataExport: false,
    allowCustomDomain: true,
    whiteLabel: false,
    websiteTemplate: 'specialty',
    navbarType: 'advanced',
    templates: ['minimal-solo', 'clean-clinic', 'oceanic-pro', 'pulse-compact', 'care-grid', 'basic_minimal', 'modern_converter', 'template-1', 'template-2'],
    allowedTemplates: ['minimal-solo', 'clean-clinic', 'oceanic-pro', 'pulse-compact', 'care-grid', 'basic_minimal', 'modern_converter', 'template-1', 'template-2'],
    allowedColors: ['teal', 'blue', 'emerald', 'navy', 'green', 'rose', 'purple', 'emerald-pro', 'royal-indigo', 'luxury-gold', 'sunset-amber', 'magenta-luxe', 'slate-graphite', 'indigo', 'gold'],
    allowedShapes: ['curved', 'soft', 'pill', 'sharp', 'rounded-full', 'rounded-2xl', 'rounded-none'],
    publicWebsite: true,
    appointmentBooking: true,
    weeklyAvailability: true,
    whatsappWidget: true,
    patientReviews: true,
    videoBioSupport: false,
    vipSupportBadge: false,
    supportTier: 'Priority',
    brandingFooter: 'subtle'
  },
  PREMIUM: {
    id: 'PREMIUM',
    name: 'Premium Tier',
    price: 1499,
    doctorLimit: 1,
    maxServices: Infinity,
    allowSplitShifts: true,
    allowSlotIntervals: true,
    defaultSlotDuration: 15,
    allowClinicalNotes: true,
    allowDataExport: true,
    allowCustomDomain: true,
    whiteLabel: true,
    websiteTemplate: 'executive_luxury',
    navbarType: 'premium',
    templates: ['minimal-solo', 'clean-clinic', 'oceanic-pro', 'pulse-compact', 'care-grid', 'executive-vip', 'apex-specialty', 'elite-hospital', 'radiance-modern', 'basic_minimal', 'modern_converter', 'executive_luxury', 'specialist_dark', 'template-1', 'template-2', 'template-4'],
    allowedTemplates: ['minimal-solo', 'clean-clinic', 'oceanic-pro', 'pulse-compact', 'care-grid', 'executive-vip', 'apex-specialty', 'elite-hospital', 'radiance-modern', 'basic_minimal', 'modern_converter', 'executive_luxury', 'specialist_dark', 'template-1', 'template-2', 'template-4'],
    allowedColors: ['teal', 'blue', 'emerald', 'navy', 'rose', 'indigo', 'gold', 'green', 'purple', 'emerald-pro', 'royal-indigo', 'luxury-gold', 'sunset-amber', 'magenta-luxe', 'slate-graphite'],
    allowedShapes: ['curved', 'soft', 'pill', 'sharp', 'rounded-full', 'rounded-2xl', 'rounded-none'],
    publicWebsite: true,
    appointmentBooking: true,
    weeklyAvailability: true,
    whatsappWidget: true,
    patientReviews: true,
    videoBioSupport: true,
    vipSupportBadge: true,
    supportTier: 'VIP SLA <15m',
    brandingFooter: 'none'
  },
  ENTERPRISE: {
    id: 'PREMIUM',
    name: 'Premium Tier',
    price: 1499,
    doctorLimit: 1,
    maxServices: Infinity,
    allowSplitShifts: true,
    allowSlotIntervals: true,
    defaultSlotDuration: 15,
    allowClinicalNotes: true,
    allowDataExport: true,
    allowCustomDomain: true,
    whiteLabel: true,
    websiteTemplate: 'executive_luxury',
    navbarType: 'premium',
    templates: ['minimal-solo', 'clean-clinic', 'oceanic-pro', 'pulse-compact', 'care-grid', 'executive-vip', 'apex-specialty', 'elite-hospital', 'radiance-modern', 'basic_minimal', 'modern_converter', 'executive_luxury', 'specialist_dark', 'template-1', 'template-2', 'template-4'],
    allowedTemplates: ['minimal-solo', 'clean-clinic', 'oceanic-pro', 'pulse-compact', 'care-grid', 'executive-vip', 'apex-specialty', 'elite-hospital', 'radiance-modern', 'basic_minimal', 'modern_converter', 'executive_luxury', 'specialist_dark', 'template-1', 'template-2', 'template-4'],
    allowedColors: ['teal', 'blue', 'emerald', 'navy', 'rose', 'indigo', 'gold', 'green', 'purple', 'emerald-pro', 'royal-indigo', 'luxury-gold', 'sunset-amber', 'magenta-luxe', 'slate-graphite'],
    allowedShapes: ['curved', 'soft', 'pill', 'sharp', 'rounded-full', 'rounded-2xl', 'rounded-none'],
    publicWebsite: true,
    appointmentBooking: true,
    weeklyAvailability: true,
    whatsappWidget: true,
    patientReviews: true,
    videoBioSupport: true,
    vipSupportBadge: true,
    supportTier: 'VIP SLA <15m',
    brandingFooter: 'none'
  }
};

export function getPlanConfig(planId) {
  if (!planId) return PLAN_CONFIG.BASIC;
  const key = String(planId).toUpperCase().trim();
  return PLAN_CONFIG[key] || PLAN_CONFIG.BASIC;
}

export function getPlanTier(planId) {
  const cfg = getPlanConfig(planId);
  const isBasic = cfg.id === 'BASIC';
  const isAdvanced = cfg.id === 'ADVANCED' || cfg.id === 'PRO' || cfg.price >= 999;
  const isPremium = cfg.id === 'PREMIUM' || cfg.id === 'ENTERPRISE' || cfg.price >= 1499;

  return {
    ...cfg,
    isBasic,
    isAdvanced,
    isPremium,
    allowedColors: cfg.allowedColors || ['teal', 'blue'],
    allowedShapes: cfg.allowedShapes || ['curved'],
    tierName: isPremium ? 'PREMIUM' : isAdvanced ? 'ADVANCED' : 'BASIC'
  };
}

export function canUseFeature(planId, featureName) {
  const config = getPlanConfig(planId);
  return Boolean(config[featureName]);
}

export function canAddService(currentCount, planId) {
  const config = getPlanConfig(planId);
  if (config.maxServices === Infinity || config.maxServices === 999) return true;
  return currentCount < config.maxServices;
}
