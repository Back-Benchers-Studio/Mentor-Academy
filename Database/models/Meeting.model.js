import mongoose from "mongoose";


const meetingSchema = new mongoose.Schema({

    topic: {
        type: String,
        required: [true, 'topic is required']
    },
    duration: { 
        type: Number,
        required: [true, 'duration is required'] 
    },
    startDate: { 
        type: Date,
        required: [true, 'StartDate is required']
    },
}
,{ timestamps: true })


export const meetingModel = mongoose.model('meeting', meetingSchema)
