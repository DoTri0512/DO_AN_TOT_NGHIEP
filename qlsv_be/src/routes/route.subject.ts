import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { AppDataSource } from "../database/db";
import {
  createSubject,
  createSubjectDepartment,
  getAddSubject,
  getAddSubjectDepartment,
  getAllSubject,
  getDetailSubject,
  getSubject,
  // searchSubject,
  updateSubject,
} from "../controllers/SubjectController";
export const subjectRouters = express.Router();
subjectRouters.use(bodyParser.urlencoded({ extended: false }));
// subjectRouters.get("/searchSubject", searchSubject);
subjectRouters.get("/admin/subject_list", getAllSubject);
subjectRouters.get("/getSubject/:id", getSubject);
subjectRouters.get("/admin/subject_add", getAddSubject);
subjectRouters.get("/admin/subject_detail/:id", getDetailSubject);
subjectRouters.get("/getSubjectAddDepartment/:id", getAddSubjectDepartment);
subjectRouters.post("/subject/add", createSubject);
subjectRouters.post("/subject/update/:id", updateSubject);
subjectRouters.post("/subject_department/add/:id", createSubjectDepartment);
