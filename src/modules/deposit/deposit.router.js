
import express from "express"
import * as deposit from "./deposit.controller.js"
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js"



const depositRouter = express.Router()


depositRouter
    .route('/')
    .post(protectedRoutes,allowedTo('user'),deposit.createDeposit)
    .get(protectedRoutes,allowedTo('user'),deposit.getAllUserDeposits)
    

    depositRouter
    .route('/get/:id')
    .get(protectedRoutes,deposit.getDeposit)

    depositRouter
    .route('/verify')
    .get(deposit.verifyDeposit)


export default depositRouter


