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
    name: "Starter",
    priceMonthly: 499,
    priceYearly: 399,
    description: "For solo doctors establishing their initial digital presence.",
    features: [
      "Doctor Website",
      "Online Booking",
      "Basic Templates",
      "5 Services",
      "Community Support",
    ],
    isPopular: false,
  },
  {
    planId: "pro",
    name: "Pro",
    priceMonthly: 1299,
    priceYearly: 999,
    description: "Complete practice automation for busy medical clinics.",
    features: [
      "Everything in Starter",
      "Unlimited Services",
      "Custom Availability",
      "Premium Templates",
      "Priority Support",
      "Analytics Dashboard",
    ],
    isPopular: true,
  },
  {
    planId: "premium",
    name: "Premium",
    priceMonthly: 2999,
    priceYearly: 2499,
    description: "White-label solution with custom domains and multi-doctor rosters.",
    features: [
      "Everything in Pro",
      "Custom Domain",
      "White-label Solution",
      "Dedicated Account Manager",
      "Advanced CRM",
      "Multi-Doctor Support",
    ],
    isPopular: false,
  },
];

export default mongoose.models.Plan || mongoose.model("Plan", PlanSchema);
