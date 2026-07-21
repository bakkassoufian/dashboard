import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: ['3D Printing', 'Laser Cutting', 'CNC', 'Electronics', 'Arduino/IoT', 'Prototyping Tools'],
    required: true
  },
  status: { type: String, enum: ['active', 'maintenance', 'out_of_service'], default: 'active' },
  usageHistory: [{
     date: { type: Date, default: Date.now },
     participantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant' },
     duration: { type: Number }, // in hours
     projectName: { type: String }
  }],
  lastMaintenance: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Equipment', equipmentSchema);
