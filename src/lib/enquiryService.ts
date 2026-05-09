import dbConnect from '@/lib/mongodb';
import Enquiry from '@/models/Enquiry';

export async function createEnquiry(data: any) {
  await dbConnect();
  const enquiry = new Enquiry(data);
  return await enquiry.save();
}

export async function getEnquiries() {
  await dbConnect();
  return await Enquiry.find({}).populate('customer').sort({ createdAt: -1 });
}

export async function getEnquiryById(id: string) {
  await dbConnect();
  return await Enquiry.findById(id).populate('customer');
}

export async function updateEnquiry(id: string, data: any) {
  await dbConnect();
  return await Enquiry.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteEnquiry(id: string) {
  await dbConnect();
  return await Enquiry.findByIdAndDelete(id);
}