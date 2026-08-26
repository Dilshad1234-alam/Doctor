import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "../../../../backend/config/db.js";
import User from "../../../../models/User.js";
import IndividualDoctor from "../../../../models/IndividualDoctor.js";
import MultiDoctorClinic from "../../../../models/MultiDoctorClinic.js";
import Hospital from "../../../../models/Hospital.js";
import { signToken } from "../../../../backend/utils/jwt.js";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please provide both email and password" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Search User collection by email (Super Admin / Admin)
    const adminAccount = await User.findOne({ email: normalizedEmail });
    if (adminAccount) {
      const isMatch = await bcrypt.compare(password, adminAccount.password);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, error: "Invalid email or password" },
          { status: 401 }
        );
      }

      // Verify role === 'ADMIN' or 'SUPER_ADMIN'
      const role = adminAccount.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN";

      // Generate JWT cookie with { id, email, role }
      const token = signToken({
        id: adminAccount._id.toString(),
        email: adminAccount.email,
        role: "ADMIN",
        provider_type: "admin",
      });

      const response = NextResponse.json(
        {
          success: true,
          message: "Login successful",
          redirectUrl: "/admin",
          user: {
            id: adminAccount._id,
            name: adminAccount.name,
            email: adminAccount.email,
            role: "ADMIN",
            provider_type: "admin",
          },
        },
        { status: 200 }
      );

      // Set cookies
      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });

      response.cookies.set("user_role", "ADMIN", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });

      response.cookies.set("provider_type", "admin", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });

      return response;
    }

    // 2. If not found in User, search IndividualDoctor, then MultiDoctorClinic, then Hospital
    let account = null;
    let provider_type = null;
    let role = "DOCTOR";
    let redirectUrl = "/dashboard";
    let displayName = "";
    let entityName = "";

    // 2a. Search IndividualDoctor
    account = await IndividualDoctor.findOne({ email: normalizedEmail });
    if (account) {
      provider_type = "individual_doctor";
      role = account.role || "INDIVIDUAL_DOCTOR";
      redirectUrl = "/dashboard";
      displayName = account.name;
      entityName = account.practiceName || "";
    }

    // 2b. Search MultiDoctorClinic
    if (!account) {
      account = await MultiDoctorClinic.findOne({ email: normalizedEmail });
      if (account) {
        provider_type = "clinic";
        role = account.role || "MULTI_DOCTOR_CLINIC";
        redirectUrl = "/dashboard/clinic";
        displayName = account.adminName;
        entityName = account.clinicName || "";
      }
    }

    // 2c. Search Hospital
    if (!account) {
      account = await Hospital.findOne({ email: normalizedEmail });
      if (account) {
        provider_type = "hospital";
        role = account.role || "HOSPITAL";
        redirectUrl = "/dashboard/hospital";
        displayName = account.adminName;
        entityName = account.hospitalName || "";
      }
    }

    // If account not found in any collection
    if (!account) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify hashed password
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const entityType =
      account.entityType ||
      (provider_type === "clinic"
        ? "MULTI_DOCTOR_CLINIC"
        : provider_type === "hospital"
        ? "HOSPITAL"
        : "INDIVIDUAL_DOCTOR");

    const category =
      account.category ||
      (provider_type === "hospital"
        ? "Hospital"
        : provider_type === "clinic"
        ? "Multi-Doctor Clinic"
        : account.specialization || "Solo Practitioner");

    const isOnboardingCompleted = Boolean(
      account.isOnboardingCompleted || account.hasCompletedOnboarding
    );

    // Issue JWT session with provider_type, role, entityType, category, and isOnboardingCompleted
    const token = signToken({
      id: account._id.toString(),
      email: account.email,
      provider_type,
      role,
      entityType,
      category,
      isOnboardingCompleted,
      hasCompletedOnboarding: isOnboardingCompleted,
    });

    const finalRedirectUrl =
      role === "ADMIN" || role === "SUPER_ADMIN"
        ? "/admin"
        : !isOnboardingCompleted
        ? "/dashboard/onboarding"
        : redirectUrl;

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        redirectUrl: finalRedirectUrl,
        user: {
          id: account._id,
          name: displayName,
          entityName: entityName || undefined,
          email: account.email,
          phone: account.phone || undefined,
          provider_type,
          role,
          accountType: account.accountType || role,
          entityType,
          category,
          slug: account.slug || undefined,
          website_status: account.website_status || undefined,
          subscription_status: account.subscription_status || undefined,
          isOnboardingCompleted,
          hasCompletedOnboarding: isOnboardingCompleted,
        },
      },
      { status: 200 }
    );

    // Set auth cookies
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    response.cookies.set("user_role", role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    response.cookies.set("provider_type", provider_type, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    response.cookies.set("is_onboarding_completed", String(isOnboardingCompleted), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Multi-Collection Login Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    response.cookies.set("token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });
    response.cookies.set("user_role", "", {
      httpOnly: false,
      expires: new Date(0),
      path: "/",
    });
    response.cookies.set("provider_type", "", {
      httpOnly: false,
      expires: new Date(0),
      path: "/",
    });
    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: "Logout failed" }, { status: 500 });
  }
}
