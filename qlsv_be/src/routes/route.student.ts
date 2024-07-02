import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { AppDataSource } from "../database/db";
import {
  ChangePassword,
  createStudent,
  getAddStudent,
  getAllStudent,
  getChangePassword,
  getCommendStudent,
  getConductScoreStudent,
  getDetailStudent,
  getExamStudent,
  getGradeStudent,
  // getProgramEducation,
  getStudent,
  getStudentInfo,
  getSubjectStudent,
  getUserStudent,
  updateStudent,
} from "../controllers/StudentController";

import multer from "multer";
import path from "path";
var storage = multer.diskStorage({
  destination: "./public/image",
  filename: function (req, file, cb) {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});
var upload = multer({
  storage: storage,
});
export const studentRouters = express.Router();
studentRouters.use(bodyParser.urlencoded({ extended: false }));
studentRouters.get("/admin/student_list", getAllStudent);
studentRouters.get("/getStudent/:id", getStudent);
studentRouters.get("/admin/student_add", getAddStudent);
studentRouters.get("/admin/student_detail/:id", getDetailStudent);
studentRouters.post(
  "/student/add",
  upload.single("img_student"),
  createStudent
);
studentRouters.post(
  "/student/update/:id",
  upload.single("img_student"),
  updateStudent
);
studentRouters.get("/student/home", getUserStudent);
studentRouters.get("/student/info", getStudentInfo);
studentRouters.get("/student/enrollment", getSubjectStudent);
studentRouters.get("/student/exam", getExamStudent);
studentRouters.get("/student/grade", getGradeStudent);
studentRouters.get("/student/conduct", getConductScoreStudent);
studentRouters.get("/student/commend", getCommendStudent);
studentRouters.get("/student/change_password", getChangePassword);
studentRouters.post("/student/change_password", ChangePassword);
