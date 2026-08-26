import mongoose from "mongoose";

const IndividualDoctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    practiceName: {
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
    specialization: {
      type: String,
      trim: true,
      default: "",
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    provider_type: {
      type: String,
      default: "individual_doctor",
    },
    role: {
      type: String,
      enum: ["INDIVIDUAL_DOCTOR", "MULTI_DOCTOR_CLINIC", "HOSPITAL", "ADMIN", "DOCTOR"],
      default: "INDIVIDUAL_DOCTOR",
    },
    accountType: {
      type: String,
      enum: ["INDIVIDUAL_DOCTOR", "MULTI_DOCTOR_CLINIC", "HOSPITAL", "ADMIN"],
      default: "INDIVIDUAL_DOCTOR",
    },
    entityType: {
      type: String,
      enum: ["INDIVIDUAL_DOCTOR", "MULTI_DOCTOR_CLINIC", "HOSPITAL"],
      default: "INDIVIDUAL_DOCTOR",
    },
    category: {
      type: String,
      default: "Solo Practitioner",
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
    collection: "individual_doctors",
  }
);

export default mongoose.models.IndividualDoctor ||
  mongoose.model("IndividualDoctor", IndividualDoctorSchema, "individual_doctors");
