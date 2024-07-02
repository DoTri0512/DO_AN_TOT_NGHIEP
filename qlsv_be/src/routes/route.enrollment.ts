import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { AppDataSource } from "../database/db";
import {
  createEnrollments,
  getAddEnrollment,
  getAllEnrollment,
  getOneEnrollment,
} from "../controllers/EnrollmentController";
export const enrollmentRouters = express.Router();
enrollmentRouters.use(bodyParser.urlencoded({ extended: false }));
enrollmentRouters.get("/admin/enrollment_list", getAllEnrollment);
enrollmentRouters.get("/admin/enrollment_add", getAddEnrollment);
enrollmentRouters.get("/getEnrollment/:id", getOneEnrollment);
enrollmentRouters.post("/enrollment/add", createEnrollments);
