import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'error', 'success'], default: 'info' },
  category: { type: String, enum: ['performance', 'deadline', 'dropout', 'feedback'], required: true },
  isRead: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetRoles: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Alert', alertSchema);
