import { Request, Response } from "express";
import { AppDataSource } from "../database/db";
import { Subjects } from "../entities/Subject";
import { Rooms } from "../entities/Room";
import { Schedules } from "../entities/Schedule";
import { Classes } from "../entities/Class";
import { Exams } from "../entities/Exam";
import { ExamStudent } from "../entities/ExamStudent";
import moment from "moment";
import { Enrollments } from "../entities/Enrollment";

export const getAllExam = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 6;
  const offset = (page - 1) * limit;
  const [items, count] = await AppDataSource.getRepository(Exams).findAndCount({
    relations: ["room", "subject"],
    skip: offset,
    take: limit,
  });
  const daysOfWeekVietnamese = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  const itemsWithDayOfWeekName = items.map((item) => ({
    ...item,
    dayOfWeekName: daysOfWeekVietnamese[moment(item.day).day()],
  }));
  const totalPages = Math.ceil(count / limit);
  const user_name = await (req.session as any).user;
  if (user_name) {
    res.render("admin/exam/exam_list", {
      list: itemsWithDayOfWeekName,
      user_name,
      messages: req.flash(),
      currentPage: page,
      totalPages,
      moment,
    });
  }
};

export const getOneExam = async (req: Request, res: Response) => {
  const user_name = await (req.session as any).user;
  const id = parseInt(req.params.id, 10);
  const room = await AppDataSource.getRepository(Rooms).find();
  const subjects = await AppDataSource.getRepository(Subjects).find();
  const item = await AppDataSource.getRepository(Exams)
    .createQueryBuilder("exams")
    .leftJoinAndSelect("exams.room", "room_id")
    .leftJoinAndSelect("exams.subject", "subject_id")
    .where("exams.id = :id", { id: id })
    .getOne();
  if (user_name) {
    // console.log(item);
    res.render("admin/exam/exam_update", {
      item: item,
      user_name,
      moment,
      list_room: room,
      list_subject: subjects,
      messages: req.flash(),
    });
  }
};

export const getExamsStudents = async (req: Request, res: Response) => {
  const user_name = await (req.session as any).user;
  const id = parseInt(req.params.id, 10);
  const exam_student = await AppDataSource.getRepository(ExamStudent)
    .createQueryBuilder("exam_student")
    .leftJoinAndSelect("exam_student.student", "student_id")
    .where("exam_student.id = :id", { id })
    .getOne();
  if (user_name) {
    console.log(exam_student);
    res.render("admin/exam/exam_update_student", {
      // item: item,
      user_name,
      moment,
      messages: req.flash(),
      item: exam_student,
    });
  }
};

export const getDetailAddExam = async (req: Request, res: Response) => {
  const user_name = await (req.session as any).user;
  const id = parseInt(req.params.id, 10);
  const item = await AppDataSource.getRepository(Exams)
    .createQueryBuilder("exams")
    .leftJoinAndSelect("exams.room", "room_id")
    .leftJoinAndSelect("exams.subject", "subject_id")
    .where("exams.id = :id", { id: id })
    .getOne();
  if (user_name) {
    // console.log(item);
    res.render("admin/exam/exam_add_student", {
      item: item,
      user_name,
      moment,
      messages: req.flash(),
    });
  }
};

export const getDetailExamStudent = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const user_name = await (req.session as any).user;
  // const id = parseInt(req.params.id, 10);
  const id = req.params;
  const limit = 6;
  const offset = (page - 1) * limit;
  const [items, count] = await AppDataSource.getRepository(
    ExamStudent
  ).findAndCount({
    relations: [
      "exam",
      "student",
      "exam.subject",
      "exam.room",
      "student.classes",
    ],
    where: { exam: id },
    skip: offset,
    take: limit,
  });
  const totalPages = Math.ceil(count / limit);
  if (user_name) {
    console.log(items);
    res.render("admin/exam/exam_detail_student", {
      list: items,
      user_name,
      messages: req.flash(),
      currentPage: page,
      totalPages,
      moment,
    });
  }
};

