import { NextResponse } from "next/server";
import connectDB from "../../../../backend/config/db.js";

export const dynamic = "force-dynamic";
import Clinic from "../../../../backend/models/Clinic.js";
import Availability from "../../../../backend/models/Availability.js";
import Appointment from "../../../../backend/models/Appointment.js";
import Service from "../../../../backend/models/Service.js";

// Helper: Format hour and minute to 12-hour AM/PM string (e.g. 09:00 AM, 04:30 PM)
function formatTo12Hour(hours, minutes) {
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  const formattedHour = hour12 < 10 ? `0${hour12}` : `${hour12}`;
  const formattedMin = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${formattedHour}:${formattedMin} ${period}`;
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const clinicSlug = searchParams.get("clinicSlug") || searchParams.get("slug");
    const clinicId = searchParams.get("clinicId");
    const dateStr = searchParams.get("date"); // Expected: YYYY-MM-DD
    const serviceId = searchParams.get("serviceId");

    if ((!clinicSlug && !clinicId) || !dateStr) {
      return NextResponse.json({ success: false, error: "Missing clinic identifier or date" }, { status: 400 });
    }

    let clinic = null;
    if (clinicId) {
      clinic = await Clinic.findById(clinicId).lean();
    }
    if (!clinic && clinicSlug) {
      clinic = await Clinic.findOne({ slug: new RegExp(`^${clinicSlug}$`, "i") }).lean();
    }

    if (!clinic) {
      return NextResponse.json({ success: false, error: "Clinic not found" }, { status: 404 });
    }

    // Parse date safely without timezone shift
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) {
      return NextResponse.json({ success: false, error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
    }

    const targetDate = new Date(year, month - 1, day);
    const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    const availability = await Availability.findOne({ clinicId: clinic._id, dayOfWeek }).lean();

    const isOpen = availability 
      ? (availability.isOpen !== undefined ? Boolean(availability.isOpen) : (availability.isClosed !== undefined ? !availability.isClosed : true))
      : false;

    // If missing or closed on this day, return closed status immediately
    if (!availability || !isOpen) {
      return NextResponse.json({ 
        success: true, 
        slots: [], 
        isClosed: true, 
        message: "Clinic is closed on this day." 
      }, { status: 200 });
    }

    // Standard interval: 30 minutes (or service duration if specified)
    let durationMins = 30;
    if (serviceId) {
      const service = await Service.findById(serviceId).lean();
      if (service && service.durationMins) {
        durationMins = Number(service.durationMins);
      }
    }

    const startTimeStr = availability.startTime || "09:00";
    const endTimeStr = availability.endTime || "17:00";

    const [startHour, startMin] = startTimeStr.split(":").map(Number);
    const [endHour, endMin] = endTimeStr.split(":").map(Number);

    let currentMins = startHour * 60 + (startMin || 0);
    const endMins = endHour * 60 + (endMin || 0);

    const generatedSlots = [];
    while (currentMins + durationMins <= endMins) {
      const h = Math.floor(currentMins / 60);
      const m = currentMins % 60;
      const formatted12 = formatTo12Hour(h, m);
      generatedSlots.push(formatted12);
      currentMins += durationMins;
    }

    // Fetch confirmed/active appointments for this clinic and date to exclude booked slots
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    const existingAppointments = await Appointment.find({
      clinicId: clinic._id,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: "CANCELLED" }
    }).lean();

    const bookedSlotNormalized = new Set(
      existingAppointments.map(a => {
        if (!a.timeSlot) return "";
        return a.timeSlot.trim().toUpperCase();
      })
    );

    // Filter out already booked slots
    const availableSlots = generatedSlots.filter(slot => {
      const slotUpper = slot.trim().toUpperCase();
      // Check exact match (e.g. "09:00 AM") or 24-hour match
      return !bookedSlotNormalized.has(slotUpper);
    });

    return NextResponse.json({ 
      success: true, 
      slots: availableSlots, 
      isClosed: false 
    }, { status: 200 });

  } catch (error) {
    console.error("Slots Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
