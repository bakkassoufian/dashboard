import mongoose from 'mongoose';

const coworkingSpaceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  city: { type: String, trim: true },
  location: { type: String, trim: true },
  description: { type: String },
  capacity: { type: Number, default: 0, min: 0 },
  occupied: { type: Number, default: 0, min: 0 },
  amenities: [{ type: String, trim: true }],
  openingHours: { type: String, trim: true, default: '09h00 - 18h00' },
  status: {
    type: String,
    enum: ['open', 'full', 'maintenance', 'closed'],
    default: 'open',
  },
  imageUrl: { type: String },
  contactEmail: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('CoworkingSpace', coworkingSpaceSchema);
