import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';

export async function createBooking(data: any) {
  await dbConnect();
  data.balancePending = data.totalAmount - (data.advancePaid || 0);
  const booking = new Booking(data);
  return await booking.save();
}

export async function getBookings() {
  await dbConnect();
  return await Booking.find({})
    .populate('customer', 'name email phone')
    .populate('package', 'name destinations duration price')
    .populate('bookedBy', 'name')
    .sort({ createdAt: -1 });
}

export async function getBookingById(id: string) {
  await dbConnect();
  return await Booking.findById(id)
    .populate('customer')
    .populate('package')
    .populate('bookedBy', 'name')
    .populate('enquiry');
}

export async function updateBooking(id: string, data: any) {
  await dbConnect();
  if (data.totalAmount !== undefined || data.advancePaid !== undefined) {
    const existing = await Booking.findById(id);
    if (existing) {
      const total = data.totalAmount ?? existing.totalAmount;
      const advance = data.advancePaid ?? existing.advancePaid;
      data.balancePending = total - advance;
    }
  }
  return await Booking.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true })
    .populate('customer', 'name email phone')
    .populate('package', 'name destinations duration price');
}

export async function deleteBooking(id: string) {
  await dbConnect();
  return await Booking.findByIdAndDelete(id);
}
