import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  lessonTitle: {
    type: String,
    required: [true, 'Lesson title is required']
  },
  lessonDescription: {
    type: String,
    required: [true, 'Lesson Description is required']
},
  lessonVideo: {
    type: String,
    required: [true, 'Lesson Video URL is required']
  },
}, { timestamps: true });

export const lessonModel = mongoose.model('lesson', lessonSchema);