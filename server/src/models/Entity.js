import mongoose from 'mongoose';

const entitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['Ecole du Code', 'FabLab Solidaire', 'Orange Fab'],
    required: true,
  },
  location: { type: String, required: true, trim: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Entity', entitySchema);
