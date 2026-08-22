import connectDB from '../../../backend/config/db.js';
import Clinic from '../../../backend/models/Clinic.js';
import Service from '../../../backend/models/Service.js';
import DoctorProfile from '../../../backend/models/DoctorProfile.js';
import Availability from '../../../backend/models/Availability.js';
import BookingClient from '../../../frontend/components/booking/BookingClient.js';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default async function BookPage(props) {
  const params = await props.params;
  const slug = params?.slug;

  console.log(`[SLUG ROUTE] Looking up clinic slug for booking: ${slug}`);

  await connectDB();
  const clinic = await Clinic.findOne({ slug: new RegExp(`^${slug}$`, 'i') }).lean();
  
  if (!clinic) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-6" />
        <h1 className="text-3xl font-bold text-slate-900 mb-4 text-center">Clinic Not Found</h1>
        <p className="text-slate-600 mb-8 text-center max-w-md">
          We couldn't find a clinic with the URL slug "<strong>{slug}</strong>".
        </p>
        <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-sm">
          Doctor Login
        </Link>
      </div>
    );
  }
  
  const doctor = await DoctorProfile.findOne({ clinicId: clinic._id }).lean();
  const services = await Service.find({ clinicId: clinic._id, isActive: true }).lean();
  const availability = await Availability.find({ clinicId: clinic._id }).lean();
  
  return (
    <BookingClient 
      clinic={JSON.parse(JSON.stringify(clinic))} 
      doctor={JSON.parse(JSON.stringify(doctor || {}))} 
      services={JSON.parse(JSON.stringify(services))} 
      availability={JSON.parse(JSON.stringify(availability))}
      slug={slug} 
    />
  );
}
