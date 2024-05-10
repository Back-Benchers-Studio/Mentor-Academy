import mongoose from "mongoose";

const depositSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "successful", "failed"],
        default: "pending",
        required: true
    },
    payment_url:{
        type: String,
    },
    session_id: {
        type: String,
    },
    expires_at: {
        type: Number,
    },
}, {
    timestamps: true
})

export const depositModel = mongoose.model('deposit', depositSchema)