import { NextResponse } from "next/server";
import connectDB from "../../../../backend/config/db.js";
import Clinic from "../../../../backend/models/Clinic.js";
import Availability from "../../../../backend/models/Availability.js";
import Appointment from "../../../../backend/models/Appointment.js";
import Service from "../../../../backend/models/Service.js";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const clinicSlug = searchParams.get("clinicSlug");
    const dateStr = searchParams.get("date"); // YYYY-MM-DD
    const serviceId = searchParams.get("serviceId");

    if (!clinicSlug || !dateStr) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const clinic = await Clinic.findOne({ slug: clinicSlug });
    if (!clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    const targetDate = new Date(dateStr);
    const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    const availability = await Availability.findOne({ clinicId: clinic._id, dayOfWeek });
    if (!availability || availability.isClosed) {
      return NextResponse.json({ slots: [] }, { status: 200 });
    }

    // Default duration to 15 mins if service not specified
    let durationMins = 15;
    if (serviceId) {
      const service = await Service.findById(serviceId);
      if (service) durationMins = service.durationMins || 15;
    }

    // Generate slots
    const slots = [];
    const [startHour, startMin] = availability.startTime.split(':').map(Number);
    const [endHour, endMin] = availability.endTime.split(':').map(Number);
    
    let currentMins = startHour * 60 + startMin;
    const endMins = endHour * 60 + endMin;

    while (currentMins + durationMins <= endMins) {
      const h = Math.floor(currentMins / 60);
      const m = currentMins % 60;
      const formattedTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      slots.push(formattedTime);
      currentMins += durationMins;
    }

    // Fetch existing appointments for the date to filter out booked slots
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await Appointment.find({
      clinicId: clinic._id,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'CANCELLED' }
    });

    const bookedSlots = existingAppointments.map(a => a.timeSlot);
    const availableSlots = slots.filter(slot => !bookedSlots.includes(slot));

    return NextResponse.json({ slots: availableSlots }, { status: 200 });

  } catch (error) {
    console.error("Slots Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
