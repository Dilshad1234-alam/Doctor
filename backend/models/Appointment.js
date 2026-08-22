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
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  patientPhone: {
    type: String,
    required: true,
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
    enum: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"],
    default: "PENDING",
  }
}, { timestamps: true });

export default mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema);
