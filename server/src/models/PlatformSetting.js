import mongoose from 'mongoose';

const periodSchema = new mongoose.Schema({
  key: { type: String, trim: true, required: true },
  label: { type: String, trim: true, required: true },
  enabled: { type: Boolean, default: true },
}, { _id: false });

const platformSettingSchema = new mongoose.Schema({
  singleton: { type: String, default: 'platform', unique: true },
  centers: [{ type: String, trim: true }],
  periods: [periodSchema],
}, { timestamps: true });

export default mongoose.model('PlatformSetting', platformSettingSchema);
