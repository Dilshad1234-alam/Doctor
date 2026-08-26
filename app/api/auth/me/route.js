import { NextResponse } from "next/server";
import connectDB from "../../../../backend/config/db.js";
import User from "../../../../backend/models/User.js";
import IndividualDoctor from "../../../../backend/models/IndividualDoctor.js";
import MultiDoctorClinic from "../../../../backend/models/MultiDoctorClinic.js";
import Hospital from "../../../../backend/models/Hospital.js";
import { verifyToken } from "../../../../backend/utils/jwt.js";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await connectDB();

    // Read cookie token
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authorized, no token" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { success: false, error: "Not authorized, token failed" },
        { status: 401 }
      );
    }

    let user = null;
    const providerType = decoded.provider_type;

    // Resolve user based on provider_type if available in token
    if (providerType === "admin") {
      user = await User.findById(decoded.id).select("-password").lean();
    } else if (providerType === "individual_doctor") {
      user = await IndividualDoctor.findById(decoded.id).select("-password").lean();
    } else if (providerType === "clinic") {
      user = await MultiDoctorClinic.findById(decoded.id).select("-password").lean();
    } else if (providerType === "hospital") {
      user = await Hospital.findById(decoded.id).select("-password").lean();
    } else {
      // Fallback search across models
      user =
        (await User.findById(decoded.id).select("-password").lean()) ||
        (await IndividualDoctor.findById(decoded.id).select("-password").lean()) ||
        (await MultiDoctorClinic.findById(decoded.id).select("-password").lean()) ||
        (await Hospital.findById(decoded.id).select("-password").lean());
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Account not found" },
        { status: 404 }
      );
    }

    const resolvedRole =
      user.role ||
      (user.provider_type === "clinic"
        ? "MULTI_DOCTOR_CLINIC"
        : user.provider_type === "hospital"
        ? "HOSPITAL"
        : "INDIVIDUAL_DOCTOR");

    const resolvedEntityType =
      user.entityType ||
      (user.provider_type === "clinic"
        ? "MULTI_DOCTOR_CLINIC"
        : user.provider_type === "hospital"
        ? "HOSPITAL"
        : "INDIVIDUAL_DOCTOR");

    const resolvedCategory =
      user.category ||
      (user.provider_type === "hospital"
        ? "Hospital"
        : user.provider_type === "clinic"
        ? "Multi-Doctor Clinic"
        : user.specialization || "Solo Practitioner");

    const isOnboardingCompleted = Boolean(
      user.isOnboardingCompleted || user.hasCompletedOnboarding
    );

    // Format standard response object
    const userPayload = {
      ...user,
      id: user._id,
      name: user.name || user.adminName,
      entityName: user.practiceName || user.clinicName || user.hospitalName || "",
      provider_type: user.provider_type || (user.role && user.role.includes("ADMIN") ? "admin" : "individual_doctor"),
      role: resolvedRole,
      accountType: user.accountType || resolvedRole,
      entityType: resolvedEntityType,
      category: resolvedCategory,
      isOnboardingCompleted,
      hasCompletedOnboarding: isOnboardingCompleted,
    };

    return NextResponse.json(
      { success: true, user: userPayload },
      { status: 200 }
    );
  } catch (error) {
    console.error("Auth Me Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
