import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { AppDataSource } from "../database/db";
import {
  createClass,
  exportStudents,
  getAddClass,
  getAllClasses,
  getDetailClass,
  getOneClass,
  updateClass,
} from "../controllers/ClassController";
export const classRouters = express.Router();
classRouters.use(bodyParser.urlencoded({ extended: false }));
classRouters.get("/admin/class_list", getAllClasses);
classRouters.get("/admin/class_add", getAddClass);
classRouters.get("/getClass/:id", getOneClass);
classRouters.get("/admin/class_detail/:id", getDetailClass);
classRouters.post("/class/add", createClass);
classRouters.post("/class/update/:id", updateClass);
classRouters.get("/export-students/:id", exportStudents);
