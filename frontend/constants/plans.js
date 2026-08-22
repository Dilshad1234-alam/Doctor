export const PRICING_PLANS = [
  {
    id: "STARTER",
    name: "Starter",
    badge: "For new clinics",
    monthlyPrice: 499,
    yearlyPrice: 4790, // Approx 20% off
    features: [
      "Manage up to 50 Appointments/mo",
      "Basic Public Clinic Page",
      "Standard Analytics",
      "Email Support"
    ],
    recommended: false
  },
  {
    id: "PROFESSIONAL",
    name: "Pro Practice",
    badge: "Most Popular",
    monthlyPrice: 1299,
    yearlyPrice: 12470, // Approx 20% off
    features: [
      "Unlimited Appointments",
      "Advanced Public Clinic Page",
      "Custom Working Hours & Services",
      "Real-time Dashboard Analytics",
      "Priority Email & Chat Support"
    ],
    recommended: true
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    badge: "For large hospitals",
    monthlyPrice: 2999,
    yearlyPrice: 28790, // Approx 20% off
    features: [
      "Everything in Pro Practice",
      "Multiple Doctor Profiles",
      "Staff Management",
      "Custom Domain Support",
      "24/7 Phone & Priority Support"
    ],
    recommended: false
  }
];
