
import mongoose from "mongoose";


const walletSchema = mongoose.Schema({
  educator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'educator',
    required: true
    // required: function () {
    //     return this.role === 'user';
    //   }
  },
  balance: {
    type: Number,
    default: 0
  },
  // transactions: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'transaction'
  //   }
  // ],
  transactions: [
    {
      educator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "educator",
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
      },
      note: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now()
      }
    }]
}, { timestamps: true });

export const walletModel = mongoose.model('wallet', walletSchema);