import dbConnect from '@/lib/mongodb';
import YatraPackage from '@/models/YatraPackage';

export async function createPackage(data: any) {
  await dbConnect();
  const pkg = new YatraPackage(data);
  return await pkg.save();
}

export async function getPackages(activeOnly = false) {
  await dbConnect();
  const filter = activeOnly ? { isActive: true } : {};
  return await YatraPackage.find(filter).sort({ createdAt: -1 });
}

export async function getPackageById(id: string) {
  await dbConnect();
  return await YatraPackage.findById(id);
}

export async function updatePackage(id: string, data: any) {
  await dbConnect();
  return await YatraPackage.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
}

export async function deletePackage(id: string) {
  await dbConnect();
  return await YatraPackage.findByIdAndDelete(id);
}
