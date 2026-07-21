import mongoose from 'mongoose';

const satisfactionSchema = new mongoose.Schema({
  participantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant', required: true },
  formationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Formation', required: true },
  ratingContenu: { type: Number, min: 1, max: 5 },
  ratingFormateur: { type: Number, min: 1, max: 5 },
  ratingLogistique: { type: Number, min: 1, max: 5 },
  commentaires: { type: String },
  recommande: { type: Boolean },
  date: { type: Date, default: Date.now },
});

export default mongoose.model('Satisfaction', satisfactionSchema);
