import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "../../../../backend/config/db.js";
import Clinic from "../../../../backend/models/Clinic.js";
import Subscription from "../../../../backend/models/Subscription.js";
import { verifyToken } from "../../../../backend/utils/jwt.js";
import { PRICING_PLANS } from "../../../../frontend/constants/plans.js";

async function authenticate() {
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
    const userId = await authenticate();
    const clinic = await Clinic.findOne({ ownerId: userId }).lean();
    if (!clinic) {
      return NextResponse.json({ success: false, error: "Clinic not found" }, { status: 404 });
    }

    let subscription = await Subscription.findOne({ clinicId: clinic._id }).sort({ createdAt: -1 });

    if (!subscription) {
      // Auto-create 14-day trial
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 14);

      subscription = await Subscription.create({
        clinicId: clinic._id,
        userId: userId,
        planId: "PROFESSIONAL", // Give them full features on trial
        billingCycle: "MONTHLY",
        price: 0,
        status: "TRIAL",
        startDate: new Date(),
        endDate
      });
    }

    // Check if expired
    if (new Date() > new Date(subscription.endDate) && (subscription.status === 'TRIAL' || subscription.status === 'ACTIVE')) {
      subscription = await Subscription.findByIdAndUpdate(subscription._id, { status: 'EXPIRED' }, { new: true });
    }

    return NextResponse.json({ success: true, subscription }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 401 });
  }
}

export async function POST(req) {
  try {
    const userId = await authenticate();
    const clinic = await Clinic.findOne({ ownerId: userId }).lean();
    if (!clinic) return NextResponse.json({ success: false, error: "Clinic not found" }, { status: 404 });

    const { planId, billingCycle } = await req.json();
    if (!planId || !billingCycle) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    const plan = PRICING_PLANS.find(p => p.id === planId);
    if (!plan) return NextResponse.json({ success: false, error: "Invalid plan" }, { status: 400 });

    const price = billingCycle === "YEARLY" ? plan.yearlyPrice : plan.monthlyPrice;
    
    const endDate = new Date();
    if (billingCycle === "YEARLY") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const subscription = await Subscription.create({
      clinicId: clinic._id,
      userId: userId,
      planId,
      billingCycle,
      price,
      status: "ACTIVE",
      startDate: new Date(),
      endDate
    });

    return NextResponse.json({ success: true, subscription }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
