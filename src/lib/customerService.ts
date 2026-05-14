import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';

export async function createCustomer(data: any) {
  await dbConnect();

  // Check if customer with same email or phone number already exists
  const query: any[] = [];
  if (data.email && typeof data.email === 'string' && data.email.trim()) {
    query.push({ email: data.email.trim() });
  }
  if (data.phone && typeof data.phone === 'string' && data.phone.trim()) {
    query.push({ phone: data.phone.trim() });
  }

  if (query.length > 0) {
    const existing = await Customer.findOne({
      $or: query,
      isDeleted: { $ne: true }
    });

    if (existing) {
      return existing;
    }
  }

  const customer = new Customer(data);
  return await customer.save();
}

export async function getCustomers() {
  await dbConnect();
  return await Customer.find({ isDeleted: { $ne: true } });
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