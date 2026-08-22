import { NextResponse } from "next/server";
import connectDB from "../../../../backend/config/db.js";
import User from "../../../../backend/models/User.js";
import { verifyToken } from "../../../../backend/utils/jwt.js";

export async function GET(req) {
  try {
    await connectDB();

    // Read cookie token
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authorized, no token" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: "Not authorized, token failed" },
        { status: 401 }
      );
    }

    // Fetch user from database
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Auth Me Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
