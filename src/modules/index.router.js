import { globalErrorHandling } from "../middleware/globalErrorHandling.js"
import { AppError } from "../utils/AppError.js"
import authRouter from "./auth/auth.router.js"
import userRouter from "./user/user.router.js"
import depositRouter from "./deposit/deposit.router.js"
import adminRouter from "./admin/admin.router.js"
import announcementRouter from "./announcement/announcement.router.js"
import courseRouter from "./course/course.router.js"
import walletRouter from "./wallet/wallet.router.js"
export function init(app) {
  
    app.use('/api/v1/auth', authRouter)
    app.use('/api/v1', adminRouter)
    app.use('/api/v1/announcement',announcementRouter)
    app.use('/api/v1/course',courseRouter)
    app.use('/api/v1/users', userRouter)
    app.use('/api/v1/deposits', depositRouter)
    app.use('/api/v1/wallet', walletRouter)
  

    app.all('*', (req, res, next) => {
        next(new AppError(`can't find this route: ${req.originalUrl}`), 404)
    })
    //global error handling middleware
    app.use(globalErrorHandling)
}