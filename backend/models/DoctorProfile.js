import mongoose from "mongoose";

const DoctorProfileSchema = new mongoose.Schema({
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
    required: true,
  },
  qualification: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  experienceYrs: {
    type: Number,
    required: true,
  },
  avatarUrl: {
    type: String,
    default: "",
  },
}, { timestamps: true });

export default mongoose.models.DoctorProfile || mongoose.model("DoctorProfile", DoctorProfileSchema);
