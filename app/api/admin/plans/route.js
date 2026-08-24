import { NextResponse } from "next/server";
import connectDB from "../../../../backend/config/db.js";
import Plan, { defaultPlans } from "../../../../backend/models/Plan.js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    let plans = await Plan.find().sort({ priceMonthly: 1 }).lean();
    if (!plans || plans.length === 0) {
      await Plan.insertMany(defaultPlans);
      plans = await Plan.find().sort({ priceMonthly: 1 }).lean();
    }
    return NextResponse.json({ success: true, plans });
  } catch (error) {
    console.error("GET /api/admin/plans Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { planId, priceMonthly, priceYearly, description, features, name, isPopular } = body;

    if (!planId) {
      return NextResponse.json(
        { success: false, message: "planId is required (starter, pro, premium)" },
        { status: 400 }
      );
    }

    const updateFields = {};
    if (priceMonthly !== undefined && priceMonthly !== null) {
      updateFields.priceMonthly = Number(priceMonthly);
    }
    if (priceYearly !== undefined && priceYearly !== null) {
      updateFields.priceYearly = Number(priceYearly);
    }
    if (name) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (features && Array.isArray(features)) updateFields.features = features;
    if (isPopular !== undefined) updateFields.isPopular = Boolean(isPopular);

    const updatedPlan = await Plan.findOneAndUpdate(
      { planId: planId.toLowerCase() },
      { $set: updateFields },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: `${updatedPlan.name} plan pricing updated successfully!`,
      plan: updatedPlan,
    });
  } catch (error) {
    console.error("PUT /api/admin/plans Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update plan" },
      { status: 500 }
    );
  }
}
