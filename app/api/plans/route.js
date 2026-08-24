import { NextResponse } from "next/server";
import connectDB from "../../../backend/config/db.js";
import Plan, { defaultPlans } from "../../../backend/models/Plan.js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    const planOrder = ["starter", "pro", "premium"];
    const uniquePlans = [];

    // Ensure exactly one document per planId and delete duplicate records from DB
    for (const pId of planOrder) {
      const allMatches = await Plan.find({
        planId: new RegExp(`^${pId}$`, "i"),
      }).sort({ updatedAt: -1 });

      if (allMatches && allMatches.length > 0) {
        const primary = allMatches[0];
        uniquePlans.push(primary.toObject());

        // Remove any extra duplicates for this planId from database
        if (allMatches.length > 1) {
          const duplicateIds = allMatches.slice(1).map((d) => d._id);
          await Plan.deleteMany({ _id: { $in: duplicateIds } });
        }
      } else {
        // If not found, insert default
        const def = defaultPlans.find((d) => d.planId === pId);
        if (def) {
          const created = await Plan.create(def);
          uniquePlans.push(created.toObject());
        }
      }
    }

    return NextResponse.json({
      success: true,
      plans: uniquePlans,
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
