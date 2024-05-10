import express from 'express'
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js"
import * as auth from './auth.controller.js'
const authRouter = express.Router()


authRouter.post("/:userType/signup",auth.signupAll)
// authRouter.post('/signup',auth.signup)
// authRouter.post('/signup/educator',auth.signupEducator)
authRouter.post("/:userType/signIn",auth.signInAll)


export default authRouter