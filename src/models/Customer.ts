import { Schema, model, models } from 'mongoose';
import './User';

const CustomerSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: false },
  source: { type: String, default: 'website' },
  phone: { type: String },
  whatsappNumber: { type: String },
  facebookId: { type: String },
  instagramId: { type: String },
  age: { type: Number },
  address: { type: String },
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
  },
  medicalInfo: {
    conditions: [String],
    medications: [String],
    allergies: [String],
  },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default models.Customer || model('Customer', CustomerSchema);