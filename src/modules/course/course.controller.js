import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { userModel } from '../../../Database/models/User.model.js';
import { sendEmail } from "../../utils/sendEmail.js"
import crypto from 'crypto';
import { educatorModel } from "../../../Database/models/Educator.model.js";
import { announcementModel } from "../../../Database/models/Announcement.model.js";
import { courseModel } from "../../../Database/models/Course.model.js";
import { lessonModel } from "../../../Database/models/Lesson.model.js";

import { sessionModel } from "../../../Database/models/Session.model.js";
import { deleteOne, getSpecficFun, updateFun } from "../handlers/factor.handler.js";

import cloudinary from "../../utils/cloudinary.js";
import Stripe from 'stripe';
const stripe = new Stripe(`${process.env.STRIPE_KEY}`);

// checkout course
export const createCheckOutSessionCourse = catchAsyncError(async (req, res, next) => {

  const { courseID } = req.params
  // check if course exists
  const course = await courseModel.findById(courseID)
  //.select('coursePrice');
  if (!course) {
    return next(new AppError('Course not found', 404));
  }
  const price = course.coursePrice;
  console.log(price)

  let session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: price * 100,
          product_data: {
            name: course.courseTitle
          }
        },
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: "http://localhost:7000/api/v1/session/?session_id={CHECKOUT_SESSION_ID}",// will change
    customer_email: req.user.email,
    //client_reference_id: orderID,
    client_reference_id: course._id.toString(), // Pass the course ID as reference
    metadata: {
      userID: req.user._id.toString() // Add the user ID to the session metadata
    }

  }, {
    // Pass the API key in the Authorization header
    apiKey: process.env.STRIPE_KEY,
  })

  if (!session) {
    return next(new AppError('Error Creating Session', 404));
  }

  let sessionmodel = new sessionModel({
    session_id: session.id,
    course: course._id,
    user: req.user._id,
    expires_at: session.expires_at,
  })
  await sessionmodel.save();
  console.log(session.payment_intent);

  //res.json({ message: "success", session })

  res.status(200).json({ Course: course, CoursePaymentURL: session.url, message: "Success...plz Complete Payment Step First to access the Course..." });
})



// Add Cousre by the admin:
export const addCourse = catchAsyncError(async (req, res) => {

  if (req.file && req.file.path) {
    const courseImage = await cloudinary.uploader.upload(req.file.path)
    req.body.courseImage = courseImage.secure_url;
  }

  console.log(req.body)
  let course = new courseModel(req.body);
  await course.save();
  const users = await userModel.find();
  const subject = `New Course`;
  let htmlBody = `<h1>Dear {recipientName},\nThere is a new Course.\nCheck It Please😊\nBest regards,${req.user.name} \nMentor Academy</h1>`;
  console.log(htmlBody)
  const sendEmailPromises = [];
  if (course) {
    // Loop through users and send email
    for (const user of users) {
      const emailBody = htmlBody.replace('{recipientName}', user.name)
      console.log(emailBody);
      // const emailPromise = sendEmail(user.email, emailBody, subject);
      // sendEmailPromises.push(emailPromise);
    }
    //await Promise.all(sendEmailPromises);
    res.status(200).json({ course, message: "You have been added The Course Successfully..." });
  }
})

export const addLessonToCourse = catchAsyncError(async (req, res) => {

  const { courseId } = req.params;
  try {
    const lessonVideo = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        req.file.path,
        {
          resource_type: 'video',
        },
        (error, lessonVideo) => {
          if (error) {
            reject(error);
          }
          resolve(lessonVideo);
        }
      );
    });
    console.log(`> Result: ${lessonVideo.secure_url}`);
    req.body.lessonVideo = lessonVideo.secure_url;
    let lesson = new lessonModel(req.body);
    await lesson.save();
    // Add the new lesson's ID to the course's lessons array
    const course = await courseModel.findById(courseId);
    course.lessons.push(lesson._id);
    await course.save();
    const users = await userModel.find();
    const subject = `New Lesson `;
    let htmlBody = `<h1>Dear {recipientName},\nThere is a new lesson to the Course${course.courseTitle} has been added .\nCheck It Please😊\nBest regards,${req.user.name} \nMentor Academy</h1>`;
    console.log(htmlBody)
    const sendEmailPromises = [];
    if (course) {
      // Loop through users and send email
      for (const user of users) {
        const emailBody = htmlBody.replace('{recipientName}', user.name)
        console.log(emailBody);
        // const emailPromise = sendEmail(user.email, emailBody, subject);
        // sendEmailPromises.push(emailPromise);
      }
      //await Promise.all(sendEmailPromises);
      res.status(200).json({ lesson, message: "You have been uploaded The Lesson Successfully..." });
    }
  } catch (error) {
    console.error(error);
  }
});

export const getCourses = catchAsyncError(async (req, res) => {
  let apiFeatures = new ApiFeatures(courseModel.find(), req.query).paginate()

  if (req.query.keyword) {
    let word = req.query.keyword
    apiFeatures.mongooseQuery.find({ $or: [{ courseDescription: { $regex: word, $options: 'i' } }, { courseTitle: { $regex: word, $options: 'i' } }] })
  }

  // Sort by ascending createdAt
  apiFeatures.mongooseQuery.sort({ createdAt: -1 });
  let courses = await apiFeatures.mongooseQuery
  res.status(200).json({ page: apiFeatures.page, courses });
});

export const viewCourse = catchAsyncError(async (req, res) => {
  const { courseID } = req.params;
  const userId = req.user._id;

  // Find the course by courseID and check if the user is present in the payment array
  const course = await courseModel.findOne({
    _id: courseID,
    'payment.user': userId
  });

  if (!course) {
    return res.status(403).json({status: 'error',message: 'You need to complete the payment first to view this course.'
    });
  }
  return res.status(200).json({status: 'success', data: { course}});
});




export const getCourseLessons = catchAsyncError(async (req, res) => {
  const { courseId } = req.params;

  const course = await courseModel.findById(courseId).populate('lessons');
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  res.status(200).json({ CourseLessons: course });
});

// // Update Course
// export const updateCourse = updateFun(courseModel);
// Delete Course
export const deleteCourse = deleteOne(courseModel);
// Get Specific Course
export const getCourseByID = getSpecficFun(courseModel);


