import jwt from "jsonwebtoken"
import { userModel } from "../../../Database/models/User.model.js";
import { AppError } from "../../utils/AppError.js";
import bcrypt from 'bcrypt'
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { educatorModel } from "../../../Database/models/Educator.model.js";
import { adminModel } from "../../../Database/models/Admin.model.js";
import { sendEmail } from '../../utils/sendEmail.js';
import Stripe from 'stripe';
import { walletModel } from "../../../Database/models/Wallet.model.js";
const stripe = new Stripe(`${process.env.STRIPE_KEY}`);

export const verifyPayment = catchAsyncError(async (req, res, next) => {
    let sessionStripe = await stripe.checkout.sessions.retrieve(req.query.session_id, {
        // Pass the API key in the Authorization header
        apiKey: process.env.STRIPE_KEY,
    });
    console.log(sessionStripe)
    //Check if session is paid
    if (sessionStripe.payment_status !== 'paid') {
        return next(new AppError('Session is not paid', 400))
    }
    const user = await userModel.findById(sessionStripe.client_reference_id);
    console.log(user)
    if (!user) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    user.paymentStatus = 'completed';
    user.verified = true;
    await user.save().then(async (user) => {
        let educator = await educatorModel.findOne({ educator_id: user.educator });
        if (!educator) {
            return next(new AppError('Educator not found', 404));
        }
        // Create a wallet with commition 10 $ (@todo will change) for the educator and link it to the educator
        let wallet = new walletModel({ educator: educator._id, balance: 10 });
        await wallet.save();
        // Link the wallet to the educator
        await educatorModel.findByIdAndUpdate(
            educator._id,
            { wallet: wallet._id },
            { new: true }
        );
    })
    return res.status(200).json({ message: "success" })
})

export const checkEducator = catchAsyncError(async (req, res, next) => {
    const educatorId = req.user._id; 
    // Check if the user is an educator
    const educator = await educatorModel.findById(educatorId);
    if (!educator) {
      return res.status(401).json({ message: 'This is not an educator' });
    }
    else{
        res.status(200).json({ Educator: educator });
    }
  });

  export const checkAdmin = catchAsyncError(async (req, res, next) => {
    const adminId = req.user._id; 
    // Check if the user is an admin
    const admin = await adminModel.findById(adminId);
    if (!admin) {
      return res.status(401).json({ message: 'This is not an admin' });
    }
    else{
        res.status(200).json({ Admin: admin });
    }
  });
  export const checkUser = catchAsyncError(async (req, res, next) => {
    const userId = req.user._id; 
    // Check if the user is a usual user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'This is not usual user' });
    }
    else{
        res.status(200).json({ User: user });
    }
  });

// Sign Up
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
            // let savedUser = {};
            await newUser.save();

            const admins = await adminModel.find();
            for (const admin of admins) {

                    let adminEmail = admin.email;
                    const html = `<h1>New User Registeration with Email ${newUser.email}</h1>`;
                    const subject = `New User Registeration`
                   await sendEmail(adminEmail, html, subject)

            }

            // Create a checkout session using the Stripe API
            let session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            unit_amount: 100 * 100,
                            product_data: {
                                name: newUser.name,
                            },
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: 'http://localhost:7000/api/v1/auth/verifyPayment?session_id={CHECKOUT_SESSION_ID}',
                // cancel_url: 'http://localhost:7000/payment/cancel',
                customer_email: newUser.email,
                client_reference_id: newUser._id.toString(), // Pass the user ID as reference
            }, {
                // Pass the API key in the Authorization header
                apiKey: process.env.STRIPE_KEY,
            })

            // Save the session ID and user ID in the database
            newUser.paymentSessionId = session.id;
            await newUser.save();

            // const html = `<a href = "${session}">Click Here To Complete Payment Step</a?`;
            // sendEmail(newUser.email, html, "Mentor Academy Registeration Payment Step")
            res.status(200).json({ User: newUser, PaymentURL: session.url, message: "Sign Up Successfully...plz Complete Payment Step to be verified..." });
        }
        else if (userType === 'educator') {
            let newEducator = new newModel(req.body);
            await newEducator.save();
            const admins = await adminModel.find();
            for (const admin of admins) {
                let adminEmail = admin.email;
                const html = `<h1>New Educator Registeration with Email ${newEducator.email}</h1>`;
                const subject = `New Educator Registeration`
               await sendEmail(adminEmail, html, subject)

            }
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
    const { email, password } = req.body
    console.log('fortest',req)
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
    console.log({ userInfo: user })
    if (userType === 'user') {
        // console.log({user:!user})
        // console.log({userPassBody:password})
        //console.log({userPassBodyEnc:bcrypt.hashSync(password,7)})
        //console.log({userPass:user.password})
        //console.log({userPassBody:req.body.password})
        console.log({password:!(await bcrypt.compare(password, user.password))})
        if (!user || (await bcrypt.compare(req.body.password, user.password))) {
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
        let token = jwt.sign({ name: user.name, userId: user._id, type: userType }, process.env.JWT_KEY);
        res.status(200).json({ token })
    }else{
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
        let token = jwt.sign({ name: user.name, userId: user._id, type: userType }, process.env.JWT_KEY);
        res.status(200).json({ token })
    }
})

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

export function allowedTo(...roles) {
    return catchAsyncError(async (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('you are not authorized to access this route. u are ' + req.user.role))
        }
        next()
    })
}


