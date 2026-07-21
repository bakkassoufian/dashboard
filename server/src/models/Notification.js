import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  /** Destinataire. Si null + role/broadcast défini, la notification est diffusée. */
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  /** Diffusion ciblée par rôle (ex. 'manager'). 'all' = tout le monde. */
  audience: { type: String, trim: true },
  title: { type: String, required: true, trim: true },
  message: { type: String, trim: true },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info',
  },
  /** Lien interne optionnel (ex. /formations/:id) */
  link: { type: String, trim: true },
  read: { type: Boolean, default: false },
  /** Pour les notifications diffusées : liste des utilisateurs ayant marqué comme lu */
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ audience: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
