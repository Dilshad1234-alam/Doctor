import { NextResponse } from "next/server";
import connectDB from "../../../../backend/config/db.js";
import User from "../../../../backend/models/User.js";
import bcrypt from "bcryptjs";
import { signToken } from "../../../../backend/utils/jwt.js";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please provide email and password" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token with role and onboarding status
    const token = signToken({
      id: user._id,
      role: user.role,
      hasCompletedOnboarding: user.hasCompletedOnboarding
    });

    // Routing decision logic
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const redirectUrl = isAdmin
      ? "/admin"
      : user.hasCompletedOnboarding
      ? "/dashboard"
      : "/dashboard/onboarding";

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        redirectUrl,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          hasCompletedOnboarding: user.hasCompletedOnboarding,
        },
      },
      { status: 200 }
    );

    // Set auth cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    response.cookies.set("user_role", user.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({ success: true, message: "Logged out" });
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
    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: "Logout failed" }, { status: 500 });
  }
}
