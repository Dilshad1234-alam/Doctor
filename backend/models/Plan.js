import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema(
  {
    planId: {
      type: String,
      required: true,
      unique: true,
      enum: ["starter", "pro", "premium"],
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    priceMonthly: {
      type: Number,
      required: true,
    },
    priceYearly: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: "",
    },
    features: [{ type: String }],
    isPopular: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const defaultPlans = [
  {
    planId: "starter",
    name: "Basic / Starter",
    priceMonthly: 499,
    priceYearly: 399,
    description: "For new / solo doctors establishing their initial digital presence.",
    features: [
      "1 Doctor Practice (Solo Doctor)",
      "Basic Website Templates",
      "Public Website & Appointment Booking",
      "Up to 5 Clinical Services",
      "Weekly Availability & Slot Engine",
      "Basic Contact & Booking History",
      "Platform Subdomain URL",
      "Standard Support",
    ],
    isPopular: false,
  },
  {
    planId: "pro",
    name: "Advanced / Pro",
    priceMonthly: 999,
    priceYearly: 799,
    description: "For active private practices wanting full automation.",
    features: [
      "1 Doctor Practice",
      "Basic + Advanced Website Templates",
      "Unlimited Services",
      "Full Booking History + Search & Filters",
      "Custom Domain + Subdomain Included",
      "Advanced Sections & Branding Customization",
      "Website + Booking Analytics",
      "Priority Support",
    ],
    isPopular: true,
  },
  {
    planId: "premium",
    name: "Premium",
    priceMonthly: 1499,
    priceYearly: 1199,
    description: "Maximum control, white-label branding & top-tier templates.",
    features: [
      "1 Doctor Practice",
      "All + Premium Website Templates",
      "Unlimited Services",
      "Advanced Patient Management View",
      "Custom Domain & Subdomain",
      "Maximum Template Controls",
      "Advanced Analytics & Export Reports",
      "Zero Platform Branding (100% White-label)",
      "Priority Support + Onboarding Assistance",
    ],
    isPopular: false,
  },
];

export default mongoose.models.Plan || mongoose.model("Plan", PlanSchema);
