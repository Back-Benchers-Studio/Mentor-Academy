import mongoose from "mongoose";


const courseSchema = new mongoose.Schema({

    description: {
        type: String,
        required: [true, 'description is required']
    },
    title: { 
        type: String,
        required: [true, 'title is required'] 
    },
    video: {
        type: String,
        required: [true, 'video  is required'] 
      },
}
,{ timestamps: true })


export const courseModel = mongoose.model('course', courseSchema)
