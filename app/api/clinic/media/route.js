import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "../../../../backend/config/db.js";
import { verifyToken } from "../../../../backend/utils/jwt.js";
import Clinic from "../../../../backend/models/Clinic.js";
import DoctorProfile from "../../../../backend/models/DoctorProfile.js";

export const dynamic = "force-dynamic";

async function authenticateAndGetClinic() {
  await dbConnect();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) throw new Error("Unauthorized");
  
  const decoded = verifyToken(token);
  if (!decoded) throw new Error("Invalid session");
  
  const userId = decoded.id || decoded.userId || decoded._id;
  if (!userId) throw new Error("Unauthorized");

  const clinic = await Clinic.findOne({ ownerId: userId });
  if (!clinic) throw new Error("Clinic not found");
  
  return { clinic, userId };
}

export async function GET(req) {
  try {
    const { clinic, userId } = await authenticateAndGetClinic();
    const doctor = await DoctorProfile.findOne({ clinicId: clinic._id });
    
    return NextResponse.json({
      success: true,
      avatarUrl: doctor?.avatarUrl || "",
      coverImageUrl: clinic?.coverImageUrl || ""
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 401 });
  }
}

export async function PUT(req) {
  try {
    const { clinic, userId } = await authenticateAndGetClinic();
    const body = await req.json();
    const { avatarUrl, coverImageUrl } = body;
    
    let updatedAvatar = undefined;
    let updatedCover = undefined;

    if (avatarUrl !== undefined) {
      await DoctorProfile.findOneAndUpdate(
        { clinicId: clinic._id },
        { avatarUrl },
        { new: true }
      );
      updatedAvatar = avatarUrl;
    }
    
    if (coverImageUrl !== undefined) {
      await Clinic.findOneAndUpdate(
        { _id: clinic._id },
        { coverImageUrl },
        { new: true }
      );
      updatedCover = coverImageUrl;
    }
    
    return NextResponse.json({
      success: true,
      avatarUrl: updatedAvatar,
      coverImageUrl: updatedCover
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
