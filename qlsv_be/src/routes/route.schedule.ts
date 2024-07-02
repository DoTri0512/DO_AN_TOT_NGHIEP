import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { AppDataSource } from "../database/db";
import {
  createSchedule,
  createScheduleSubject,
  getAddSchedule,
  getAddScheduleSubject,
  getAllSchedule,
  getDetailSchedule,
  getOneSchedule,
  updateSchedule,
} from "../controllers/ScheduleController";
export const scheduleRouters = express.Router();
scheduleRouters.use(bodyParser.urlencoded({ extended: false }));
scheduleRouters.get("/admin/schedule_list", getAllSchedule);
scheduleRouters.get("/admin/schedule_add", getAddSchedule);
scheduleRouters.get("/getSchedule/:id", getOneSchedule);
scheduleRouters.post("/schedule/add", createSchedule);
scheduleRouters.post("/schedule/update/:id", updateSchedule);
scheduleRouters.get(
  "/schedule/schedule_addSSubject/:id",
  getAddScheduleSubject
);
scheduleRouters.post("/schedule/addSubject/:id", createScheduleSubject);
scheduleRouters.get("/scheduleDetail/:id", getDetailSchedule);
