import express, { NextFunction } from "express";
import { Request, Response } from "express";
import { AppDataSource } from "./database/db";
import bodyParser from "body-parser";
import { userRouters } from "./routes/route.user";
import { courseRouters } from "./routes/route.course";
import { departmentRouter } from "./routes/route.department";
import jwt from "jsonwebtoken";
import cors from "cors";
import session from "express-session";
import { Users } from "./entities/User";
import { majorRouter } from "./routes/route.major";
import { classRouters } from "./routes/route.class";
import { studentRouters } from "./routes/route.student";
import { lecturerRouters } from "./routes/route.lecturer";
// import flash from "express-flash-message";
import flash from "connect-flash";
import { subjectRouters } from "./routes/route.subject";
import { enrollmentRouters } from "./routes/route.enrollment";
import { scheduleRouters } from "./routes/route.schedule";
import { examRouters } from "./routes/route.exam";
import { gradeRouters } from "./routes/route.grade";
import { conductRouters } from "./routes/route.conduct";
import { courseClassRouters } from "./routes/route.classCourse";

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
const port = 3000;
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());

AppDataSource.initialize()
  .then(() => {
    console.log("Connect !");
  })
  .catch((error) => console.log("Loi " + error));
app.set("view engine", "ejs");
app.set("views", "./src/views");
app.use("/", express.static("public"));
app.use(bodyParser.json());
app.set("trust proxy", 1);
app.use("/", userRouters);
app.get("/", (req, res) => {
  res.render("index", { messages: req.flash() });
});
// app.get("/admin/dashboard", (req, res) => {
//   const user_name = (req.session as any).user;
//   if (user_name) {
//     return res.render("admin/dashboard", {
//       user_name,
//       messages: req.flash(),
//     });
//   }
// });
app.use("/", courseRouters);
app.use("/", departmentRouter);
app.use("/", majorRouter);
app.use("/", classRouters);
app.use("/", studentRouters);
app.use("/", lecturerRouters);
app.use("/", subjectRouters);
app.use("/", enrollmentRouters);
app.use("/", scheduleRouters);
app.use("/", examRouters);
app.use("/", gradeRouters);
app.use("/", conductRouters);
app.use("/", courseClassRouters);
app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
