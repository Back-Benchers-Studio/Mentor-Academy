import mongoose from "mongoose";


const announcementSchema = new mongoose.Schema({

    description: {
        type: String,
        required: [true, 'description is required']
    },
    title: { 
        type: String,
        required: [true, 'title is required'] 
    },
    DeliverDate: { 
        type: String,
        required: [false, 'DeliverDate is required']
    },
}
,{ timestamps: true })


export const announcementModel = mongoose.model('announcement', announcementSchema)
