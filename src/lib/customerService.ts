import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';

export async function createCustomer(data: any) {
  await dbConnect();
  const customer = new Customer(data);
  return await customer.save();
}

export async function getCustomers() {
  await dbConnect();
  return await Customer.find({});
}

export async function getCustomerById(id: string) {
  await dbConnect();
  return await Customer.findById(id);
}

export async function updateCustomer(id: string, data: any) {
  await dbConnect();
  return await Customer.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteCustomer(id: string) {
  await dbConnect();
  return await Customer.findByIdAndDelete(id);
}