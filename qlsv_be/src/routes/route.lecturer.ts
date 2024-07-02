import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { AppDataSource } from "../database/db";
import {
  createLecturer,
  getAddLecturer,
  getAllLecturer,
  getOneLecturer,
  updateLecturer,
} from "../controllers/LecturerController";
export const lecturerRouters = express.Router();
lecturerRouters.use(bodyParser.urlencoded({ extended: false }));
lecturerRouters.get("/admin/lecturer_list", getAllLecturer);
lecturerRouters.get("/getLecturer/:id", getOneLecturer);
lecturerRouters.get("/admin/lecturer_add", getAddLecturer);
lecturerRouters.post("/lecturer/add", createLecturer);
lecturerRouters.post("/lecturer/update/:id", updateLecturer);
