
import express from "express"
import * as user from "./user.controller.js"
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js"



const userRouter = express.Router()

userRouter
    .route('/')
    .get(user.getAllUsers)

userRouter
    .route('/:id')
    .get(user.getUser)
    .patch(protectedRoutes,allowedTo('admin'),user.banUser)
    


userRouter.patch('/unbanUser/:id',protectedRoutes,allowedTo('admin'),user.unbanUser)
userRouter.patch('/changeUserPassword/:id',user.changeUserPassword)
userRouter.patch('/resetPassword/:token',user.resetPassword)


export default userRouter


