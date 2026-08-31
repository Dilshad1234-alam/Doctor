import mongoose from "mongoose";

const DoctorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },
    fullName: {
      type: String,
      default: "Dr. Specialist",
    },
    qualification: {
      type: String,
      default: "MBBS",
    },
    specialization: {
      type: String,
      default: "General Physician",
    },
    specialty: {
      type: String,
      default: "general_opd",
    },
    experienceYrs: {
      type: Number,
      default: 5,
    },
    regNumber: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["INDIVIDUAL_DOCTOR", "CLINIC_DOCTOR", "HOSPITAL_DOCTOR"],
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
    shifts: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    opdAvailability: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    dailyPatientLimit: {
      type: Number,
      default: 30,
    },
    enableDailyLimit: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.DoctorProfile || mongoose.model("DoctorProfile", DoctorProfileSchema);
