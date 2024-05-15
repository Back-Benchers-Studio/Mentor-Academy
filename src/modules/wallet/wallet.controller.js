import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { depositModel } from "../../../Database/models/Deposit.model.js";
import { walletModel } from "../../../Database/models/Wallet.model.js";
import { userModel } from "../../../Database/models/User.model.js";
import { adminModel } from "../../../Database/models/Admin.model.js";
import { sendEmail } from "../../utils/sendEmail.js"
import Stripe from 'stripe';
const stripe = new Stripe(`${process.env.STRIPE_KEY}`);




// get educator wallet :
export const getWallet = catchAsyncError(async (req, res, next) => {

    let result = await walletModel.find({ educator: req.user._id })
    !result && next(new AppError(`No Wallet found`), 404)
    result && res.status(200).json({ message: "success", result })
})

export const requestEducatorFees = catchAsyncError(async (req, res) => {
    let  body  = req.body;
    console.log(body)
    const { request } = body;
    console.log(request)
    console.log(Object.keys(request).length)
    const admins = await adminModel.find();
    const subject = `Fees Request`;
    let htmlBody = `<h3>Hello {recipientName},\n${request}\nBest regards,${req.user.name}</h3>`;
    console.log(htmlBody);
    const sendEmailPromises = [];
    if (Object.keys(request).length != 0) {
        // Loop through admins and send email
        for (const admin of admins) {
            const emailBody = htmlBody.replace('{recipientName}', admin.name)
            console.log(emailBody);
            const emailPromise = sendEmail(admin.email, emailBody, subject);
            sendEmailPromises.push(emailPromise);
        }
        await Promise.all(sendEmailPromises);
        res.status(200).json({ EmailBody, message: "You have been sent Request Successfully..." });
    }else{
        res.status(400).json({ message: "Please Enter a description to Your Request" });
    }
 
});





