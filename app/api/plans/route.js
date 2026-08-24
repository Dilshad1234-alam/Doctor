import { NextResponse } from "next/server";
import connectDB from "../../../backend/config/db.js";
import Plan, { defaultPlans } from "../../../backend/models/Plan.js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    let plans = await Plan.find().sort({ priceMonthly: 1 }).lean();

    // Auto-seed if collection is empty
    if (!plans || plans.length === 0) {
      await Plan.insertMany(defaultPlans);
      plans = await Plan.find().sort({ priceMonthly: 1 }).lean();
    }

    return NextResponse.json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error("GET /api/plans Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch plans",
        plans: defaultPlans,
      },
      { status: 500 }
    );
  }
}
