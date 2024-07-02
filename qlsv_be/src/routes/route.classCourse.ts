import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import {
  createClassCourse,
  getAddClassCourse,
  getAllClassCourse,
  getClassCourse,
  getOneClassCourse,
  updateClassCourse,
} from "../controllers/ClassCourseController";
export const courseClassRouters = express.Router();
courseClassRouters.use(bodyParser.urlencoded({ extended: false }));
courseClassRouters.get("/admin/classCourse_list", getAllClassCourse);
courseClassRouters.get("/admin/classCourse_add", getAddClassCourse);
courseClassRouters.get("/getScheduleClass/:id", getClassCourse);
courseClassRouters.get("/getClassCourse/:id",getOneClassCourse)
courseClassRouters.post("/classCourse_add", createClassCourse);
courseClassRouters.post("/classCourse_update/:id", updateClassCourse);