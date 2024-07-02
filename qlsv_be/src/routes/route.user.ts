import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { AppDataSource } from "../database/db";
import {
  getAllUsers,
  createUser,
  loginUser,
  updateUser,
  getOneUser,
  getAddUser,
  getHome,
} from "../controllers/UserController";

export const userRouters = express.Router();
userRouters.use(bodyParser.urlencoded({ extended: false }));
userRouters.get("/admin/account_detail", getAllUsers);
userRouters.get("/admin/dashboard",getHome)
userRouters.get("/admin/account_add", getAddUser);
userRouters.get("/user/:id", getOneUser);
userRouters.post("/register", createUser);
userRouters.post("/login", loginUser);
userRouters.put("/user/update/:id", updateUser);
