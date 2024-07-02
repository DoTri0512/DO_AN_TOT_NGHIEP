import { Request, Response } from "express";
import { Users } from "../entities/User";
import { AppDataSource } from "../database/db";
import bcrypt from "bcrypt";
import flash from "connect-flash";
import session from "express-session";
import { Departments } from "../entities/Department";
import { Majors } from "../entities/Major";
import { Classes } from "../entities/Class";
import { Subjects } from "../entities/Subject";
import { Lecturers } from "../entities/Lecturer";
import { Students } from "../entities/Student";
import { Rooms } from "../entities/Room";
import { Grades_Subjects } from "../entities/Grades_Subjects";
export const getAllUsers = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 6;
  const offset = (page - 1) * limit;
  const userRepository = await AppDataSource.getRepository(Users);
  const [users, count] = await userRepository.findAndCount({
    relations: ["student"],
    skip: offset,
    take: limit,
  });
  const totalPages = Math.ceil(count / limit);
  // res.json(users)
  const user_name = await (req.session as any).user;
  if (user_name) {
    res.render("admin/account/account_detail", {
      user_name,
      list: users,
      currentPage: page,
      totalPages,
      messages: req.flash(),
    });
  }
};
export const getOneUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const userRepository = await AppDataSource.getRepository(Users);
    const user = await userRepository.findOneBy({ id: id });
    const user_name = await (req.session as any).user;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user_name) {
      res.render("admin/account/account_update", {
        item: user,
        user_name,
        message: null,
        messages: req.flash(),
      });
    }
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ message: "Error getting user" });
  }
};

//form add
export const getAddUser = async (req: Request, res: Response) => {
  const user_name = await (req.session as any).user;
  if (user_name) {
    res.render("admin/account/account_add", {
      user_name,
      message: null,
      messages: req.flash(),
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { username, password, role } = req.body;
  try {
    const user_name = await (req.session as any).user.username;
    const userRepository = AppDataSource.getRepository(Users);
    // const users = await userRepository.find();
    const existingUser = await userRepository.findOne({ where: { username } });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const addUser = await AppDataSource.createQueryBuilder()
        .insert()
        .into(Users)
        .values({
          username: username,
          password: hashedPassword,
          role: role,
        })
        .execute();
      return res.redirect("/admin/account_detail");
    } else {
      req.flash("error", "Tài khoản đã tồn tại");
      res.redirect("/admin/account_detail");
    }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    // const id = (req.session as any).user.id;

    const userRepository = await AppDataSource.getRepository(Users);
    const user = await userRepository.findOne({
      where: { username },
      relations: ["student"],
    });
    if (!user) {
      req.flash("error", "Username k ton tai");
      return res.redirect("/");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    // console.log(isPasswordValid);

    if (!isPasswordValid) {
      req.flash("error", "Username hoac password k chinh xac");
      return res.redirect("/");
    }
    (req.session as any).user = {
      username: user.username,
      id: user.id,
      student: user.student,
      // student_department:user.student.department
    };
    if (user.role === 0) {
      req.flash("success", "Login thành công !");
      res.redirect("/admin/dashboard");
    } else if (user.role === 1) {
      req.flash("success", "Login thành công !");
      res.redirect("/student/home");
    }
  } catch (error) {
    res.status(500).json({ message: "An error occurred" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { username } = req.body;
  const { id } = req.params;
  try {
    const courseRepository = await AppDataSource.getRepository(Users);
    const existingUsername = await courseRepository
      .createQueryBuilder("users")
      .where("users.username = :username", {
        username,
      })
      .getOne();
    if (existingUsername) {
      return res.status(400).json({ message: "Username đã tồn tại" });
    } else {
      const updateCourse = await AppDataSource.createQueryBuilder()
        .update(Users)
        .set({ username: username })
        .where("id = :id", { id: id })
        .execute();
      res.status(200).send("Update thanh cong");
    }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};

export const getHome = async (req: Request, res: Response) => {
  const user_name = (req.session as any).user;
  //Thống kê thông tin trường học
  const departments = await AppDataSource.getRepository(Departments)
    .createQueryBuilder("departments")
    .getCount();
  const majors = await AppDataSource.getRepository(Majors)
    .createQueryBuilder("majors")
    .getCount();
  const classes = await AppDataSource.getRepository(Classes)
    .createQueryBuilder("classes")
    .getCount();
  const subjects = await AppDataSource.getRepository(Subjects)
    .createQueryBuilder("subjects")
    .getCount();
  const lecturers = await AppDataSource.getRepository(Lecturers)
    .createQueryBuilder("lecturers")
    .getCount();
  const students = await AppDataSource.getRepository(Students)
    .createQueryBuilder("students")
    .getCount();
  const rooms = await AppDataSource.getRepository(Rooms)
    .createQueryBuilder("rooms")
    .getCount();

  const studentGradeAverage = await AppDataSource.getRepository(Grades_Subjects)
    .createQueryBuilder("grades_subjects")
    .leftJoinAndSelect("grades_subjects.student", "student")
    .groupBy("student.id")
    .select([
      "student.id as studentId",
      "student.fullName as studentName",
      "AVG(CASE WHEN grades_subjects.exam_score >= 8.5 THEN 4  WHEN grades_subjects.exam_score >= 7 THEN 3 WHEN grades_subjects.exam_score >= 5.5 THEN 2  WHEN grades_subjects.exam_score >= 4 THEN 1    ELSE 0 END) as averageGrade",
    ])
    .getRawMany();
  var excellentCount = 0;
  var goodCount = 0;
  var normalCount = 0;
  // const gpaNumber = parseFloat(gpa);
  studentGradeAverage.forEach((student) => {
    if (student.averageGrade >= 3.6) {
      excellentCount++;
    } else if (student.averageGrade >= 3.2) {
      goodCount++;
    } else if (student.averageGrade >= 2.5) {
      normalCount++;
    }
  });
  if (user_name) {
    return res.render("admin/dashboard", {
      user_name,
      messages: req.flash(),
      department: departments,
      major: majors,
      classes: classes,
      subject: subjects,
      lecturer: lecturers,
      student: students,
      room: rooms,
      excellent: excellentCount,
      good: goodCount,
      normal: normalCount,
    });
  }
};

function convertGradeExam(grade: number) {
  if (grade >= 8.5) {
    return 4;
  } else if (grade >= 7) {
    return 3;
  } else if (grade >= 5.5) {
    return 2;
  } else if (grade >= 4) {
    return 1;
  } else {
    return 0;
  }
}

//Hàm tính điểm trung bình
function calculateGPA(
  grades: { subjectName: string; grade: number; credits: number }[]
): number {
  const totalCredits = grades.reduce((acc, curr) => acc + curr.credits, 0);
  const totalQualityPoints = grades.reduce(
    (acc, curr) => acc + curr.grade * curr.credits,
    0
  );
  if (totalCredits === 0) {
    return 0;
  }
  return totalQualityPoints / totalCredits;
}
