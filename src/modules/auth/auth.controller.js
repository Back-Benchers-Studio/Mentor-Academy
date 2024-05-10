import jwt from "jsonwebtoken"
import { userModel } from "../../../Database/models/User.model.js";
import { AppError } from "../../utils/AppError.js";
import bcrypt from 'bcrypt'
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { educatorModel } from "../../../Database/models/Educator.model.js";
import { adminModel } from "../../../Database/models/Admin.model.js";
import { sendEmail } from '../../utils/sendEmail.js';
import Stripe from 'stripe';
import { depositModel } from "../../../Database/models/Deposit.model.js";
import { walletModel } from "../../../Database/models/Wallet.model.js";
const stripe = new Stripe(`${process.env.STRIPE_KEY}`);

export const signupAll = catchAsyncError(async (req, res, next) => {
    let { userType } = req.params;
    let user;
    let newModel;
    if (userType !== 'admin' && userType !== 'user' && userType !== 'educator') {
        return next(new AppError("Invalid user type"));
    }
    else {
        if (userType === 'admin') {
            newModel = adminModel;
        } else if (userType === 'user') {
            newModel = userModel;
        } else if (userType === 'educator') {
            newModel = educatorModel;
        }
    }
    user = await newModel.findOne({ email: req.body.email });
    if (!user) {
        if (userType === 'admin') {
            // Create a new doctor instance
            let newAdmin = new newModel(req.body);
            await newAdmin.save();

            res.status(200).json({ Admin: newAdmin, message: "Sign Up Successful..." });
        }
        else if (userType === 'user') {
  let educatorIsFound;
            if (req.body.educator) {
                // Check if the educator exists
                 educatorIsFound = await educatorModel.findOne({ educator_id: req.body.educator });
                if (!educatorIsFound) {
                    return next(new AppError('Educator not found', 404));
                }
            }
            let newUser = new newModel(req.body);


            // Create a wallet for the educator and link it to the educator
            const wallet = new walletModel({ educator: educatorIsFound._id });
            await wallet.save();

            // Link the wallet to the educator
            const educator = await educatorModel.findByIdAndUpdate(
                educatorIsFound._id,
                { wallet: wallet._id },
                { new: true }
            );

            let savedUser = {};
            await newUser.save().then((user) => {
                savedUser = user
                console.log(savedUser);

            })
            // await newUser.save();

            // const admins = await adminModel.find();
            // for (const admin of admins) {

            //         let adminEmail = admin.email;
            //         const html = `<h1>New User Registeration with Email ${newUser.email}</h1>`;
            //         const subject = `New User Registeration`
            //         sendEmail(adminEmail, html, subject)

            // }

            const deposit = new depositModel({
                user: savedUser._id,
                amount: 100,
            })

            let depositID = null;
            await deposit.save().then((dep) => {
                depositID = dep._id.toString();

            })
            if (!deposit) {
                return next(new AppError('error in deposit id', 404))
            }

            let session = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            unit_amount: Math.round(1000),
                            product_data: {
                                name: newUser.name
                            }
                        },
                        quantity: 1
                    }
                ],
                mode: 'payment',
               // success_url: "https://google.com",
                 success_url: "http://localhost:7000/api/v1/deposits/verify?session_id={CHECKOUT_SESSION_ID}",//@todo will change
                customer_email: newUser.email,
                client_reference_id: depositID,

            }, {
                // Pass the API key in the Authorization header
                apiKey: process.env.STRIPE_KEY,
            })

            if (!session) {
                return next(new AppError('Error Creating Session', 404));
            }

            deposit.session_id = session.id;
            deposit.payment_url = session.url;
            deposit.expires_at = session.expires_at;
            await deposit.save();
            console.log(session)

            // res.json({ message: "success", session })

            // const html = `<a href = "${session}">Click Here To Complete Payment Step</a?`;
            // sendEmail(newUser.email, html, "Mentor Academy Registeration Payment Step")
            res.status(200).json({ User: newUser, PaymentURL: session, message: "Sign Up Successfully...plz Complete Payment Step to be verified..." });
        }
        else if (userType === 'educator') {
            let newEducator = new newModel(req.body);
            await newEducator.save();
            // const admins = await adminModel.find();
            // for (const admin of admins) {
            //     let adminEmail = admin.email;
            //     const html = `<h1>New Educator Registeration with Email ${newEducator.email}</h1>`;
            //     const subject = `New Educator Registeration`
            //     sendEmail(adminEmail, html, subject)
                
            // }
            res.status(200).json({ Educator: newEducator, message: "Sign Up Successfully...." });
        }
    }
    else {
        return next(new AppError(`Email Already Exist`, 400));
    }
})

