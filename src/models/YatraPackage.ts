import { Schema, model, models } from 'mongoose';

const YatraPackageSchema = new Schema({
  name: { type: String, required: true },
  destinations: [{ type: String }],
  duration: { type: String, required: true },
  price: { type: Number, required: true },
  maxGroupSize: { type: Number, default: 50 },
  description: { type: String },
  inclusions: [{ type: String }],
  exclusions: [{ type: String }],
  startDates: [{ type: Date }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default models.YatraPackage || model('YatraPackage', YatraPackageSchema);
