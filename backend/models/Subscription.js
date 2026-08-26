import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    planId: { 
      type: String, 
      trim: true,
      uppercase: true,
      enum: [
        "starter", "basic", "pro", "advanced", "premium", "enterprise", "professional",
        "STARTER", "BASIC", "PRO", "ADVANCED", "PREMIUM", "ENTERPRISE", "PROFESSIONAL"
      ], 
      default: "STARTER" 
    },
    billingCycle: { 
      type: String, 
      trim: true,
      uppercase: true,
      enum: ["MONTHLY", "YEARLY", "monthly", "yearly"], 
      default: "MONTHLY" 
    },
    price: { type: Number, required: true },
    status: { 
      type: String, 
      trim: true,
      uppercase: true,
      enum: ["TRIAL", "ACTIVE", "EXPIRED", "CANCELLED", "trial", "active", "expired", "cancelled", "pending", "PENDING"], 
      default: "TRIAL" 
    },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date, required: true }
  },
  { timestamps: true }
);

export default mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema);
