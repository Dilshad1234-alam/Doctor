import { NextResponse } from "next/server";
import { verifyToken } from "../../../../backend/utils/jwt";
import dbConnect from "../../../../backend/config/db";
import User from "../../../../backend/models/User";
import Clinic from "../../../../backend/models/Clinic";
import WebsiteConfig from "../../../../backend/models/WebsiteConfig";
import DoctorProfile from "../../../../backend/models/DoctorProfile";
import { cookies } from "next/headers";

export async function GET(req) {
  try {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const decoded = verifyToken(token);
    const userId = decoded?.id || decoded?.userId || decoded?._id;
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const clinic = await Clinic.findOne({ ownerId: userId });
    if (!clinic) return NextResponse.json({ success: false, error: "Clinic not found" }, { status: 404 });

    const doctor = await DoctorProfile.findOne({ clinicId: clinic._id });

    let websiteConfig = await WebsiteConfig.findOne({ clinicId: clinic._id });
    if (!websiteConfig) {
      websiteConfig = new WebsiteConfig({
        clinicId: clinic._id,
        templateId: 'template-1',
        primaryColor: '#2563eb',
        fontStyle: 'Plus Jakarta Sans',
        isPublished: true,
        showSections: { about: true, services: true, timings: true, contact: true }
      });
      await websiteConfig.save();
    }

    return NextResponse.json({ success: true, clinic, doctor, websiteConfig, slug: clinic.slug });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const decoded = verifyToken(token);
    const userId = decoded?.id || decoded?.userId || decoded?._id;
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const clinic = await Clinic.findOne({ ownerId: userId });
    if (!clinic) return NextResponse.json({ success: false, error: "Clinic not found" }, { status: 404 });

    let websiteConfig = await WebsiteConfig.findOne({ clinicId: clinic._id });
    if (!websiteConfig) {
      websiteConfig = new WebsiteConfig({ clinicId: clinic._id, ...body, isPublished: true, publishedUrl: `/${clinic.slug}` });
    } else {
      Object.assign(websiteConfig, body);
      websiteConfig.publishedUrl = `/${clinic.slug}`;
      websiteConfig.isPublished = true;
    }
    
    await websiteConfig.save();

    return NextResponse.json({ success: true, websiteConfig });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
