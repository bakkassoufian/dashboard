import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  participantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant', required: true },
  formationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Formation', required: true },
  status: {
    type: String,
    /** inscrit = pré-inscrit; confirme = inscription confirmée; confirme_present = présent à une séance; valide = fin de parcours / import liste finale; absent */
    enum: ['inscrit', 'confirme', 'confirme_present', 'valide', 'absent'],
    default: 'inscrit',
  },
  recommendedForJobDating: { type: Boolean, default: false },
  notes: { type: String },
}, { timestamps: true });

attendanceSchema.index({ formationId: 1, participantId: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
