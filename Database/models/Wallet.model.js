
import mongoose from "mongoose";


const walletSchema = mongoose.Schema({
    educator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'educator',
      required: true
    },
    balance: {
      type: Number,
      default: 0
    },
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'transaction'
      }
    ]
  }, { timestamps: true });
  
  export const walletModel = mongoose.model('wallet', walletSchema);