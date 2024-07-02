import { Request, Response } from "express";
import { AppDataSource } from "../database/db";
import { Subjects } from "../entities/Subject";
import { Students } from "../entities/Student";
import { Grades_Subjects } from "../entities/Grades_Subjects";
import { Conduct_Scores } from "../entities/Conduct_Scores";
import { Exams } from "../entities/Exam";
import { ExamStudent } from "../entities/ExamStudent";

export const getAllGrades = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 6;
  const offset = (page - 1) * limit;
  const [items, count] = await AppDataSource.getRepository(
    Grades_Subjects
  ).findAndCount({
    relations: [
      "student",
      "subject",
      "student.classes",
      "student.major",
      "student.department",
    ],
    skip: offset,
    take: limit,
  });
  const totalPages = Math.ceil(count / limit);
  const user = await (req.session as any).user;
  if (user) {
    console.log(items);
    res.render("admin/grade/grade_list", {
      list: items,
      user,
      messages: req.flash(),
      currentPage: page,
      totalPages,
    });
  }
};

export const getOneGradeExam = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const user = await (req.session as any).user;
  const item = await AppDataSource.getRepository(Grades_Subjects)
    .createQueryBuilder("grades_subjects")
    .leftJoinAndSelect("grades_subjects.student", "student_id")
    .leftJoinAndSelect("grades_subjects.subject", "subject_id")
    .where("grades_subjects.id = :id", { id: id })
    .getOne();
  const subjects = await AppDataSource.getRepository(Subjects).find();
  // const students = await AppDataSource.getRepository(Students).find()
  if (user) {
    // console.log(item);
    res.render("admin/grade/grade_update", {
      list_subject: subjects,
      user,
      messages: req.flash(),
      item: item,
    });
  }
};

export const getAddGradeExam = async (req: Request, res: Response) => {
  const user = await (req.session as any).user;
  const subjects = await AppDataSource.getRepository(Subjects).find();
  // const students = await AppDataSource.getRepository(Students).find()
  if (user) {
    res.render("admin/grade/grade_add", {
      list_subject: subjects,
      user,
      messages: req.flash(),
    });
  }
};

export const createGradeExam = async (req: Request, res: Response) => {
  const { student_id, subject_id, exam_score } = req.body;
  try {
    const students = await AppDataSource.getRepository(Students)
      .createQueryBuilder("students")
      .where("students.id = :id", { id: student_id })
      .getOne();
    const checkExamStudent = await AppDataSource.getRepository(ExamStudent)
      .createQueryBuilder("exam_student")
      .leftJoinAndSelect("exam_student.student", "student")
      .leftJoinAndSelect("exam_student.exam", "exam")
      .where("exam_student.student = :student_id", { student_id })
      .andWhere("exam.subject = :subject_id", { subject_id })
      .getOne();
    if (student_id === "" || exam_score === "") {
      req.flash("error", "Yêu cầu nhập đầy đủ thông tin");
      res.redirect("/admin/grade_add");
    } else if (!checkExamStudent) {
      req.flash("error", "Sinh viên chưa đăng ký môn thi này");
      res.redirect("/admin/grade_add");
    } else if (students) {
      const addGradeExam = await AppDataSource.createQueryBuilder()
        .insert()
        .into(Grades_Subjects)
        .values({
          student: student_id,
          subject: subject_id,
          exam_score: exam_score,
        })
        .execute();
      req.flash("success", "Nhập điểm thi thành công");
      res.redirect("/admin/grade_list");
    } else {
      req.flash("error", "Sinh viên không tồn tại");
      res.redirect("/admin/grade_add");
    }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};

export const updateGradeExam = async (req: Request, res: Response) => {
  const { student_id, subject_id, exam_score } = req.body;
  const id = parseInt(req.params.id, 10);
  try {
    const students = await AppDataSource.getRepository(Students)
      .createQueryBuilder("students")
      .where("students.id = :id", { id: student_id })
      .getOne();
    if (student_id === "" || exam_score === "") {
      req.flash("error", "Yêu cầu nhập đầy đủ thông tin");
      res.redirect("/admin/grade_update/" + id);
    } else if (students) {
      const addGradeExam = await AppDataSource.createQueryBuilder()
        .update(Grades_Subjects)
        .set({
          student: student_id,
          subject: subject_id,
          exam_score: exam_score,
        })
        .where("grades_subjects.id = :id", { id: id })
        .execute();
      req.flash("success", "Cập nhật nhập điểm thi thành công");
      res.redirect("/admin/grade_list");
    } else {
      req.flash("error", "Sinh viên không tồn tại");
      res.redirect("/admin/grade_update/" + id);
    }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};
