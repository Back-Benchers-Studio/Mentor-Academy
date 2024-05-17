
import express from "express"
import * as announcement from "./announcement.controller.js"
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js"

const announcementRouter = express.Router()




announcementRouter.route('/')
                  .post(protectedRoutes,allowedTo('admin','educator'),announcement.addAnnouncement)
                  .get(protectedRoutes,allowedTo('admin' , 'educator' ,'user'),announcement.getAnnouncements)

announcementRouter.route('/:id').
                     patch(protectedRoutes,allowedTo('admin','educator'),announcement.updateAnnouncement)
                    .delete(protectedRoutes,allowedTo('admin','educator'),announcement.deleteAnnouncement)
                    .get(protectedRoutes,allowedTo('admin' , 'educator' ,'user'),announcement.getAnnouncementByID)


export default announcementRouter


