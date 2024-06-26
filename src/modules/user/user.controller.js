import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { userModel } from '../../../Database/models/User.model.js';
import {sendEmail} from "../../utils/sendEmail.js"
import crypto from 'crypto';



export const getAllUsers = catchAsyncError(async (req, res, next) => {

    let apiFeatures = new ApiFeatures(userModel.find(), req.query)
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

export const changeUserPassword = catchAsyncError(async (req, res, next) => {
    const { id } = req.params

    let result = await userModel.findById(id)
    if(!result) return next(new AppError(`User not found`), 404);

    if(!result.verified){
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
    if(!req.params.token || !req.body.password){
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

//update user profile
export const updateUserProfile = catchAsyncError(async (req, res) => {
    const userID = req.user._id;
    const user = await userModel.findById(userID);
    if (user) {
      const newUser = await userModel.findByIdAndUpdate(userID, req.body, { new: true });
      res.status(200).json({ newUser, message: "your profile has been updated" });
    } else {
      res.status(404).json({ message: "can not update your profile" })
    }
  });





