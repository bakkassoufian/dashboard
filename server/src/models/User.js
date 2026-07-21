import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  role: {
    type: String,
    enum: ['super_admin', 'manager', 'rse_manager', 'coordinator', 'member', 'member-odc-hybrid'],
    default: 'member',
  },
  entityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity', default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
