import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "../../../../backend/config/db.js";
import Clinic from "../../../../backend/models/Clinic.js";
import Service from "../../../../backend/models/Service.js";
import { verifyToken } from "../../../../backend/utils/jwt.js";

// Helper to authenticate and get clinic
async function authenticateAndGetClinic() {
  await connectDB();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) throw new Error("Unauthorized");
  
  const decoded = verifyToken(token);
  if (!decoded) throw new Error("Invalid session");
  
  const clinic = await Clinic.findOne({ ownerId: decoded.id }).lean();
  if (!clinic) throw new Error("Clinic not found");
  
  return clinic;
}

export async function GET() {
  try {
    const clinic = await authenticateAndGetClinic();
    const services = await Service.find({ clinicId: clinic._id }).lean();
    return NextResponse.json({ success: true, services }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function POST(req) {
  try {
    const clinic = await authenticateAndGetClinic();
    const body = await req.json();
    const { name, price, durationMins } = body;
    
    if (!name || !price || !durationMins) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }
    
    const service = await Service.create({
      clinicId: clinic._id,
      name,
      price: Number(price),
      durationMins: Number(durationMins),
      isActive: true
    });
    
    return NextResponse.json({ success: true, service }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const clinic = await authenticateAndGetClinic();
    const { searchParams } = new URL(req.url);
    const serviceId = searchParams.get("serviceId");
    
    if (!serviceId) {
      return NextResponse.json({ success: false, error: "Missing serviceId" }, { status: 400 });
    }
    
    await Service.findOneAndDelete({ _id: serviceId, clinicId: clinic._id });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