export const getAddExam = async (req: Request, res: Response) => {
  const user_name = await (req.session as any).user;
  const room = await AppDataSource.getRepository(Rooms).find();
  const subjects = await AppDataSource.getRepository(Subjects).find();
  if (user_name) {
    res.render("admin/exam/exam_add", {
      user_name,
      messages: req.flash(),
      list_room: room,
      list_subject: subjects,
    });
  }
};

export const createExamSubject = async (req: Request, res: Response) => {
  const {
    day,
    exam_period,
    start_period,
    end_period,
    startTime,
    endTime,
    room_id,
    subject_id,
  } = req.body;
  try {
    if (
      day === "" ||
      exam_period === "" ||
      start_period === "" ||
      end_period === "" ||
      startTime === "" ||
      endTime === ""
    ) {
      req.flash("error", "Yêu cầu nhập đầy đủ thông tin");
      res.redirect("/admin/exam_add");
    } else {
      const addExam = await AppDataSource.createQueryBuilder()
        .insert()
        .into(Exams)
        .values({
          day: day,
          exam_period: exam_period,
          start_period: start_period,
          end_period: end_period,
          startTime: startTime,
          endTime: endTime,
          room: room_id,
          subject: subject_id,
        })
        .execute();
      req.flash("success", "Thêm lịch thi cho môn học thành công");
      res.redirect("/admin/exam_list");
    }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};

export const updateExamSubject = async (req: Request, res: Response) => {
  const {
    day,
    exam_period,
    start_period,
    end_period,
    startTime,
    endTime,
    room_id,
    subject_id,
  } = req.body;
  const id = parseInt(req.params.id, 10);
  try {
    if (
      day === "" ||
      exam_period === "" ||
      start_period === "" ||
      end_period === "" ||
      startTime === "" ||
      endTime === ""
    ) {
      req.flash("error", "Yêu cầu nhập đầy đủ thông tin");
      res.redirect("/getOneExam/" + id);
    } else {
      const addExam = await AppDataSource.createQueryBuilder()
        .update(Exams)
        .set({
          day: day,
          exam_period: exam_period,
          start_period: start_period,
          end_period: end_period,
          startTime: startTime,
          endTime: endTime,
          room: room_id,
          subject: subject_id,
        })
        .where("id = :id", { id: id })
        .execute();
      req.flash("success", "Cập nhật lịch thi cho môn học thành công");
      res.redirect("/admin/exam_list");
    }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};

export const createExamStudent = async (req: Request, res: Response) => {
  const id_2 = parseInt(req.params.id, 10);
  const id = req.params;
  const { enrollmentNumber, student_id } = req.body;
  try {
    // const checkSubject = await AppDataSource.getRepository(Enrollments)
    //   .createQueryBuilder("enrollments")
    //   .leftJoinAndSelect("enrollments.class_course", "classCourse_id")
    //   .leftJoinAndSelect("class_course.subject", "subject_id")
    //   .where("")
    //   .getOne();
    if (student_id === "" || enrollmentNumber === "") {
      req.flash("error", "Yêu cầu nhập đầy đủ thông tin");
      res.redirect("/admin/exam_add_student/" + id_2);
    } else {
      const addExam = await AppDataSource.createQueryBuilder()
        .insert()
        .into(ExamStudent)
        .values({
          exam: id,
          student: student_id,
          enrollmentNumber: enrollmentNumber,
        })
        .execute();
      req.flash("success", "Thêm lịch thi cho sinh viên thành công");
      res.redirect("/admin/exam_list");
    }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};
export const updateExamStudent = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { enrollmentNumber, student_id } = req.body;
  try {
    if (student_id === "" || enrollmentNumber === "") {
      req.flash("error", "Yêu cầu nhập đầy đủ thông tin");
      res.redirect("/admin/exam_update_student/" + id);
    }
    const addExam = await AppDataSource.createQueryBuilder()
      .update(ExamStudent)
      .set({
        student: student_id,
        enrollmentNumber: enrollmentNumber,
      })
      .where("id = :id", { id: id })
      .execute();
    req.flash("success", "Cập nhật lịch thi cho sinh viên thành công");
    res.redirect("/admin/exam_list");
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};
