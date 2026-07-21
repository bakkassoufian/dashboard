import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  actorEmail: { type: String, trim: true, lowercase: true },
  actorRole: { type: String, trim: true },
  action: { type: String, required: true, trim: true },
  method: { type: String, trim: true },
  path: { type: String, trim: true },
  statusCode: { type: Number },
  success: { type: Boolean, default: false },
  ip: { type: String, trim: true },
  userAgent: { type: String, trim: true },
  details: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ actorEmail: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });

export default mongoose.model('ActivityLog', activityLogSchema);
