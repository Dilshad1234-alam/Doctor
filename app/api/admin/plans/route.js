import { NextResponse } from "next/server";
import connectDB from "../../../../backend/config/db.js";
import Plan, { defaultPlans } from "../../../../backend/models/Plan.js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const planOrder = ["starter", "pro", "premium"];
    const uniquePlans = [];

    for (const pId of planOrder) {
      const allMatches = await Plan.find({
        planId: new RegExp(`^${pId}$`, "i"),
      }).sort({ updatedAt: -1 });

      if (allMatches && allMatches.length > 0) {
        uniquePlans.push(allMatches[0].toObject());
        if (allMatches.length > 1) {
          const duplicateIds = allMatches.slice(1).map((d) => d._id);
          await Plan.deleteMany({ _id: { $in: duplicateIds } });
        }
      } else {
        const def = defaultPlans.find((d) => d.planId === pId);
        if (def) {
          const created = await Plan.create(def);
          uniquePlans.push(created.toObject());
        }
      }
    }

    return NextResponse.json({ success: true, plans: uniquePlans });
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

    const normalizedPlanId = planId.toLowerCase().trim();

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

    // Delete any old duplicates first
    const allExisting = await Plan.find({
      planId: new RegExp(`^${normalizedPlanId}$`, "i"),
    }).sort({ updatedAt: -1 });

    let updatedPlan;
    if (allExisting.length > 0) {
      const primaryId = allExisting[0]._id;
      updatedPlan = await Plan.findByIdAndUpdate(
        primaryId,
        { $set: { ...updateFields, planId: normalizedPlanId } },
        { new: true }
      );
      if (allExisting.length > 1) {
        const dupIds = allExisting.slice(1).map((d) => d._id);
        await Plan.deleteMany({ _id: { $in: dupIds } });
      }
    } else {
      updatedPlan = await Plan.create({
        planId: normalizedPlanId,
        name: name || (normalizedPlanId === "starter" ? "Starter" : normalizedPlanId === "pro" ? "Pro" : "Premium"),
        priceMonthly: priceMonthly || 499,
        priceYearly: priceYearly || 399,
        ...updateFields,
      });
    }

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
