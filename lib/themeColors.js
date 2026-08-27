// Color & Shape Mapping Dictionary for Clinic Websites

export const THEME_COLOR_MAP = {
  teal: { id: 'teal', name: 'Teal/Cyan (Brand)', primary: '#00A1AC', hover: '#008790', light: '#E6F6F7', border: '#B2E3E6', text: '#00A1AC' },
  blue: { id: 'blue', name: 'Clinical Blue', primary: '#2563EB', hover: '#1D4ED8', light: '#EFF6FF', border: '#BFDBFE', text: '#2563EB' },
  emerald: { id: 'emerald', name: 'Care Emerald', primary: '#059669', hover: '#047857', light: '#ECFDF5', border: '#A7F3D0', text: '#059669' },
  navy: { id: 'navy', name: 'Executive Navy', primary: '#0D3648', hover: '#07212D', light: '#E8F0F3', border: '#B4CDD6', text: '#0D3648' },
  rose: { id: 'rose', name: 'Gentle Rose', primary: '#E11D48', hover: '#BE123C', light: '#FFF1F2', border: '#FECDD3', text: '#E11D48' },
  indigo: { id: 'indigo', name: 'Royal Indigo', primary: '#4F46E5', hover: '#4338CA', light: '#EEF2FF', border: '#C7D2FE', text: '#4F46E5' },
  gold: { id: 'gold', name: 'Luxury Gold', primary: '#D97706', hover: '#B45309', light: '#FEF3C7', border: '#FDE68A', text: '#D97706' }
};

export const BUTTON_SHAPE_MAP = {
  'soft': 'rounded-xl',
  'curved': 'rounded-2xl',
  'pill': 'rounded-full',
  'sharp': 'rounded-none',
  'rounded-xl': 'rounded-xl',
  'rounded-2xl': 'rounded-2xl',
  'rounded-full': 'rounded-full',
  'rounded-none': 'rounded-none'
};

export function getThemeConfig(themeKey) {
  if (!themeKey) return THEME_COLOR_MAP.teal;
  const key = themeKey.toLowerCase();
  if (THEME_COLOR_MAP[key]) return THEME_COLOR_MAP[key];

  // Match by Hex
  for (const t of Object.values(THEME_COLOR_MAP)) {
    if (t.primary.toLowerCase() === key) return t;
  }
  return THEME_COLOR_MAP.teal;
}

export function getButtonShapeClass(shapeKey) {
  if (!shapeKey) return 'rounded-2xl';
  return BUTTON_SHAPE_MAP[shapeKey.toLowerCase()] || 'rounded-2xl';
}

export function resolveColor(rawColor) {
  return getThemeConfig(rawColor).primary;
}

export const LUXURY_THEME = {
  id: "luxury_gold",
  name: "Ultra-Luxury Executive Gold",
  colors: {
    bgDark: "#070F14",
    bgCard: "rgba(13, 24, 33, 0.8)",
    goldPrimary: "#D4AF37",
    goldLight: "#FDE68A",
    goldAccent: "#F59E0B",
    goldDark: "#B45309",
    borderGold: "rgba(212, 175, 55, 0.25)",
    borderGoldHover: "rgba(212, 175, 55, 0.6)",
    glowGold: "rgba(212, 175, 55, 0.15)",
  }
};
