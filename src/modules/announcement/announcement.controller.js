import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { userModel } from '../../../Database/models/User.model.js';
import { sendEmail } from "../../utils/sendEmail.js"
import crypto from 'crypto';
import { educatorModel } from "../../../Database/models/Educator.model.js";
import { announcementModel } from "../../../Database/models/Announcement.model.js";
import { deleteOne, getSpecficFun, updateFun } from "../handlers/factor.handler.js";






// Add Announcement by the educator:
export const addAnnouncement = catchAsyncError(async (req, res) => {
    let announcement = new announcementModel(req.body);
    await announcement.save();
    const users = await userModel.find();
    const subject = `NEW Task`;   
    let htmlBody = `<h1>Dear {recipientName},\nThere is a new Task.\nCheck It Please😊\nBest regards,${req.user.name} \nMentor Academy</h1>`;
    console.log(htmlBody)
    const sendEmailPromises = [];
    if(announcement){
   // Loop through users and send email
   for (const user of users) {
    const emailBody = htmlBody.replace('{recipientName}', user.name)
     console.log(emailBody);
   // const emailPromise = sendEmail(user.email, emailBody, subject);
   // sendEmailPromises.push(emailPromise);
  }
  await Promise.all(sendEmailPromises);
  res.status(200).json({announcement,message:"You have been added Task Successfully..."});
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


