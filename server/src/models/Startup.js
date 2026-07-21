import mongoose from 'mongoose';

const startupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  stage: { 
    type: String, 
    enum: ['Ideation', 'Concept', 'MVP', 'Prototypage', 'Go-to-Market', 'Scale-up', 'Growth', 'Maturity'],
    default: 'Ideation'
  },
  founders: [{ 
    name: String, 
    email: String,
    participantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant' }
  }],
  programName: { type: String }, // e.g. "Orange Fab", "Afratech"
  fundsRaised: { type: Number, default: 0 },
  currency: { type: String, default: 'MAD' },
  mentors: [{ type: String }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Startup', startupSchema);
