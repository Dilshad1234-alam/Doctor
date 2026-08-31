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
    headline: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    themeColor: {
      type: String,
      default: "#00A1AC",
    },
    primaryColor: {
      type: String,
      default: "#00A1AC",
    },
    fontStyle: {
      type: String,
      default: "Plus Jakarta Sans",
    },
    buttonStyle: {
      type: String,
      default: "rounded-2xl",
    },
    buttonShape: {
      type: String,
      default: "curved",
    },
    previewMode: {
      type: String,
      default: "light",
    },
    hideBranding: {
      type: Boolean,
      default: false,
    },
    videoBioUrl: {
      type: String,
      default: "",
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
    enableWhatsappChat: {
      type: Boolean,
      default: true,
    },
    emergencyDayOff: {
      type: Boolean,
      default: false,
    },
    enableMaps: {
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

if (mongoose.models.WebsiteConfig) {
  delete mongoose.models.WebsiteConfig;
}

export default mongoose.model("WebsiteConfig", WebsiteConfigSchema);