// Sign In
export const signInAll = catchAsyncError(async (req, res, next) => {
    let { userType } = req.params;
    let user;
    let newModel;
    if (userType !== 'admin' && userType !== 'user' && userType !== 'educator') {
        return next(new AppError("Invalid user type"));
    }
    else {
        if (userType === 'admin') {
            newModel = adminModel;
        } else if (userType === 'user') {
            newModel = userModel;
        } else if (userType === 'educator') {
            newModel = educatorModel;
        }
    }
    user = await newModel.findOne({ email: req.body.email });

    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
        return next(new AppError(`Incorrect Email or Password`, 400));
    } else if ((!user.verified || user.isBlocked) && userType === 'user') {
        if (user.isBlocked) {
            return next(new AppError(`Your Email has Been Blocked We Will Contact You SOON...`, 400));
        }
        return next(new AppError(`Please  Complete Payment Step First ...`, 400));
    } else if (user.isBlocked && userType === 'educator') {
        if (user.isBlocked) {
            return next(new AppError(`Your Email has Been Blocked We Will Contact You SOON...`, 400));
        }
    }
    // else if (!user.verified && userType ==='admin'){
    //     return next(new AppError(`Your Account is not verified...`, 400));
    // }
    let token = jwt.sign({ name: user.name, userId: user._id, type: userType }, process.env.JWT_KEY);
    res.status(200).json({ token })
})



// export const signup = catchAsyncError(async (req, res, next) => {
//     // const { educator, name, email, password } = req.body;

//     if (req.body.educator) {
//         // Check if the educator exists
//         const educatorIsFound = await educatorModel.findOne({ educator_id: req.body.educator });
//         if (!educatorIsFound) {
//             return next(new AppError('Educator not found', 404));
//         }

//         // Check if the email already exists
//         const existingUser = await userModel.findOne({ email: req.body.email });
//         if (existingUser) return next(new AppError('Email already exists', 409))
//         let user = new userModel(req.body)
//         await user.save()
//         res.json({ message: "success", user, educatorIsFound })
//     }
//     else {
//         // Check if the email already exists
//         const existingUser = await userModel.findOne({ email: req.body.email });
//         if (existingUser) return next(new AppError('Email already exists', 409))
//         // let isFound = await userModel.findOne({ email: req.body.email })
//         // if (isFound) return next(new AppError('email already exists', 409))
//         let user = new userModel(req.body)
//         await user.save()
//         res.json({ message: "success", user })
//     }

// })

// export const signupEducator = catchAsyncError(async (req, res, next) => {
//     let isFound = await educatorModel.findOne({ email: req.body.email })
//     if (isFound) return next(new AppError('email already exists', 409))
//     let educator = new educatorModel(req.body)
//     await educator.save()
//     res.json({ message: "success", educator })
// })



// export const signIn = catchAsyncError(async (req, res, next) => {
//     const { email, password } = req.body
//     let isFound = await userModel.findOne({ email })
//     if (!isFound) return next(new AppError('incorrect email or password', 401))
//     const match = await bcrypt.compare(password, isFound.password);
//     if (isFound && match) {
//         let token = jwt.sign({ name: isFound.name, userId: isFound._id, role: isFound.role }, process.env.JWT_KEY)
//         return res.json({ message: "success", token })
//     }
//     next(new AppError('incorrect email or password', 401))
// })



export const protectedRoutes = catchAsyncError(async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
      return next(new AppError('Token not provided', 401));
    }
  
    let decoded;
    try {
      decoded = await jwt.verify(token, process.env.JWT_KEY);
    } catch (err) {
      return next(new AppError('Invalid token', 401));
    }
  
    let user;
    let model;

    const models = {
      userModel,
      educatorModel,
      adminModel
    };
  
    for (const modelName in models) {
      const Model = models[modelName];
      user = await Model.findById(decoded.userId);
      if (user) {
        model = Model;
        break;
      }
    }
    if (!user) {
      return next(new AppError('User not found', 401));
    }
    if (user.passwordChangedAt) {
      const changePasswordDate = parseInt(user.passwordChangedAt.getTime() / 1000);
      if (changePasswordDate > decoded.iat) {
        return next(new AppError('Password changed', 401));
      }
    }
    req.user = user;
    //req.model = model; 
    next();
  });
// export const protectedRoutes = catchAsyncError(async (req, res, next) => {
//     let { token } = req.headers
//     if (!token) return next(new AppError('token not provided', 401))

//     let decoded = await jwt.verify(token, process.env.JWT_KEY)

//     let user = await userModel.findById(decoded.userId)
//     if (!user) return next(new AppError('user not found', 401))

//     if (user.passwordChangedAt) {
//         let changePasswordDate = parseInt(user.passwordChangedAt.getTime() / 1000)
//         if (changePasswordDate > decoded.iat) return next(new AppError('password changed', 401))
//     }

//     req.user = user
//     next()
// })

// to handle Authorization

export function allowedTo(...roles) {
    return catchAsyncError(async (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('you are not authorized to access this route. u are ' + req.user.role))
        }
        next()
    })
}


