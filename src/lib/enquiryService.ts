import dbConnect from '@/lib/mongodb';
import Enquiry from '@/models/Enquiry';

export async function createEnquiry(data: any) {
  await dbConnect();
  const enquiry = new Enquiry(data);
  return await enquiry.save();
}

export async function getEnquiries() {
  await dbConnect();
  return await Enquiry.find({ isDeleted: { $ne: true } }).populate('customer').populate('acquiredBy', 'name').sort({ createdAt: -1 });
}

export async function getEnquiryById(id: string) {
  await dbConnect();
  return await Enquiry.findOne({ _id: id, isDeleted: { $ne: true } }).populate('customer').populate('acquiredBy', 'name');
}

export async function updateEnquiry(id: string, data: any) {
  await dbConnect();
  return await Enquiry.findOneAndUpdate({ _id: id, isDeleted: { $ne: true } }, data, { new: true });
}

export async function deleteEnquiry(id: string) {
  await dbConnect();
  return await Enquiry.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
}