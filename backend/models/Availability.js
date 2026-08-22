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
  isClosed: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

export default mongoose.models.Availability || mongoose.model("Availability", AvailabilitySchema);
