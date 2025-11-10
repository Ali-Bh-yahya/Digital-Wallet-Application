
import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['deposit', 'withdrawal', 'transfer','receive'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  description: { type: String },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Only for transfers
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', TransactionSchema);
export { Transaction };
