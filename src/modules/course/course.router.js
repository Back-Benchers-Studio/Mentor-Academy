
import express from "express"
import * as course from "./course.controller.js"
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js"
import  {uploadSingleFile} from '../../utils/fileUploading.js';

const courseRouter = express.Router()

courseRouter.route('/')
                  .post(protectedRoutes,allowedTo('admin'),uploadSingleFile('video','Courses'),course.addCourse)
                  .get(protectedRoutes,allowedTo('admin' , 'educator' ,'user'),course.getCourses)

                  courseRouter.route('/:id').
                     patch(protectedRoutes,allowedTo('educator'),course.updateAnnouncement)
                    .delete(protectedRoutes,allowedTo('educator'),course.deleteAnnouncement)
                    .get(protectedRoutes,allowedTo('admin' , 'educator' ,'user'),course.getAnnouncementByID)


export default courseRouter


