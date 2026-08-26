import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "../../../../backend/config/db.js";
import { verifyToken, signToken } from "../../../../backend/utils/jwt.js";
import User from "../../../../backend/models/User.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/admin/clinics-manager", request.url));
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.redirect(new URL("/admin/clinics-manager?error=invalid_token", request.url));
    }

    await connectDB();
    const doctorUser = await User.findById(decoded.id).lean();
    if (!doctorUser) {
      return NextResponse.redirect(new URL("/admin/clinics-manager?error=doctor_not_found", request.url));
    }

    // Set cookie headers for session transition
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    
    response.cookies.set("token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400,
      path: "/",
    });

    response.cookies.set("user_role", doctorUser.role || "DOCTOR", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Impersonate Auth Error:", err);
    return NextResponse.redirect(new URL("/admin/clinics-manager", request.url));
  }
}
