//import { sessionModel } from "../../../DB/models/Session.model.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { courseModel } from "../../../Database/models/Course.model.js";
import { sessionModel } from "../../../Database/models/Session.model.js";
import Stripe from 'stripe';
const stripe = new Stripe(`${process.env.STRIPE_KEY}`);


export const handleSession = catchAsyncError(async (req, res, next) => {

    let sessionStripe = await stripe.checkout.sessions.retrieve(req.query.session_id,{
        // Pass the API key in the Authorization header
        apiKey: process.env.STRIPE_KEY,
    });
    const userID = sessionStripe.metadata.userID;

    //Check if session is paid
    if(sessionStripe.payment_status !== 'paid'){
        return next(new AppError('Session is not paid',400))
    }
    
    let sessionMongo = await sessionModel.findOne({session_id:sessionStripe.id}).select('isSuccess intent');
    if(!sessionMongo){
        return next(new AppError('Session not found',404))
    }

    if(sessionMongo.isSuccess){
        return res.status(200).json({ message: 'success'})
    }

    // change isSuccess to true
    sessionMongo.isSuccess = true;
    sessionMongo.intent = sessionStripe.payment_intent;
    await sessionMongo.save();

    //update course status
    let coursemodel = await courseModel.findById(sessionStripe.client_reference_id);
    // coursemodel.payment.status = 'paid';
    // coursemodel.paidAt = Date.now();
    // coursemodel.isPaid = true;
    // await coursemodel.save();

        // Update the payment array in the course model
        const paymentInfo = {
            user: userID,
            status: 'paid',
            paidAt: Date.now(),
            isPaid:true
          };
          coursemodel.payment.push(paymentInfo);
          await coursemodel.save();
      

    console.log(sessionStripe);
    res.status(200).json({ message: 'success'})
})

