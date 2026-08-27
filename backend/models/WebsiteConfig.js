import mongoose from "mongoose";

const WebsiteConfigSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
      unique: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    templateId: {
      type: String,
      enum: ["template-1", "template-2", "template-3"],
      default: "template-1",
    },
    doctorPhoto: {
      type: String,
      default: "",
    },
    clinicLogo: {
      type: String,
      default: "",
    },
    themeColor: {
      type: String,
      default: "",
    },
    primaryColor: {
      type: String,
      default: "#2563eb",
    },
    fontStyle: {
      type: String,
      default: "Plus Jakarta Sans",
    },
    buttonStyle: {
      type: String,
      enum: ["rounded-lg", "rounded-xl", "rounded-2xl", "rounded-full", "rounded-none"],
      default: "rounded-xl",
    },
    showSections: {
      about: { type: Boolean, default: true },
      services: { type: Boolean, default: true },
      timings: { type: Boolean, default: true },
      contact: { type: Boolean, default: true },
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.WebsiteConfig || mongoose.model("WebsiteConfig", WebsiteConfigSchema);
