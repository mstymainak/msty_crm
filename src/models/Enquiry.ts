import { Schema, model, models } from 'mongoose';

const EnquirySchema = new Schema({
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  source: { type: String, enum: ['whatsapp', 'facebook', 'instagram', 'website', 'phone', 'email', 'other'], required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['new', 'contacted', 'qualified', 'booked', 'lost'], default: 'new' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  package: { type: Schema.Types.ObjectId, ref: 'Package' },
  adminNote: { type: String, default: '' },
  notes: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default models.Enquiry || model('Enquiry', EnquirySchema);