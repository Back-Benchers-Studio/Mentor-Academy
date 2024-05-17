
import express from "express"
import * as user from "./admin.controller.js"
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js"

const adminRouter = express.Router()

adminRouter
    .route('/users')
    .get(protectedRoutes,allowedTo('admin'),user.getAllUsers)

adminRouter.post('/sendMail',protectedRoutes,allowedTo('admin'),user.sendMailtoAll) 
//adminRouter.post('/checkAdmin',protectedRoutes,allowedTo('admin'),user.checkAdmin) 

adminRouter
    .route('/educators')
    .get(protectedRoutes,user.getAllEducators)

adminRouter.get('/pendingEducatorFees',protectedRoutes,allowedTo('admin'),user.getPendingEducatorFees)

adminRouter.patch('/acceptEducatorFees/:educatorID',protectedRoutes,allowedTo('admin'),user.accpetPendingEducatrFees);

adminRouter
    .route('/user/:id')
    .get(protectedRoutes,user.getUser)

adminRouter
    .route('/educator/:id')
    .get(protectedRoutes,user.getEducator)

    
adminRouter.patch('/blockUser/:id',protectedRoutes,allowedTo('admin'),user.blockUser);
adminRouter.patch('/blockEducator/:id',protectedRoutes,allowedTo('admin'),user.blockEducator);



// adminRouter.patch('/banUser/:id',protectedRoutes, allowedTo('admin'), user.banUser)
// adminRouter.patch('/banEducator/:id',protectedRoutes, allowedTo('admin'), user.banEducator)
// adminRouter.patch('/unbanUser/:id', protectedRoutes, allowedTo('admin'), user.unbanUser)
// adminRouter.patch('/unbanEducator/:id', protectedRoutes, allowedTo('admin'), user.unbanEducator)
// adminRouter.patch('/changeUserPassword/:id', user.changeUserPassword)
// adminRouter.patch('/resetPassword/:token', user.resetPassword)


export default adminRouter


