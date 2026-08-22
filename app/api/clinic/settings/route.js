import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "../../../../backend/config/db.js";
import Clinic from "../../../../backend/models/Clinic.js";
import DoctorProfile from "../../../../backend/models/DoctorProfile.js";
import { verifyToken } from "../../../../backend/utils/jwt.js";

async function authenticateAndGetIds() {
  await connectDB();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) throw new Error("Unauthorized");
  
  const decoded = verifyToken(token);
  if (!decoded) throw new Error("Invalid session");
  
  return decoded.id; // userId
}

export async function GET() {
  try {
    const userId = await authenticateAndGetIds();
    const clinic = await Clinic.findOne({ ownerId: userId }).lean();
    if (!clinic) return NextResponse.json({ success: false, error: "Clinic not found" }, { status: 404 });

    const doctorProfile = await DoctorProfile.findOne({ userId: userId }).lean();
    
    return NextResponse.json({ success: true, clinic, doctorProfile }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 401 });
  }
}

export async function PUT(req) {
  try {
    const userId = await authenticateAndGetIds();
    const body = await req.json();
    const { clinicName, phone, address, city, doctorName, qualification, specialization, experienceYrs } = body;
    
    const clinic = await Clinic.findOneAndUpdate(
      { ownerId: userId },
      { name: clinicName, phone, address, city },
      { new: true }
    );
    if (!clinic) return NextResponse.json({ success: false, error: "Clinic not found" }, { status: 404 });

    await DoctorProfile.findOneAndUpdate(
      { userId: userId },
      { fullName: doctorName, qualification, specialization, experienceYrs },
      { new: true, upsert: true }
    );
    
    return NextResponse.json({ success: true, clinic }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
