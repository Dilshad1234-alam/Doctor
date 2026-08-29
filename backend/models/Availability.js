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
    default: "09:00",
  },
  endTime: {
    type: String,
    required: true,
    default: "17:00",
  },
  morningStartTime: {
    type: String,
    default: "09:00",
  },
  morningEndTime: {
    type: String,
    default: "13:00",
  },
  eveningStartTime: {
    type: String,
    default: "17:00",
  },
  eveningEndTime: {
    type: String,
    default: "21:00",
  },
  slotDuration: {
    type: Number,
    default: 15,
  },
  isEmergencyClosed: {
    type: Boolean,
    default: false,
  },
  isOpen: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

export default mongoose.models.Availability || mongoose.model("Availability", AvailabilitySchema);
