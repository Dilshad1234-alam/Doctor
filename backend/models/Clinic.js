import mongoose from "mongoose";

const ClinicSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  customDomain: {
    type: String,
    default: "",
  },
  coverImageUrl: {
    type: String,
    default: "",
  },
  logo: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    enum: ["INDIVIDUAL_CLINIC", "MULTI_DOCTOR_CLINIC", "HOSPITAL"],
    default: "INDIVIDUAL_CLINIC",
  },
  entityType: {
    type: String,
    enum: ["INDIVIDUAL_DOCTOR", "MULTI_DOCTOR_CLINIC", "HOSPITAL"],
    default: "INDIVIDUAL_DOCTOR",
  },
  category: {
    type: String,
    default: "Single Doctor Clinic",
  },
}, { timestamps: true });

export default mongoose.models.Clinic || mongoose.model("Clinic", ClinicSchema);
