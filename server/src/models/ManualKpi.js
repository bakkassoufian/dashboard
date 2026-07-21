import mongoose from 'mongoose';

const manualKpiSchema = new mongoose.Schema({
  location: { type: String, required: true }, // 'Global', 'Casablanca', 'Rabat', 'Agadir'
  activity: { type: String, required: true }, // 'All', 'Ecole du Code', 'FabLab Solidaire', 'Orange Fab'
  
  totalParticipants: { type: Number, default: 0 },
  womenBeneficiaries: { type: Number, default: 0 },
  totalTrainings: { type: Number, default: 0 },
  totalStartups: { type: Number, default: 0 },
  insertionRate: { type: Number, default: 0 },
  childrenSuperCodeur: { type: Number, default: 0 },
  
  // Storage for trend data if needed
  monthlyTrend: [{
    month: String,
    val: Number
  }],
  
  participantsByYear: [{
    year: String,
    participants: Number
  }]
}, { timestamps: true });

// Ensure uniqueness for the combination
manualKpiSchema.index({ location: 1, activity: 1 }, { unique: true });

export default mongoose.model('ManualKpi', manualKpiSchema);
