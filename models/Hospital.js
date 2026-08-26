import mongoose from "mongoose";

const HospitalSchema = new mongoose.Schema(
  {
    adminName: {
      type: String,
      required: true,
      trim: true,
    },
    hospitalName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    emergencyContact: {
      type: String,
      trim: true,
      default: "",
    },
    departments: [
      {
        name: { type: String, trim: true },
        description: { type: String, trim: true },
        icon: { type: String, trim: true },
      },
    ],
    doctors: [
      {
        name: { type: String, trim: true },
        department: { type: String, trim: true },
        specialization: { type: String, trim: true },
        fee: { type: Number, default: 0 },
      },
    ],
    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    provider_type: {
      type: String,
      default: "hospital",
    },
    role: {
      type: String,
      enum: ["INDIVIDUAL_DOCTOR", "MULTI_DOCTOR_CLINIC", "HOSPITAL", "ADMIN", "HOSPITAL_ADMIN"],
      default: "HOSPITAL",
    },
    accountType: {
      type: String,
      enum: ["INDIVIDUAL_DOCTOR", "MULTI_DOCTOR_CLINIC", "HOSPITAL", "ADMIN"],
      default: "HOSPITAL",
    },
    entityType: {
      type: String,
      enum: ["INDIVIDUAL_DOCTOR", "MULTI_DOCTOR_CLINIC", "HOSPITAL"],
      default: "HOSPITAL",
    },
    category: {
      type: String,
      default: "Hospital",
    },
    website_status: {
      type: String,
      enum: ["draft", "preview", "published"],
      default: "draft",
    },
    subscription_status: {
      type: String,
      enum: ["none", "pending", "active", "trial"],
      default: "none",
    },
    hasCompletedOnboarding: {
      type: Boolean,
      default: false,
    },
    isOnboardingCompleted: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "hospitals",
  }
);

export default mongoose.models.Hospital ||
  mongoose.model("Hospital", HospitalSchema, "hospitals");
