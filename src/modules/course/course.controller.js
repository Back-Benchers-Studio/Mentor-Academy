import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { userModel } from '../../../Database/models/User.model.js';
import { sendEmail } from "../../utils/sendEmail.js"
import crypto from 'crypto';
import { educatorModel } from "../../../Database/models/Educator.model.js";
import { announcementModel } from "../../../Database/models/Announcement.model.js";
import { courseModel } from "../../../Database/models/Course.model.js";
import { deleteOne, getSpecficFun, updateFun } from "../handlers/factor.handler.js";

import  cloudinary  from "../../utils/cloudinary.js";




// Add Cousre by the educator:
export const addCourse   = catchAsyncError(async (req, res) => {

  const courseVideo = await cloudinary.uploader.upload(req.file.path,{resource_type: 'video'});
  console.log(courseVideo)
  req.body.video = courseVideo.secure_url;
  console.log(req.body)
 

    let course = new courseModel(req.body);
    await course.save();
    const users = await userModel.find();
    const subject = `New Course`;   
    let htmlBody = `<h1>Dear {recipientName},\nThere is a new Course.\nCheck It Please😊\nBest regards,${req.user.name} \nMentor Academy</h1>`;
    console.log(htmlBody)
    const sendEmailPromises = [];
    if(course){
   // Loop through users and send email
   for (const user of users) {
    const emailBody = htmlBody.replace('{recipientName}', user.name)
     console.log(emailBody);
   // const emailPromise = sendEmail(user.email, emailBody, subject);
   // sendEmailPromises.push(emailPromise);
  }
  //await Promise.all(sendEmailPromises);
  res.status(200).json({course,message:"You have been uploaded The Course Successfully..."});
    }
   
  });
  
  export const getAnnouncements = catchAsyncError(async (req, res) => {
    let apiFeatures = new ApiFeatures(announcementModel.find(), req.query).paginate()
   
    if (req.query.keyword) {
      let word = req.query.keyword
      apiFeatures.mongooseQuery.find({ $or: [{ description: { $regex: word, $options: 'i' } }, { title: { $regex: word, $options: 'i' } }] })
    }
  
    // Sort by ascending createdAt
    apiFeatures.mongooseQuery.sort({ createdAt: -1 });
    let announcements = await apiFeatures.mongooseQuery
    res.status(200).json({ page: apiFeatures.page, announcements });
  });
  
  // Update Announcement
  export const updateAnnouncement = updateFun(announcementModel);
  // Delete Announcement
  export const deleteAnnouncement = deleteOne(announcementModel);
  // Get Specific Announcement
  export const getAnnouncementByID = getSpecficFun(announcementModel);


