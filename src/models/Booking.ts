import { Schema, model, models } from 'mongoose';
import './Customer';
import './YatraPackage';
import './Enquiry';
import './User';

const BookingSchema = new Schema({
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  package: { type: Schema.Types.ObjectId, ref: 'YatraPackage', required: true },
  enquiry: { type: Schema.Types.ObjectId, ref: 'Enquiry' },
  numberOfTravelers: { type: Number, required: true, default: 1 },
  travelDate: { type: Date, required: true },
  endTravelDate: { type: Date },
  packageGroup: { type: String },
  status: {
    type: String,
    enum: ['confirmed', 'payment_pending', 'paid', 'in_progress', 'completed', 'cancelled'],
    default: 'confirmed',
  },
  totalAmount: { type: Number, required: true },
  advancePaid: { type: Number, default: 0 },
  balancePending: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['cash', 'upi', 'bank_transfer', 'card', 'other'] },
  specialRequirements: { type: String },
  notes: { type: String },
  paymentHistory: [{ amount: Number, date: { type: Date, default: Date.now }, method: String }],
  bookedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default models.Booking || model('Booking', BookingSchema);
