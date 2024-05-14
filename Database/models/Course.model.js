import mongoose from "mongoose";


const courseSchema = new mongoose.Schema({
    //user: { type: mongoose.Types.ObjectId, ref: 'user' }, // each user has many courses

    courseDescription: {
        type: String,
        required: [true, 'Course Description is required']
    },
    courseTitle: {
        type: String,
        required: [true, 'Course Title is required']
    },
    courseImage: {
        type: String,
        // required: [true, 'Course Image is required']
    },
    lessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'lesson'
    }],
    coursePrice: {
        type: Number,
        required: [true, 'Course Price is required'],
        min: 0
    },
   
    payment: [{
        user: { type: mongoose.Types.ObjectId, ref: 'user' },
        status: {
            type: String,
            enum: ['not paid', 'paid', 'cancelled'],
            default: 'not paid'
        },
        paidAt: Date,
        isPaid: {
            type: Boolean,
            default: false
        },
    }],

}
    , { timestamps: true })


export const courseModel = mongoose.model('course', courseSchema)
