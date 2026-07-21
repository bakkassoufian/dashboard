import mongoose from 'mongoose';

const formationSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  trainerName: { type: String, trim: true },
  /** formation = default; workshop = atelier; super_codeur = parcours enfants; pfe = soutenance / stage PFE */
  activityType: {
    type: String,
    enum: ['formation', 'workshop', 'super_codeur', 'pfe'],
    default: 'formation',
  },
  /** Champs PFE (pertinents quand activityType = pfe) */
  pfeProjectName: { type: String, trim: true },
  pfeEncadrantName: { type: String, trim: true },
  pfeStagiaireCount: { type: Number, min: 0 },
  pfeAnnee: { type: Number, min: 2000, max: 2100 },
  pfeStageMonths: { type: Number, min: 0, max: 36 },
  /**
   * Effectifs : saisie manuelle sur la fiche et/ou recalcul à l'import
   * (sauf si skipStatsOnImport = true, voir import)
   */
  inscritsCount: { type: Number, default: 0, min: 0 },
  confirmesCount: { type: Number, default: 0, min: 0 },
  validesCount: { type: Number, default: 0, min: 0 },
  /** Si true, l’import ne recalcule pas inscrits / confirmés / validés (saisie manuelle conservée) */
  skipStatsOnImport: { type: Boolean, default: false },
  entityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity', required: true },
  location: { type: String, trim: true },
  dateStart: { type: Date },
  dateEnd: { type: Date },
  /** Durée (texte libre, ex. « 3 jours », « 8 séances ») */
  sessionDuration: { type: String, trim: true },
  timeSlot: { type: String },
  publicationDateRequested: { type: Date },
  publicationDateRecommended: { type: Date },
  status: {
    type: String,
    enum: ['draft', 'en_cours_production', 'en_cours_validation', 'valide_programme', 'publie', 'not_started'],
    default: 'draft',
  },
  registrationLink: { type: String },
  imageUrl: { type: String },
  sponsoring: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

formationSchema.index({ entityId: 1, status: 1 });
formationSchema.index({ entityId: 1, activityType: 1 });
formationSchema.index({ location: 1, dateStart: 1 });

export default mongoose.model('Formation', formationSchema);
