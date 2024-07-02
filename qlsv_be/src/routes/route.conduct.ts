import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { AppDataSource } from "../database/db";
import {
  createConductScore,
  getAddConductScore,
  getAllConductScore,
  getOneConductScore,
  updateConductScore,
} from "../controllers/ConductController";
export const conductRouters = express.Router();
conductRouters.use(bodyParser.urlencoded({ extended: false }));
conductRouters.get("/admin/conduct_list", getAllConductScore);
conductRouters.get("/admin/conduct_add", getAddConductScore);
conductRouters.get("/getConduct/:id", getOneConductScore);
conductRouters.post("/conduct_score/add", createConductScore);
conductRouters.post("/conduct_score/update/:id", updateConductScore);
