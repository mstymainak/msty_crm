import { Schema, model, models } from 'mongoose';

const CustomerSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default models.Customer || model('Customer', CustomerSchema);