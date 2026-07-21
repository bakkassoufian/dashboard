import mongoose from 'mongoose';

const platformSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  url: { type: String, trim: true },
  category: {
    type: String,
    enum: ['Formation', 'Entrepreneuriat', 'Employabilité', 'Communauté', 'Outil interne', 'Autre'],
    default: 'Autre',
  },
  status: {
    type: String,
    enum: ['live', 'beta', 'development', 'archived'],
    default: 'live',
  },
  logoUrl: { type: String },
  tags: [{ type: String, trim: true }],
  launchYear: { type: Number, min: 2000, max: 2100 },
  usersCount: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Platform', platformSchema);
