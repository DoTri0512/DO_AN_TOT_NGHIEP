import { Request, Response } from "express";
import { Departments } from "../entities/Department";
import { AppDataSource } from "../database/db";
import { Majors } from "../entities/Major";
import { Subjects } from "../entities/Subject";
import { Class_Course } from "../entities/Class_Course";
import { ScheduleSubject } from "../entities/ScheduleSubject";
import moment from "moment";
import { Lecturers } from "../entities/Lecturer";
export const getAllClassCourse = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 6;
  const offset = (page - 1) * limit;
  const [items, count] = await AppDataSource.getRepository(
    Class_Course
  ).findAndCount({
    relations: ["subject", "lecturer"],
    skip: offset,
    take: limit,
  });
  const totalPages = Math.ceil(count / limit);
  const user_name = await (req.session as any).user;
  if (user_name) {
    res.render("admin/classCourse/classCourse_list", {
      list: items,
      user_name,
      messages: req.flash(),
      currentPage: page,
      totalPages,
    });
  }
};

export const getClassCourse = async (req: Request, res: Response) => {
  const { id } = req.params;
  const schedule_subject = await AppDataSource.getRepository(ScheduleSubject)
    .createQueryBuilder("schedule_subject")
    .leftJoinAndSelect("schedule_subject.room", "room_id")
    .leftJoinAndSelect("schedule_subject.class_course", "classCourse_id")
    .leftJoinAndSelect("schedule_subject.schedule", "schedule_id")
    .where("schedule_subject.classCourse_id = :classCourse_id", {
      classCourse_id: id,
    })
    .getMany();
  const user_name = await (req.session as any).user;
  if (user_name) {
    schedule_subject;
    console.log();
    res.render("admin/classCourse/classCourse_detail", {
      user_name,
      messages: req.flash(),
      list: schedule_subject,
      moment,
    });
  }
};

export const getOneClassCourse = async (req: Request, res: Response) => {
  const { id } = req.params;
  const schedule_subject = await AppDataSource.getRepository(Class_Course)
    .createQueryBuilder("class_course")
    .leftJoinAndSelect("class_course.subject", "subject_id")
    .leftJoinAndSelect("class_course.lecturer", "lecturer_id")
    .where("class_course.id = :id", {
      id: id,
    })
    .getOne();
  const list_subject = await AppDataSource.getRepository(Subjects)
    .createQueryBuilder("subjects")
    .getMany();
  const list_lecturer = await AppDataSource.getRepository(Lecturers)
    .createQueryBuilder("lecturers")
    .getMany();
  const user_name = await (req.session as any).user;
  if (user_name) {
    schedule_subject;
    console.log();
    res.render("admin/classCourse/classCourse_update", {
      user_name,
      messages: req.flash(),
      item: schedule_subject,
      moment,
      list_subject: list_subject,
      list_lecturer: list_lecturer,
    });
  }
};

export const getAddClassCourse = async (req: Request, res: Response) => {
  const user_name = (req.session as any).user;
  const list_subject = await AppDataSource.getRepository(Subjects)
    .createQueryBuilder("subjects")
    .getMany();
  const list_lecturer = await AppDataSource.getRepository(Lecturers)
    .createQueryBuilder("lecturers")
    .getMany();
  if (user_name) {
    res.render("admin/classCourse/classCourse_add", {
      list_subject: list_subject,
      list_lecturer: list_lecturer,
      user_name,
      message: null,
      messages: req.flash(),
    });
  }
};

export const createClassCourse = async (req: Request, res: Response) => {
  const { classCourse_name, subject_id, lecturer_id } = req.body;
  const user_name = (req.session as any).user.username;
  try {
    if (classCourse_name === "") {
      req.flash("error", "Yêu cầu nhập đầy đủ thông tin");
      return res.redirect("/admin/classCourse_add");
    } else {
      const addMajor = await AppDataSource.createQueryBuilder()
        .insert()
        .into(Class_Course)
        .values({
          classCourse_name: classCourse_name,
          subject: subject_id,
          lecturer: lecturer_id,
        })
        .execute();
      req.flash("success", "Thêm mới thành công");
      return res.redirect("/admin/classCourse_list");
    }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};

export const updateClassCourse = async (req: Request, res: Response) => {
  const { classCourse_name, subject_id, lecturer_id } = req.body;
  const user_name = (req.session as any).user.username;
  const id = parseInt(req.params.id, 10);
  try {
    if (classCourse_name === "") {
      req.flash("error", "Yêu cầu nhập đầy đủ thông tin");
      return res.redirect("/admin/classCourse_add");
    } else {
      const addMajor = await AppDataSource.createQueryBuilder()
        .update(Class_Course)
        .set({
          classCourse_name: classCourse_name,
          subject: subject_id,
          lecturer: lecturer_id,
        })
        .where("id = :id", { id })
        .execute();
      req.flash("success", "Thêm mới thành công");
      return res.redirect("/admin/classCourse_list");
    }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};
