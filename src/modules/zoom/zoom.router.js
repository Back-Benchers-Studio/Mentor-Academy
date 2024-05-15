
import express from "express"
import * as zoom from "./zoom.controller.js"
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js"

const zoomRouter = express.Router()

zoomRouter
    .route('/createMeeting')
    .post(protectedRoutes,allowedTo('educator'),zoom.createZoomMeeting)

    zoomRouter
    .route('/meetings')
    .get(protectedRoutes,allowedTo('educator'),zoom.getZoomMeetings)

export default zoomRouter


