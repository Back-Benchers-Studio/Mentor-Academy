
import express from "express"
import * as user from "./user.controller.js"
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js"



const userRouter = express.Router()



userRouter
    .route('/:id')
    .get(user.getUser)

    

userRouter.patch('/updateProfile',protectedRoutes,allowedTo('user'),user.updateUserProfile)
userRouter.patch('/changeUserPassword/:id',user.changeUserPassword)
userRouter.patch('/resetPassword/:token',user.resetPassword)


export default userRouter


