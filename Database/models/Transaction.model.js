
import mongoose from "mongoose";

const transactionSchema = mongoose.Schema({
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'wallet',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['deposit', 'withdrawal'],
      required: true
    }
  }, { timestamps: true });
  
  export const transactionModel = mongoose.model('transaction', transactionSchema);