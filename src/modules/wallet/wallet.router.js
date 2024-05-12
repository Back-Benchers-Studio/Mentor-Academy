
import express from "express"
import * as wallet from "./wallet.controller.js"
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js"



const walletRouter = express.Router()


// walletRouter
//     .route('/')
//     .post(protectedRoutes,allowedTo('user'),wallet.createwallet)
//     .get(protectedRoutes,allowedTo('user'),wallet.getAllUserwallets)
    

    walletRouter
    .route('/')
    .get(protectedRoutes,wallet.getWallet)

    walletRouter
    .route('/request')
    .post(protectedRoutes,allowedTo('educator'),wallet.requestEducatorFees)


export default walletRouter


