import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, trim: true, default: 'Equipment' },
  entityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity', required: true },
  quantityAvailable: { type: Number, default: 0 },
  alertThreshold: { type: Number, default: 5 },
  status: {
    type: String,
    enum: ['stock_ok', 'low_stock', 'out_of_stock'],
    default: 'stock_ok',
  },
}, { timestamps: true });

// Auto update status based on quantity
inventorySchema.pre('save', function (next) {
  if (this.quantityAvailable <= 0) {
    this.status = 'out_of_stock';
  } else if (this.quantityAvailable <= this.alertThreshold) {
    this.status = 'low_stock';
  } else {
    this.status = 'stock_ok';
  }
  next();
});

export default mongoose.model('Inventory', inventorySchema);
