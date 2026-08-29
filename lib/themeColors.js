// Color & Shape Mapping Dictionary for Clinic Websites

export const THEME_COLOR_MAP = {
  teal: { id: 'teal', name: 'Teal', primary: '#0A8692', hover: '#086e78', light: '#E6F6F7', border: '#0A8692', text: '#0A8692' },
  blue: { id: 'blue', name: 'Blue', primary: '#3B82F6', hover: '#2563EB', light: '#EFF6FF', border: '#BFDBFE', text: '#3B82F6' },
  navy: { id: 'navy', name: 'Navy', primary: '#334155', hover: '#1E293B', light: '#F1F5F9', border: '#CBD5E1', text: '#334155' },
  green: { id: 'green', name: 'Green', primary: '#10B981', hover: '#059669', light: '#ECFDF5', border: '#A7F3D0', text: '#10B981' },
  rose: { id: 'rose', name: 'Rose', primary: '#F43F5E', hover: '#E11D48', light: '#FFF1F2', border: '#FECDD3', text: '#F43F5E' },
  purple: { id: 'purple', name: 'Purple', primary: '#8B5CF6', hover: '#7C3AED', light: '#F5F3FF', border: '#DDD6FE', text: '#8B5CF6' },
  'emerald-pro': { id: 'emerald-pro', name: 'Emerald', primary: '#059669', hover: '#047857', light: '#ECFDF5', border: '#A7F3D0', text: '#059669' },
  'royal-indigo': { id: 'royal-indigo', name: 'Indigo', primary: '#4F46E5', hover: '#4338CA', light: '#EEF2FF', border: '#C7D2FE', text: '#4F46E5' },
  'luxury-gold': { id: 'luxury-gold', name: 'Gold', primary: '#D97706', hover: '#B45309', light: '#FEF3C7', border: '#FDE68A', text: '#D97706' },
  'sunset-amber': { id: 'sunset-amber', name: 'Amber', primary: '#EA580C', hover: '#C2410C', light: '#FFF7ED', border: '#FFEDD5', text: '#EA580C' },
  'magenta-luxe': { id: 'magenta-luxe', name: 'Magenta', primary: '#C026D3', hover: '#A21CAF', light: '#FDF4FF', border: '#F5D0FE', text: '#C026D3' },
  'slate-graphite': { id: 'slate-graphite', name: 'Graphite', primary: '#1E293B', hover: '#0F172A', light: '#F8FAFC', border: '#E2E8F0', text: '#1E293B' },
  // Legacy aliases
  emerald: { id: 'emerald', name: 'Emerald', primary: '#059669', hover: '#047857', light: '#ECFDF5', border: '#A7F3D0', text: '#059669' },
  indigo: { id: 'indigo', name: 'Indigo', primary: '#4F46E5', hover: '#4338CA', light: '#EEF2FF', border: '#C7D2FE', text: '#4F46E5' },
  gold: { id: 'gold', name: 'Gold', primary: '#D97706', hover: '#B45309', light: '#FEF3C7', border: '#FDE68A', text: '#D97706' }
};

export const BUTTON_SHAPE_MAP = {
  'pill': 'rounded-full',
  'soft': 'rounded-2xl',
  'sharp': 'rounded-none',
  'rounded': 'rounded-2xl',
  'subtle': 'rounded-lg',
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
