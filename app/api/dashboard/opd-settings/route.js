import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import connectDB from "../../../../backend/config/db.js";
import DoctorProfile from "../../../../backend/models/DoctorProfile.js";
import Clinic from "../../../../backend/models/Clinic.js";
import { verifyToken } from "../../../../backend/utils/jwt.js";

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid session" }, { status: 401 });
    }

    const body = await req.json();
    const { dailyPatientLimit, enableDailyLimit } = body;

    await connectDB();

    // The user can be a clinic owner or a doctor
    const clinic = await Clinic.findOne({ ownerId: decoded.id }).lean();
    
    let doctorProfile;
    if (clinic) {
      doctorProfile = await DoctorProfile.findOne({ clinicId: clinic._id });
    } else {
      doctorProfile = await DoctorProfile.findOne({ userId: decoded.id });
    }

    if (!doctorProfile) {
      return NextResponse.json({ success: false, message: "Doctor profile not found" }, { status: 404 });
    }

    if (typeof dailyPatientLimit === 'number') {
      doctorProfile.dailyPatientLimit = dailyPatientLimit;
    }
    if (typeof enableDailyLimit === 'boolean') {
      doctorProfile.enableDailyLimit = enableDailyLimit;
    }

    await doctorProfile.save();

    // Optional: Revalidate the public clinic page if clinic is known
    if (clinic && clinic.slug) {
      revalidatePath(`/${clinic.slug}`);
      revalidatePath(`/${clinic.slug}/book`);
    }

    return NextResponse.json({ success: true, message: "OPD settings updated successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error updating OPD settings:", error);
    return NextResponse.json({ success: false, message: "Failed to update settings" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ success: false }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false }, { status: 401 });

    await connectDB();

    const clinic = await Clinic.findOne({ ownerId: decoded.id }).lean();
    let doctorProfile;
    if (clinic) {
      doctorProfile = await DoctorProfile.findOne({ clinicId: clinic._id }).lean();
    } else {
      doctorProfile = await DoctorProfile.findOne({ userId: decoded.id }).lean();
    }

    if (!doctorProfile) return NextResponse.json({ success: false }, { status: 404 });

    return NextResponse.json({
      success: true,
      dailyPatientLimit: doctorProfile.dailyPatientLimit || 30,
      enableDailyLimit: doctorProfile.enableDailyLimit || false
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
