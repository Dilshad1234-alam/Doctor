import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    planId: { 
      type: String, 
      enum: ["STARTER", "PROFESSIONAL", "ENTERPRISE"], 
      required: true 
    },
    billingCycle: { 
      type: String, 
      enum: ["MONTHLY", "YEARLY"], 
      required: true 
    },
    price: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ["TRIAL", "ACTIVE", "EXPIRED", "CANCELLED"], 
      default: "TRIAL" 
    },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date, required: true }
  },
  { timestamps: true }
);

export default mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema);
