import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "../../../../backend/config/db.js";
import Clinic from "../../../../backend/models/Clinic.js";
import DoctorProfile from "../../../../backend/models/DoctorProfile.js";
import WebsiteConfig from "../../../../backend/models/WebsiteConfig.js";
import { verifyToken } from "../../../../backend/utils/jwt.js";

async function authenticateAndGetIds() {
  await connectDB();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) throw new Error("Unauthorized");
  
  const decoded = verifyToken(token);
  if (!decoded) throw new Error("Invalid session");
  
  return decoded.id || decoded.userId || decoded._id;
}

export async function GET() {
  try {
    const userId = await authenticateAndGetIds();
    const clinic = await Clinic.findOne({ ownerId: userId }).lean();
    if (!clinic) return NextResponse.json({ success: false, error: "Clinic not found" }, { status: 404 });

    const doctorProfile = await DoctorProfile.findOne({ clinicId: clinic._id }).lean() || 
                          await DoctorProfile.findOne({ userId: userId }).lean();
    const websiteConfig = await WebsiteConfig.findOne({ clinicId: clinic._id }).lean();
    
    return NextResponse.json({ success: true, clinic, doctorProfile, websiteConfig }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 401 });
  }
}

export async function PUT(req) {
  try {
    const userId = await authenticateAndGetIds();
    const body = await req.json();
    const { 
      clinicName, phone, address, city, logo, clinicLogo,
      doctorName, qualification, specialization, experienceYrs, 
      profilePhoto, doctorPhoto, bio 
    } = body;

    const chosenLogo = clinicLogo !== undefined ? clinicLogo : (logo !== undefined ? logo : undefined);
    const chosenPhoto = profilePhoto !== undefined ? profilePhoto : (doctorPhoto !== undefined ? doctorPhoto : undefined);
    
    const clinicUpdate = { 
      name: clinicName, 
      phone, 
      address, 
      city 
    };
    if (chosenLogo !== undefined) {
      clinicUpdate.logo = chosenLogo;
    }

    const clinic = await Clinic.findOneAndUpdate(
      { ownerId: userId },
      clinicUpdate,
      { new: true }
    );
    if (!clinic) return NextResponse.json({ success: false, error: "Clinic not found" }, { status: 404 });

    const doctorUpdate = { 
      fullName: doctorName, 
      qualification, 
      specialization, 
      experienceYrs: Number(experienceYrs) || 0,
      clinicId: clinic._id,
      userId: userId
    };
    if (bio !== undefined) doctorUpdate.bio = bio;
    if (chosenPhoto !== undefined) {
      doctorUpdate.profilePhoto = chosenPhoto;
      doctorUpdate.avatarUrl = chosenPhoto;
    }

    const updatedDoctor = await DoctorProfile.findOneAndUpdate(
      { $or: [{ clinicId: clinic._id }, { userId: userId }] },
      doctorUpdate,
      { new: true, upsert: true }
    );

    // Also sync WebsiteConfig if exists or create
    let webConfig = await WebsiteConfig.findOne({ clinicId: clinic._id });
    if (webConfig) {
      if (chosenPhoto !== undefined) webConfig.doctorPhoto = chosenPhoto;
      if (chosenLogo !== undefined) webConfig.clinicLogo = chosenLogo;
      await webConfig.save();
    }
    
    return NextResponse.json({ 
      success: true, 
      clinic, 
      doctorProfile: updatedDoctor,
      websiteConfig: webConfig 
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
