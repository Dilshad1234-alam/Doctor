import { NextResponse } from "next/server";
import connectDB from "../../../../backend/config/db.js";
import User from "../../../../backend/models/User.js";
import Clinic from "../../../../backend/models/Clinic.js";
import DoctorProfile from "../../../../backend/models/DoctorProfile.js";
import Service from "../../../../backend/models/Service.js";
import Availability from "../../../../backend/models/Availability.js";
import { verifyToken } from "../../../../backend/utils/jwt.js";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { clinic, doctor, service, availability } = body;

    // Check slug uniqueness
    const slugExists = await Clinic.findOne({ slug: clinic.slug });
    if (slugExists) {
      return NextResponse.json({ error: "Clinic URL slug already in use. Try a different name." }, { status: 400 });
    }

    // Start a Mongoose session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Create Clinic
      const newClinic = await Clinic.insertMany([{
        ownerId: decoded.id,
        name: clinic.name,
        slug: clinic.slug,
        phone: clinic.phone,
        address: clinic.address,
        city: clinic.city,
      }], { session });

      const clinicId = newClinic[0]._id;

      // 2. Create Doctor Profile
      await DoctorProfile.insertMany([{
        userId: decoded.id,
        clinicId: clinicId,
        fullName: doctor.fullName,
        qualification: doctor.qualification,
        specialization: doctor.specialization,
        experienceYrs: doctor.experienceYrs,
      }], { session });

      // 3. Create Default Service (OPD Consultation)
      await Service.insertMany([{
        clinicId: clinicId,
        name: service.name || "OPD Consultation",
        price: service.price,
        durationMins: service.durationMins || 15,
      }], { session });

      // 4. Create Availability
      const availabilityDocs = availability.map(day => ({
        clinicId: clinicId,
        dayOfWeek: day.dayOfWeek,
        startTime: day.startTime,
        endTime: day.endTime,
        isClosed: day.isClosed,
      }));
      await Availability.insertMany(availabilityDocs, { session });

      // 5. Update User hasCompletedOnboarding
      await User.findByIdAndUpdate(decoded.id, { hasCompletedOnboarding: true }, { session });

      await session.commitTransaction();
      session.endSession();

      return NextResponse.json({ message: "Onboarding completed successfully!" }, { status: 201 });
    } catch (transactionError) {
      await session.abortTransaction();
      session.endSession();
      throw transactionError;
    }

  } catch (error) {
    console.error("Onboarding Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
