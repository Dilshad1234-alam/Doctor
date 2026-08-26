import mongoose from "mongoose";

const MultiDoctorClinicSchema = new mongoose.Schema(
  {
    adminName: {
      type: String,
      required: true,
      trim: true,
    },
    clinicName: {
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
    specialities: [
      {
        type: String,
        trim: true,
      },
    ],
    doctors: [
      {
        name: { type: String, trim: true },
        specialization: { type: String, trim: true },
        qualification: { type: String, trim: true },
        fee: { type: Number, default: 0 },
        timing: { type: String, trim: true },
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
      default: "clinic",
    },
    role: {
      type: String,
      enum: ["INDIVIDUAL_DOCTOR", "MULTI_DOCTOR_CLINIC", "HOSPITAL", "ADMIN", "CLINIC_ADMIN"],
      default: "MULTI_DOCTOR_CLINIC",
    },
    accountType: {
      type: String,
      enum: ["INDIVIDUAL_DOCTOR", "MULTI_DOCTOR_CLINIC", "HOSPITAL", "ADMIN"],
      default: "MULTI_DOCTOR_CLINIC",
    },
    entityType: {
      type: String,
      enum: ["INDIVIDUAL_DOCTOR", "MULTI_DOCTOR_CLINIC", "HOSPITAL"],
      default: "MULTI_DOCTOR_CLINIC",
    },
    category: {
      type: String,
      default: "Multi-Doctor Clinic",
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
    collection: "multi_doctor_clinics",
  }
);

export default mongoose.models.MultiDoctorClinic ||
  mongoose.model("MultiDoctorClinic", MultiDoctorClinicSchema, "multi_doctor_clinics");
