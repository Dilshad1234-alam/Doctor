import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
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
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["INDIVIDUAL_DOCTOR", "MULTI_DOCTOR_CLINIC", "HOSPITAL", "ADMIN", "SUPER_ADMIN"],
      default: "ADMIN",
    },
    accountType: {
      type: String,
      enum: ["INDIVIDUAL_DOCTOR", "MULTI_DOCTOR_CLINIC", "HOSPITAL", "ADMIN", "SUPER_ADMIN"],
      default: "ADMIN",
    },
    entityType: {
      type: String,
      enum: ["INDIVIDUAL_DOCTOR", "MULTI_DOCTOR_CLINIC", "HOSPITAL", "ADMIN"],
      default: "INDIVIDUAL_DOCTOR",
    },
    category: {
      type: String,
      default: "Solo Practitioner",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema, "users");
