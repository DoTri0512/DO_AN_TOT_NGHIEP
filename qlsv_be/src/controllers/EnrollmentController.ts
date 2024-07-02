import { Request, Response } from "express";
import { Departments } from "../entities/Department";
import { AppDataSource } from "../database/db";
import { Students } from "../entities/Student";
import { Subjects } from "../entities/Subject";
import { Enrollments } from "../entities/Enrollment";
import moment from "moment";
import { Schedules } from "../entities/Schedule";
import { Class_Course } from "../entities/Class_Course";

export const getAllEnrollment = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 6;
  const offset = (page - 1) * limit;
  const user_name = await (req.session as any).user;
  const enrollmentRepository = await AppDataSource.getRepository(Enrollments);

  const [items, count] = await enrollmentRepository.findAndCount({
    relations: ["student", "class_course", "class_course.subject"],
    skip: offset,
    take: limit,
  });

  const totalPages = Math.ceil(count / limit);
  if (user_name) {
    res.render("admin/enrollment/enrollment_list", {
      list: items,
      user_name,
      success: null,
      messages: req.flash(),
      moment,
      currentPage: page,
      totalPages,
    });
  }
};
export const getAddEnrollment = async (req: Request, res: Response) => {
  const user_name = await (req.session as any).user;
  const schedule = await AppDataSource.getRepository(Class_Course).find();
  if (user_name) {
    res.render("admin/enrollment/enrollment_add", {
      user_name,
      success: null,
      messages: req.flash(),
      list: schedule,
    });
  }
};
export const getOneEnrollment = async (req: Request, res: Response) => {
  const user_name = await (req.session as any).user;
  const id = parseInt(req.params.id, 10);
  // const { id } = req.params;
  const class_course = await AppDataSource.getRepository(Class_Course).find();
  const item = await AppDataSource.getRepository(Enrollments)
    .createQueryBuilder("enrollments")
    .leftJoinAndSelect("enrollments.student", "student_id")
    .leftJoinAndSelect("enrollments.class_course", "classCourse_id")
    .where("enrollments.id = :id", { id: id })
    .getOne();
  if (user_name) {
    res.render("admin/enrollment/enrollment_update", {
      user_name,
      success: null,
      messages: req.flash(),
      class_course: class_course,
      item: item,
    });
  }
};
export const createEnrollments = async (req: Request, res: Response) => {
  const { id, student_id, enrollment_date, classCourse_id } = req.body;
  try {
    const studentRepository = await AppDataSource.getRepository(Students);
    const existingStudentID = await studentRepository
      .createQueryBuilder("students")
      .where("students.id = :id", {
        id: student_id,
      })
      .getOne();
    if (student_id === "") {
      req.flash("error", "Yêu cầu nhập đầy đủ thông tin");
      return res.redirect("/admin/enrollment_add");
    } else if (!existingStudentID) {
      req.flash("error", "Sinh viên không tồn tại");
      return res.redirect("/admin/enrollment_add");
    } else {
      const addEnrollment = await AppDataSource.createQueryBuilder()
        .insert()
        .into(Enrollments)
        .values({
          student: student_id,
          // enrollment_date: enrollment_date,
          class_course: classCourse_id,
          // startDate: startDate,
          // endDate: endDate,
        })
        .execute();
      req.flash("success", "Đăng ký môn học thành công");
      return res.redirect("/admin/enrollment_list");
    }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};
