
import express from "express"
import * as course from "./course.controller.js"
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js"
import { uploadSingleFile } from '../../utils/fileUploading.js';

const courseRouter = express.Router()

courseRouter.route('/')
    .post(protectedRoutes, allowedTo('admin'), uploadSingleFile('courseImage', 'Courses'), course.addCourse)
    .get(protectedRoutes, allowedTo('admin', 'educator', 'user'), course.getCourses)

courseRouter.route('/:courseID/buy')
    .patch(protectedRoutes, allowedTo('user'), course.createCheckOutSessionCourse)
courseRouter.route('/:id')
    //  patch(protectedRoutes,allowedTo('educator'),course.updateCourse)
    .delete(protectedRoutes, allowedTo('admin'), course.deleteCourse)
    .get(protectedRoutes, allowedTo('admin', 'educator'), course.getCourseByID)

courseRouter.route('/:courseID/view')
    .get(protectedRoutes, allowedTo('user'), course.viewCourse)

courseRouter.route('/:courseId/lessons')
    .post(protectedRoutes, allowedTo('admin'), uploadSingleFile('lessonVideo', 'Lessons'), course.addLessonToCourse)
    .get(protectedRoutes, allowedTo('admin', 'educator', 'user'), course.getCourseLessons)
export default courseRouter


