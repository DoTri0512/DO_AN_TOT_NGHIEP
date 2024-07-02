import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { AppDataSource } from "../database/db";
import {
  getAllCourses,
  createCourse,
  updateCourse,
  getOneCourse,
  getAddCourse,
} from "../controllers/CourseController";
export const courseRouters = express.Router();
courseRouters.use(bodyParser.urlencoded({ extended: false }));
courseRouters.get("/admin/course_list", getAllCourses);
courseRouters.get("/admin/course_add", getAddCourse);
courseRouters.get("/getCourse/:id", getOneCourse);
courseRouters.post("/course/add", createCourse);
courseRouters.post("/course/update/:id", updateCourse);
