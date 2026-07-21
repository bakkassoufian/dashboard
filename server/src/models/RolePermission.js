import mongoose from 'mongoose';

const rolePermissionSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['super_admin', 'manager', 'coordinator', 'member'],
    required: true,
    unique: true,
  },
  permissions: {
    read: { type: Boolean, default: true },
    write: { type: Boolean, default: false },
    export: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
}, { timestamps: true });

export default mongoose.model('RolePermission', rolePermissionSchema);
