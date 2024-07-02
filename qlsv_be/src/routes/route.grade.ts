import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { AppDataSource } from "../database/db";
import {
  createGradeExam,
  getAddGradeExam,
  getAllGrades,
  getOneGradeExam,
  updateGradeExam,
} from "../controllers/GradeController";
export const gradeRouters = express.Router();
gradeRouters.use(bodyParser.urlencoded({ extended: false }));
gradeRouters.get("/admin/grade_list", getAllGrades);
gradeRouters.get("/admin/grade_add", getAddGradeExam);
gradeRouters.get("/getOneGrade/:id", getOneGradeExam);
gradeRouters.post("/grade_exam/add", createGradeExam);
gradeRouters.post("/grade_exam/update/:id", updateGradeExam);
