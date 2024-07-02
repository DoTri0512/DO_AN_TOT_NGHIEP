import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { AppDataSource } from "../database/db";
import {
  createExamStudent,
  createExamSubject,
  getAddExam,
  getAllExam,
  getDetailAddExam,
  getDetailExamStudent,
  getExamsStudents,
  getOneExam,
  updateExamStudent,
  updateExamSubject,
} from "../controllers/ExamController";
// import { getExamStudent } from "../controllers/StudentController";
export const examRouters = express.Router();
examRouters.use(bodyParser.urlencoded({ extended: false }));
examRouters.get("/admin/exam_list", getAllExam);
examRouters.get("/admin/exam_add", getAddExam);
examRouters.get("/admin/exam_add_student/:id", getDetailAddExam);
examRouters.get("/admin/exam_detail_student/:id", getDetailExamStudent);
examRouters.get("/getExamDetail/:id", getExamsStudents);
examRouters.get("/getOneExam/:id", getOneExam);
examRouters.post("/exam/add", createExamSubject);
examRouters.post("/exam/update/:id", updateExamSubject);
examRouters.post("/exam/exam_add_student/:id", createExamStudent);
examRouters.post("/exam/exam_update_student/:id", updateExamStudent);
