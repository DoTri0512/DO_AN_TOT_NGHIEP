import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import {
  createMajor,
  getAddMajor,
  getAllMajor,
  getOneMajor,
  updateMajor,
} from "../controllers/MajorController";
export const majorRouter = express.Router();
majorRouter.use(bodyParser.urlencoded({ extended: false }));
majorRouter.get("/admin/major_list", getAllMajor);
majorRouter.get("/getMajor/:id", getOneMajor);
majorRouter.get("/admin/major_add", getAddMajor);
majorRouter.post("/major/add", createMajor);
majorRouter.post("/major/major_update/:id", updateMajor);
