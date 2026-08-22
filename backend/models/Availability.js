import mongoose from "mongoose";

const AvailabilitySchema = new mongoose.Schema({
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Clinic",
    required: true,
  },
  dayOfWeek: {
    type: Number, // 0 = Sunday, 1 = Monday, etc.
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  isOpen: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

export default mongoose.models.Availability || mongoose.model("Availability", AvailabilitySchema);
