import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "../../../../backend/config/db.js";
import IndividualDoctor from "../../../../models/IndividualDoctor.js";
import MultiDoctorClinic from "../../../../models/MultiDoctorClinic.js";
import Hospital from "../../../../models/Hospital.js";
import User from "../../../../models/User.js";
import { signToken } from "../../../../backend/utils/jwt.js";

// Helper function to auto-generate clean unique slug
const generateSlug = (text) => {
  if (!text) return `practice-${Date.now()}`;
  const base = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
  return `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
};

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      name,
      entityName,
      email,
      phone,
      password,
      provider_type = "individual_doctor",
      specialization = "",
    } = body;

    // 1. Validation
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, error: "Please provide all required fields (name, email, phone, password)" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone.trim();

    // 2. Check if email already exists across IndividualDoctor, MultiDoctorClinic, or Hospital models
    const [existingDoctor, existingClinic, existingHospital, existingAdmin] = await Promise.all([
      IndividualDoctor.findOne({ email: normalizedEmail }),
      MultiDoctorClinic.findOne({ email: normalizedEmail }),
      Hospital.findOne({ email: normalizedEmail }),
      User.findOne({ email: normalizedEmail }),
    ]);

    if (existingDoctor || existingClinic || existingHospital || existingAdmin) {
      return NextResponse.json(
        { success: false, error: "An account with this email address already exists" },
        { status: 409 }
      );
    }

    // 3. Hash password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let doc = null;

    const incomingRole = (body.role || body.accountType || body.entityType || "").toUpperCase();
    const resolvedType =
      incomingRole === "MULTI_DOCTOR_CLINIC" || provider_type === "clinic"
        ? "clinic"
        : incomingRole === "HOSPITAL" || provider_type === "hospital"
        ? "hospital"
        : "individual_doctor";

    // 4. Save directly into designated MongoDB collection based on resolved provider/entity type
    if (resolvedType === "individual_doctor") {
      const practiceName = entityName || `${name}'s Practice`;
      const slug = generateSlug(practiceName);

      doc = await IndividualDoctor.create({
        name: name.trim(),
        practiceName: practiceName.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        password: hashedPassword,
        specialization: specialization ? specialization.trim() : "General Practice",
        slug,
        provider_type: "individual_doctor",
        role: "INDIVIDUAL_DOCTOR",
        accountType: "INDIVIDUAL_DOCTOR",
        entityType: "INDIVIDUAL_DOCTOR",
        category: body.category || (specialization ? specialization.trim() : "Solo Practitioner"),
        website_status: "draft",
        subscription_status: "none",
        hasCompletedOnboarding: false,
        isOnboardingCompleted: false,
      });
    } else if (resolvedType === "clinic") {
      const clinicName = entityName || `${name}'s Clinic`;
      const slug = generateSlug(clinicName);

      doc = await MultiDoctorClinic.create({
        adminName: name.trim(),
        clinicName: clinicName.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        password: hashedPassword,
        specialities: specialization ? [specialization.trim()] : ["Multi-Specialty"],
        doctors: [],
        slug,
        provider_type: "clinic",
        role: "MULTI_DOCTOR_CLINIC",
        accountType: "MULTI_DOCTOR_CLINIC",
        entityType: "MULTI_DOCTOR_CLINIC",
        category: body.category || "Multi-Doctor Clinic",
        website_status: "draft",
        subscription_status: "none",
        hasCompletedOnboarding: false,
        isOnboardingCompleted: false,
      });
    } else if (resolvedType === "hospital") {
      const hospitalName = entityName || `${name}'s Hospital`;
      const slug = generateSlug(hospitalName);

      doc = await Hospital.create({
        adminName: name.trim(),
        hospitalName: hospitalName.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        password: hashedPassword,
        emergencyContact: normalizedPhone,
        departments: [],
        doctors: [],
        slug,
        provider_type: "hospital",
        role: "HOSPITAL",
        accountType: "HOSPITAL",
        entityType: "HOSPITAL",
        category: body.category || "Hospital",
        website_status: "draft",
        subscription_status: "none",
        hasCompletedOnboarding: false,
        isOnboardingCompleted: false,
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid provider_type or role" },
        { status: 400 }
      );
    }

    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Could not create provider account" },
        { status: 500 }
      );
    }

    // 5. Issue session JWT and cookies for instant frictionless redirect
    const token = signToken({
      id: doc._id.toString(),
      email: doc.email,
      provider_type: doc.provider_type,
      role: doc.role,
      entityType: doc.entityType,
      category: doc.category,
      isOnboardingCompleted: false,
      hasCompletedOnboarding: false,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        redirectUrl: "/dashboard/onboarding",
        user: {
          id: doc._id,
          name: doc.name || doc.adminName,
          email: doc.email,
          phone: doc.phone,
          provider_type: doc.provider_type,
          role: doc.role,
          accountType: doc.accountType,
          entityType: doc.entityType,
          category: doc.category,
          isOnboardingCompleted: false,
          hasCompletedOnboarding: false,
        },
      },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    response.cookies.set("user_role", doc.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    response.cookies.set("provider_type", doc.provider_type, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    response.cookies.set("is_onboarding_completed", "false", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
