import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "../../../../backend/config/db.js";
import Subscription from "../../../../backend/models/Subscription.js";
import Clinic from "../../../../backend/models/Clinic.js";
import DoctorProfile from "../../../../backend/models/DoctorProfile.js";
import { verifyToken } from "../../../../backend/utils/jwt.js";
import { PLAN_CONFIG, getPlanConfig } from "../../../../lib/planLimits.js";

export const dynamic = "force-dynamic";

async function authenticateUser(req) {
  let token = req?.cookies?.get?.("token")?.value;
  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get("token")?.value;
  }
  if (!token) {
    const authHeader = req?.headers?.get?.("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded?.id || decoded?.userId || decoded?._id || null;
}

export async function GET(req) {
  try {
    await connectDB();
    const userId = await authenticateUser(req);
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    let clinic = await Clinic.findOne({ ownerId: userId }).lean();
    if (!clinic) {
      const doc = await DoctorProfile.findOne({ userId }).lean();
      if (doc?.clinicId) {
        clinic = await Clinic.findById(doc.clinicId).lean();
      }
    }

    const clinicId = clinic ? clinic._id : userId;

    let subscription = await Subscription.findOne({
      $or: [{ userId: userId }, { clinicId: clinicId }, { doctorId: userId }]
    }).lean();

    if (!subscription) {
      subscription = {
        planId: "BASIC",
        planName: "Basic Plan",
        price: 499,
        status: "ACTIVE",
        billingCycle: "MONTHLY"
      };
    }

    const planLimits = getPlanConfig(subscription.planId);

    return NextResponse.json({ 
      success: true, 
      subscription,
      planLimits,
      clinic,
      isAdvanced: subscription.planId === "ADVANCED" || subscription.planId === "PRO" || subscription.planId === "PREMIUM"
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const userId = await authenticateUser(req);
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const targetPlan = (body.planId || "ADVANCED").toUpperCase();
    const planConfig = PLAN_CONFIG[targetPlan] || PLAN_CONFIG.PRO;

    let clinic = await Clinic.findOne({ ownerId: userId });
    if (!clinic) {
      const doc = await DoctorProfile.findOne({ userId });
      if (doc?.clinicId) {
        clinic = await Clinic.findById(doc.clinicId);
      }
    }

    const clinicId = clinic ? clinic._id : userId;
    const now = new Date();
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const subscription = await Subscription.findOneAndUpdate(
      { $or: [{ userId: userId }, { clinicId: clinicId }, { doctorId: userId }] },
      {
        userId: userId,
        doctorId: userId,
        clinicId: clinicId,
        planId: targetPlan,
        planName: planConfig.name || "Advanced Plan",
        price: planConfig.price || 999,
        billingCycle: body.billingCycle || "MONTHLY",
        status: "ACTIVE",
        startDate: now,
        endDate: thirtyDaysLater
      },
      { upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json({
      success: true,
      message: `🎉 Congratulations! Successfully upgraded to ${planConfig.name}. All Advanced features are now unlocked instantly!`,
      subscription,
      planConfig
    });
  } catch (error) {
    console.error("Upgrade API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
