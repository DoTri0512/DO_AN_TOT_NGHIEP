import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import {
  getAllDepartment,
  createDepartment,
  getOneDepartment,
  getAddDepartment,
  updateDepartment,
  getDetailDepartment,
} from "../controllers/DepartmentController";
export const departmentRouter = express.Router();
departmentRouter.use(bodyParser.urlencoded({ extended: false }));
departmentRouter.get("/admin/department_list", getAllDepartment);
departmentRouter.get("/getDepartment/:id", getOneDepartment);
departmentRouter.get("/getDetailDepartment/:id", getDetailDepartment);
departmentRouter.get("/admin/department_add", getAddDepartment);
departmentRouter.post("/department/add", createDepartment);
departmentRouter.post("/department/update/:id", updateDepartment);
