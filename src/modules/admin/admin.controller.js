import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { userModel } from '../../../Database/models/User.model.js';
import { sendEmail } from "../../utils/sendEmail.js"
import crypto from 'crypto';
import { educatorModel } from "../../../Database/models/Educator.model.js";
import { log } from "console";



export const getAllUsers = catchAsyncError(async (req, res, next) => {

    let apiFeatures = new ApiFeatures(userModel.find(), req.query)
        .paginate().fields().filter().search().sort()
    //execute query
    let result = await apiFeatures.mongooseQuery
    res.status(200).json({ message: "success", page: apiFeatures.page, result })


})

export const getAllEducators = catchAsyncError(async (req, res, next) => {

    let apiFeatures = new ApiFeatures(educatorModel.find(), req.query)
        .paginate().fields().filter().search().sort()
    //execute query
    let result = await apiFeatures.mongooseQuery
    res.status(200).json({ message: "success", page: apiFeatures.page, result })


})

export const getUser = catchAsyncError(async (req, res, next) => {
    const { id } = req.params
    let result = await userModel.findById(id)
    result.password = undefined
    !result && next(new AppError(`User not found`), 404)
    result && res.status(200).json({ message: "success", result })
})

export const getEducator = catchAsyncError(async (req, res, next) => {
    const { id } = req.params
    let result = await educatorModel.findById(id)
    result.password = undefined
    !result && next(new AppError(`User not found`), 404)
    result && res.status(200).json({ message: "success", result })
})

// Block / unBlock User:
export const blockUser = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const { isBlocked } = await userModel.findById(id);
    const user = await userModel.findByIdAndUpdate(id, { isBlocked: !isBlocked }, { new: true });
    if (user && !isBlocked) {
        const userEmail = user.email;
        const html = `<h1>Your Account has been Blocked</h1>`;
        const subject = `Account Blocking`;
        sendEmail(userEmail, html, subject);
        res.status(200).json({ message: "This user has Been Blocked", user });
    }
    else if (user && isBlocked) {
        const userEmail = user.email;
        const html = `<h1>Your Account has been unBlocked</h1>`;
        const subject = `Account UnBlocking`;
        sendEmail(userEmail, html, subject);
        res.status(200).json({ message: "This user has Been UnBlocked", parent });
    }
    else {
        res.status(401).json({ message: "Invalid user ID" });
    }
})

// Block / unBlock Educator:
export const blockEducator = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const { isBlocked } = await educatorModel.findById(id);
    const educator = await educatorModel.findByIdAndUpdate(id, { isBlocked: !isBlocked }, { new: true });
    if (educator && !isBlocked) {
        const educatorEmail = educator.email;
        const html = `<h1>Your Account has been Blocked</h1>`;
        const subject = `Account Blocking`;
        sendEmail(educatorEmail, html, subject);
        res.status(200).json({ message: "This educator has Been Blocked", educator });
    }
    else if (educator && isBlocked) {
        const educatorEmail = educator.email;
        const html = `<h1>Your Account has been unBlocked</h1>`;
        const subject = `Account UnBlocking`;
        sendEmail(educatorEmail, html, subject);
        res.status(200).json({ message: "This educator has Been UnBlocked", educator });
    }
    else {
        res.status(401).json({ message: "Invalid educator ID" });
    }
})

//Get Pending Educator Fees: 
export const getPendingEducatorFees = catchAsyncError(async (req, res) => {
    const pendingEducatorFees = await educatorModel.find({ isFeesAccepted: false });
    if (pendingEducatorFees.length > 0) {
        res.status(200).json({ pendingEducatorFees })
    } else {
        res.status(200).json({ message: "No Pending Educator Fees" })
    }
});

//Accept pending educators fees:
export const accpetPendingEducatrFees = catchAsyncError(async (req, res) => {
    const { educatorID } = req.params;
    const { isFeesAccepted } = await educatorModel.findById(educatorID);
    const educator = await educatorModel.findByIdAndUpdate(educatorID, { isFeesAccepted: 'true' }, { new: true });
    if (educator && !isFeesAccepted) {
        //const html = `<h2>Your Request to withdraw Fees has been accepted</h2>`
        // sendEmail(educator.email ,html,"Fees Request Acceptance")
        res.status(200).json({ message: "This Educator has Been accepted", educator });
    }
    else {
        res.status(401).json({ message: "Invalid Educator" });
    }
});
// Send Mail to all users / educators:
export const sendMailtoAll = catchAsyncError(async (req, res) => {
    let EmailBody = req.body;
    console.log(EmailBody);
    const { body } = EmailBody;
    console.log(body)
    console.log(Object.keys(EmailBody).length)
    const users = await userModel.find();
    const educators = await educatorModel.find();
    const subject = `NEW Announcement from Mentor Academy`;
    let htmlBody = `<h3>Dear {recipientName},\nThere is new Announcemnt😊.\n${body}\nBest regards,\nMentor Academy</h3>`;
    console.log(htmlBody);
    const sendEmailPromises = [];
    if (Object.keys(EmailBody).length != 0) {
        // Loop through educators and send email
        for (const educator of educators) {
            const emailBody = htmlBody.replace('{recipientName}', educator.name)
            console.log(emailBody);
            const emailPromise = sendEmail(educator.email, emailBody, subject);
            sendEmailPromises.push(emailPromise);
        }
        
        // Loop through users and send email
        for (const user of users) {
            const emailBody = htmlBody.replace('{recipientName}', user.name);
            console.log(emailBody);
            const emailPromise = sendEmail(user.email, emailBody, subject);
            sendEmailPromises.push(emailPromise);
        }

        await Promise.all(sendEmailPromises);
        res.status(200).json({ EmailBody, message: "You have been sent Announcement Successfully..." });
    }else{
        res.status(400).json({ message: "Please Enter Body to Your Email" });
    }

});

export const changeUserPassword = catchAsyncError(async (req, res, next) => {
    const { id } = req.params

    let result = await userModel.findById(id)
    if (!result) return next(new AppError(`User not found`), 404);

    if (!result.verified) {
        return next(new AppError(`User not verified`), 400);
    }

    // generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    result.passwordResetToken = resetPasswordToken;
    result.passwordResetExpires = Date.now() + 15 * 60 * 1000; //15 minutes
    //@todo change url to frontend url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const userEmail = result.email;
    const html = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PATCH request to: \n\n ${resetUrl}`;
    const subject = `Password reset`;
    await sendEmail(userEmail, html, subject);
    await result.save();
    res.status(200).json({ message: "success", result })
})

export const resetPassword = catchAsyncError(async (req, res, next) => {
    if (!req.params.token || !req.body.password) {
        return next(new AppError(`Please provide token and password in request body`, 400));
    }

    let resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    let user = await userModel.findOne({
        passwordResetToken: resetPasswordToken,
    });

    if (!user) {
        return next(new AppError('Invalid Token', 400));
    }

    if (user.passwordResetExpires < Date.now()) {
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await user.save();
        return next(new AppError('Token Expired', 400));
    }

    user.password = req.body.password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();
    res.status(200).json({ message: "success", user })
})

