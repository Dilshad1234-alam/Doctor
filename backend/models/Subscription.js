import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    planId: { 
      type: String, 
      trim: true,
      uppercase: true,
      default: "BASIC" 
    },
    planName: { type: String, default: "Basic Plan" },
    billingCycle: { 
      type: String, 
      trim: true,
      uppercase: true,
      default: "MONTHLY" 
    },
    price: { type: Number, required: true, default: 499 },
    status: { 
      type: String, 
      trim: true,
      uppercase: true,
      default: "ACTIVE" 
    },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date, required: true }
  },
  { timestamps: true }
);

export default mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema);
