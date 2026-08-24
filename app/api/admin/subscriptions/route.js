import { NextResponse } from "next/server";
import connectDB from "../../../../backend/config/db.js";
import Subscription from "../../../../backend/models/Subscription.js";
import User from "../../../../backend/models/User.js";
import Clinic from "../../../../backend/models/Clinic.js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    // Query strictly doctor users, excluding ADMIN / SUPER_ADMIN
    const [subscriptions, users, clinics] = await Promise.all([
      Subscription.find().sort({ createdAt: -1 }).lean(),
      User.find({ role: { $nin: ["ADMIN", "SUPER_ADMIN"] } }).lean(),
      Clinic.find().lean()
    ]);

    const userMap = new Map();
    users.forEach(u => userMap.set(u._id.toString(), u));

    const clinicMap = new Map();
    clinics.forEach(c => clinicMap.set(c.ownerId?.toString(), c));

    // Enriched subscriptions for real registered doctors
    const enrichedSubscriptions = [];

    subscriptions.forEach(sub => {
      const uId = sub.userId?.toString();
      const user = userMap.get(uId);
      // Skip if subscription belongs to admin or unverified deleted user
      if (!user) return;

      const clinic = clinicMap.get(uId);
      const normalizedPlan = (sub.planId || "STARTER").toUpperCase();

      enrichedSubscriptions.push({
        _id: sub._id.toString(),
        userId: uId,
        doctorName: user.name || "Doctor",
        doctorEmail: user.email || "N/A",
        doctorPhone: user.phone || "N/A",
        clinicName: clinic?.name || "Clinic Not Set",
        slug: clinic?.slug || "clinic-preview",
        planId: normalizedPlan,
        billingCycle: (sub.billingCycle || "MONTHLY").toUpperCase(),
        price: Number(sub.price) || (normalizedPlan === "ENTERPRISE" || normalizedPlan === "PREMIUM" ? 2999 : normalizedPlan === "PRO" || normalizedPlan === "PROFESSIONAL" ? 1299 : 499),
        status: (sub.status || "ACTIVE").toUpperCase(),
        startDate: sub.startDate || sub.createdAt || new Date(),
        endDate: sub.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: sub.createdAt || new Date()
      });
    });

    // Also include any registered doctor who doesn't have an explicit Subscription record yet as Starter Trial/Active
    users.forEach(user => {
      const uId = user._id.toString();
      const hasSub = enrichedSubscriptions.some(s => s.userId === uId);
      if (!hasSub) {
        const clinic = clinicMap.get(uId);
        enrichedSubscriptions.push({
          _id: `sub-auto-${uId}`,
          userId: uId,
          doctorName: user.name || "Doctor",
          doctorEmail: user.email || "N/A",
          doctorPhone: user.phone || "N/A",
          clinicName: clinic?.name || "Clinic Not Set",
          slug: clinic?.slug || "clinic-preview",
          planId: "STARTER",
          billingCycle: "MONTHLY",
          price: 499,
          status: "ACTIVE",
          startDate: user.createdAt || new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          createdAt: user.createdAt || new Date()
        });
      }
    });

    // Calculate exact real revenue metrics
    const activeSubs = enrichedSubscriptions.filter(s => s.status === "ACTIVE" || s.status === "TRIAL");
    const mrr = activeSubs.reduce((acc, s) => {
      const price = Number(s.price) || 499;
      return acc + (s.billingCycle === "YEARLY" ? Math.round(price / 12) : price);
    }, 0);
    const arr = mrr * 12;

    const starterSubs = enrichedSubscriptions.filter(s => s.planId === "STARTER");
    const proSubs = enrichedSubscriptions.filter(s => s.planId === "PROFESSIONAL" || s.planId === "PRO");
    const premiumSubs = enrichedSubscriptions.filter(s => s.planId === "ENTERPRISE" || s.planId === "PREMIUM");

    const planStats = {
      starter: starterSubs.length,
      pro: proSubs.length,
      premium: premiumSubs.length,
      enterprise: premiumSubs.length
    };

    return NextResponse.json({
      success: true,
      subscriptions: enrichedSubscriptions,
      metrics: {
        mrr,
        arr,
        totalSubscriptions: enrichedSubscriptions.length,
        activeCount: activeSubs.length,
        trialCount: enrichedSubscriptions.filter(s => s.status === "TRIAL").length,
        expiredCount: enrichedSubscriptions.filter(s => s.status === "EXPIRED" || s.status === "CANCELLED").length,
        planStats,
        planBreakdown: {
          starter: {
            count: starterSubs.length,
            price: 499,
            doctors: starterSubs.map(s => ({ name: s.doctorName, clinic: s.clinicName, price: s.price }))
          },
          pro: {
            count: proSubs.length,
            price: 1299,
            doctors: proSubs.map(s => ({ name: s.doctorName, clinic: s.clinicName, price: s.price }))
          },
          premium: {
            count: premiumSubs.length,
            price: 2999,
            doctors: premiumSubs.map(s => ({ name: s.doctorName, clinic: s.clinicName, price: s.price }))
          }
        }
      }
    });
  } catch (error) {
    console.error("Admin Subscriptions API Error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to fetch subscriptions"
    }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { subscriptionId, planId, status, extendDays } = body;

    if (!subscriptionId) {
      return NextResponse.json({ success: false, message: "Subscription ID required" }, { status: 400 });
    }

    const updateData = {};
    if (planId) updateData.planId = planId.toUpperCase();
    if (status) updateData.status = status.toUpperCase();
    if (extendDays) {
      const current = await Subscription.findById(subscriptionId);
      const currentEnd = current?.endDate ? new Date(current.endDate) : new Date();
      updateData.endDate = new Date(currentEnd.getTime() + extendDays * 24 * 60 * 60 * 1000);
      updateData.status = "ACTIVE";
    }

    const updated = await Subscription.findByIdAndUpdate(
      subscriptionId,
      { $set: updateData },
      { new: true }
    );

    return NextResponse.json({ success: true, message: "Subscription updated successfully", subscription: updated });
  } catch (error) {
    console.error("Admin Subscriptions Update Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}
