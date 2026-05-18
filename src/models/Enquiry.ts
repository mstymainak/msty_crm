import { Schema, model, models } from 'mongoose';
import './Customer';
import './YatraPackage';

const EnquirySchema = new Schema({
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  source: { type: String, enum: ['whatsapp', 'facebook', 'instagram', 'website', 'phone', 'email', 'crm', 'other'], required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['new', 'contacted', 'qualified', 'booked', 'lost'], default: 'new' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  package: { type: Schema.Types.ObjectId, ref: 'YatraPackage' },
  packageGroup: { type: String, default: null },
  submittedName: { type: String, default: '' },
  adminNote: { type: String, default: '' },
  notes: [{ type: String }],
  members: [{
    name: { type: String, required: true },
    phone: { type: String, default: '' },
    relation: { type: String, default: '' },
    city: { type: String, default: '' }
  }],
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default models.Enquiry || model('Enquiry', EnquirySchema);