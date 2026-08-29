import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Clinic",
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DoctorProfile",
    required: false,
  },
  tokenNumber: {
    type: Number,
    default: 1,
  },
  patientName: {
    type: String,
    required: true,
  },
  patientPhone: {
    type: String,
    required: true,
  },
  patientAge: {
    type: Number,
  },
  patientGender: {
    type: String,
  },
  serviceName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  timeSlot: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["WAITING", "IN_CONSULTATION", "COMPLETED", "CANCELLED", "PENDING", "CONFIRMED"],
    default: "WAITING",
  },
  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAID_CASH", "PAID_UPI", "PAID_ONLINE"],
    default: "PENDING",
  },
  paymentMethod: {
    type: String,
    default: "Cash",
  },
  clinicalNotes: {
    type: String,
    default: "",
  },
  isWalkIn: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

export default mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema);
