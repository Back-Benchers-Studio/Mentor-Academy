import express from 'express'
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js"
import * as auth from './auth.controller.js'
const authRouter = express.Router()


authRouter.post("/:userType/signup",auth.signupAll)
// authRouter.post('/signup',auth.signup)
// authRouter.post('/signup/educator',auth.signupEducator)
authRouter.post("/:userType/signIn",auth.signInAll)

authRouter.get("/checkEducator",protectedRoutes,auth.checkEducator)
authRouter.get("/checkAdmin",protectedRoutes,auth.checkAdmin)
authRouter.get("/checkUser",auth.checkUser)

authRouter
.route('/verifyPayment')
.get(auth.verifyPayment)


export default authRouter