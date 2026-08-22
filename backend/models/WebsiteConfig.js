import mongoose from "mongoose";

const WebsiteConfigSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
      unique: true,
    },
    templateId: {
      type: String,
      enum: ["template-1", "template-2", "template-3"],
      default: "template-1",
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
      enum: ["rounded-xl", "rounded-full", "rounded-none"],
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
