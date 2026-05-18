import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export async function createUser(data: any) {
  await dbConnect();
  const hashedPassword = await hashPassword(data.password);
  const user = new User({ ...data, password: hashedPassword, visiblePassword: data.password });
  return await user.save();
}

export async function getUsers() {
  await dbConnect();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Auto-deactivate agents not active for 7 days
  await User.updateMany(
    { 
      role: 'agent', 
      isActive: true, 
      $or: [
        { lastLogin: { $lt: sevenDaysAgo } },
        { lastLogin: { $exists: false }, createdAt: { $lt: sevenDaysAgo } }
      ]
    },
    { 
      isActive: false, 
      updatedAt: now 
    }
  );

  return await User.find({}).select('-password').sort({ createdAt: -1 });
}

export async function getUserByEmail(email: string) {
  await dbConnect();
  return await User.findOne({ email });
}

export async function getUserById(id: string) {
  await dbConnect();
  return await User.findById(id).select('-password');
}

export async function updateUser(id: string, data: any) {
  await dbConnect();
  if (data.password) {
    data.password = await hashPassword(data.password);
  }
  return await User.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true }).select('-password');
}

export async function deleteUser(id: string) {
  await dbConnect();
  return await User.findByIdAndDelete(id);
}

export async function seedAdminUser() {
  await dbConnect();
  const existingAdmin = await User.findOne({ email: 'admin@mstycrm.com' });
  if (!existingAdmin) {
    const hashedPassword = await hashPassword('admin123');
    await User.create({
      name: 'Admin',
      email: 'admin@mstycrm.com',
      password: hashedPassword,
      role: 'admin',
    });
    return true;
  }
  return false;
}
