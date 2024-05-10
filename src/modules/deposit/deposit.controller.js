import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { depositModel } from "../../../Database/models/Deposit.model.js";
import { userModel } from "../../../Database/models/User.model.js";

import Stripe from 'stripe';
const stripe = new Stripe(`${process.env.STRIPE_KEY}`);


const createDeposit = catchAsyncError(async (req, res, next) => {

    const deposit = new depositModel({
        user: req.user._id,
        amount: req.body.amount,
    })

    let depositID=null;
    await deposit.save().then((dep)=>{
        depositID=dep._id.toString();

    })
    if (!deposit){
        return next(new AppError('error in deposit id', 404))
    }

    let session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    unit_amount: Math.round(req.body.amount * 100),
                    product_data: {
                        name: req.user.name
                    }
                },
                quantity: 1
            }
        ],
        mode: 'payment',
        success_url: "http://localhost:5000/api/v1/deposits/verify?session_id={CHECKOUT_SESSION_ID}",//@todo will change
        customer_email: req.user.email,
        client_reference_id: depositID,

    },{
        // Pass the API key in the Authorization header
        apiKey: process.env.STRIPE_KEY,
    })

    if(!session){
        return next(new AppError('Error Creating Session', 404));
    }

    deposit.session_id = session.id;
    deposit.payment_url = session.url;
    deposit.expires_at = session.expires_at;
    await deposit.save();

    res.json({ message: "success", session })
})

const verifyDeposit = catchAsyncError(async (req, res, next) => {
    let sessionStripe = await stripe.checkout.sessions.retrieve(req.query.session_id,{
        // Pass the API key in the Authorization header
        apiKey: process.env.STRIPE_KEY,
    });
    //Check if session is paid
    if(sessionStripe.payment_status !== 'paid'){
        return next(new AppError('Session is not paid',400))
    }

    let depositmodel = await depositModel.findById(sessionStripe.client_reference_id);
    if(!depositmodel){
        return next(new AppError('Deposit not found',404))
    }

    if(depositmodel.status === 'successful'){
        return next(new AppError('Deposit already successful',400))
    }

    depositmodel.status = 'successful';

    let user = await userModel.findById(depositmodel.user);
    user.verified = true;
    //user.balance += depositmodel.amount;
    await user.save();
    await depositmodel.save();


    return res.status(200).json({ message: "success" })
})



const getDeposit = catchAsyncError(async (req, res, next) => {
    const { id } = req.params
    let result = await depositModel.findById(id)

    if(req.user.role !== 'admin'){
        if(result.user.toString() !== req.user._id.toString()){
            return next(new AppError('you are not authorized to access this route' ))
        }
    }

    !result && next(new AppError(`Deposit not found`), 404)
    result && res.status(200).json({ message: "success", result })
})

const getAllUserDeposits = catchAsyncError(async (req, res, next) => {
    let result = await depositModel.find({ user: req.user._id })
    if(result.length > 1){
        result.sort((a, b) => b.createdAt - a.createdAt)
    }
    res.status(200).json({ message: "success", result })
})



export{
    createDeposit,
    getDeposit,
    getAllUserDeposits,
    verifyDeposit
}