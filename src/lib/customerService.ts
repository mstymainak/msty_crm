import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';

export async function createCustomer(data: any) {
  await dbConnect();
  if (data.phone) {
    const existing = await Customer.findOne({ phone: data.phone, isDeleted: { $ne: true } });
    if (existing) {
      const obj = typeof existing.toObject === 'function' ? existing.toObject() : existing;
      return { ...obj, alreadyExisted: true };
    }
  }
  const customer = new Customer(data);
  const saved = await customer.save();
  const obj = typeof saved.toObject === 'function' ? saved.toObject() : saved;
  return { ...obj, alreadyExisted: false };
}

export async function getCustomers() {
  await dbConnect();
  return await Customer.find({ isDeleted: { $ne: true } })
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });
}

export async function getCustomerById(id: string) {
  await dbConnect();
  return await Customer.findOne({ _id: id, isDeleted: { $ne: true } });
}

export async function updateCustomer(id: string, data: any) {
  await dbConnect();
  return await Customer.findOneAndUpdate({ _id: id, isDeleted: { $ne: true } }, data, { new: true });
}

export async function deleteCustomer(id: string) {
  await dbConnect();
  return await Customer.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
}