import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';

export async function createBooking(data: any) {
  await dbConnect();
  data.balancePending = data.totalAmount - (data.advancePaid || 0);

  // Initialize paymentHistory if advancePaid > 0
  if (data.advancePaid > 0) {
    data.paymentHistory = [{
      amount: data.advancePaid,
      date: new Date(),
      method: data.paymentMethod || 'cash'
    }];
  }

  const booking = new Booking(data);
  return await booking.save();
}

export async function getBookings() {
  await dbConnect();
  return await Booking.find({})
    .populate('customer', 'name email phone')
    .populate('package', 'name destinations duration price groups')
    .populate('bookedBy', 'name')
    .sort({ createdAt: -1 });
}

export async function getBookingById(id: string) {
  await dbConnect();
  return await Booking.findById(id)
    .populate('customer')
    .populate('package', 'name destinations duration price groups')
    .populate('bookedBy', 'name')
    .populate('enquiry');
}

export async function updateBooking(id: string, data: any) {
  await dbConnect();
  const existing = await Booking.findById(id);
  if (!existing) return null;

  let updatePayload: any = { ...data, updatedAt: new Date() };

  // If recording a new payment
  if (data.recordNewPayment) {
    const newAmt = Number(data.recordNewPayment.amount || 0);
    const newMethod = data.recordNewPayment.method || 'cash';
    const totalAdv = (existing.advancePaid || 0) + newAmt;
    const totalCost = existing.totalAmount || 0;
    
    updatePayload.advancePaid = totalAdv;
    updatePayload.balancePending = totalCost - totalAdv;
    
    updatePayload.$push = {
      paymentHistory: {
        amount: newAmt,
        date: new Date(),
        method: newMethod
      }
    };
    delete updatePayload.recordNewPayment;
  } else if (data.totalAmount !== undefined || data.advancePaid !== undefined) {
    const total = data.totalAmount ?? existing.totalAmount;
    const advance = data.advancePaid ?? existing.advancePaid;
    updatePayload.balancePending = total - advance;
  }

  // Handle $push properly when using findByIdAndUpdate
  let pushObj = updatePayload.$push;
  delete updatePayload.$push;

  let queryPayload: any = { $set: updatePayload };
  if (pushObj) {
    queryPayload.$push = pushObj;
  }

  return await Booking.findByIdAndUpdate(id, queryPayload, { new: true })
    .populate('customer', 'name email phone')
    .populate('package', 'name destinations duration price groups');
}

export async function deleteBooking(id: string) {
  await dbConnect();
  return await Booking.findByIdAndDelete(id);
}
