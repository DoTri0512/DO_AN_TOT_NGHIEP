import { Request, Response } from "express";
import { Departments } from "../entities/Department";
import { AppDataSource } from "../database/db";
import { Majors } from "../entities/Major";
import { Subjects } from "../entities/Subject";
import { Schedules } from "../entities/Schedule";
import { Like } from "typeorm";
import bcrypt from "bcrypt";
import { Subject_Department } from "../entities/Subject_Department";
export const getAllSubject = async (req: Request, res: Response) => {
  const page: number = parseInt(req.query.page as string) || 1;
  const limit: number = parseInt(req.query.limit as string) || 6;
  const search: string = (req.query.search as string) || "";
  const offset = (page - 1) * limit;
  const [items, count] = await AppDataSource.getRepository(
    Subjects
  ).findAndCount({
    where: { id: Like(`%${search}%`) },
    skip: offset,
    take: limit,
  });

  const totalPages = Math.ceil(count / limit);
  const user_name = await (req.session as any).user;
  if (user_name) {
    res.render("admin/subject/subject_list", {
      list: items,
      user_name,
      messages: req.flash(),
      currentPage: page,
      totalPages,
      search,
    });
  }
};

export const getSubject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const items = await AppDataSource.getRepository(Subjects)
    .createQueryBuilder("subjects")
    .where("subjects.id = :id", { id: id })
    .getOne();

  const user_name = await (req.session as any).user;
  if (user_name) {
    res.render("admin/subject/subject_update", {
      item: items,
      user_name,
      messages: req.flash(),
    });
  }
};

export const getDetailSubject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const items = await AppDataSource.getRepository(Subject_Department)
    .createQueryBuilder("subject_department")
    .leftJoinAndSelect("subject_department.subject", "subject_id")
    .leftJoinAndSelect("subject_department.department", "department_id")
    .where("subject_department.subject_id = :subject_id", { subject_id: id })
    .getMany();
  // const schedule_subject = await AppDataSource.getRepository(Schedules)
  //   .createQueryBuilder("schedules")
  //   .leftJoinAndSelect("schedules.subject", "subject_id")
  //   .leftJoinAndSelect("schedules.classes", "class_id")
  //   .leftJoinAndSelect("schedules.room", "room_id")
  //   .where("schedules.subjectId = :subjectId", { subjectId: id })
  //   .getMany();

  const user_name = await (req.session as any).user;
  // console.log(items);
  if (user_name) {
    res.render("admin/subject/subject_detail", {
      list: items,
      user_name,
      messages: req.flash(),
      // list: schedule_subject,
    });
  }
};

export const getAddSubject = async (req: Request, res: Response) => {
  const user_name = (req.session as any).user;
  if (user_name) {
    res.render("admin/subject/subject_add", {
      user_name,
      message: null,
      messages: req.flash(),
    });
  }
};

export const getAddSubjectDepartment = async (req: Request, res: Response) => {
  const user_name = (req.session as any).user;
  const department = await AppDataSource.getRepository(Departments).find();
  const { id } = req.params;
  // const hashedId = await bcrypt.hash(id, 10);
  const subject = await AppDataSource.getRepository(Subjects)
    .createQueryBuilder("subjects")
    .where("subjects.id = :id", { id: id })
    .getOne();
  if (user_name) {
    res.render("admin/subject/subject_AddDepartment", {
      user_name,
      message: null,
      list_department: department,
      messages: req.flash(),
      item: subject,
    });
  }
};

export const createSubject = async (req: Request, res: Response) => {
  const { id, subject_name, credits } = req.body;
  const user_name = (req.session as any).user.username;
  try {
    const subjectRepository = await AppDataSource.getRepository(Subjects);

    const existingSubjectId = await subjectRepository
      .createQueryBuilder("subjects")
      .where("subjects.id = :id", {
        id,
      })
      .getOne();
    const existingSubjectName = await subjectRepository
      .createQueryBuilder("subjects")
      .where("subjects.subject_name = :subject_name", {
        subject_name,
      })
      .getOne();
    if (id === "" || subject_name === "" || credits === "") {
      req.flash("error", "Yêu cầu nhập đầy đủ thông tin");
      return res.redirect("/admin/subject_add");
    } else if (existingSubjectId || existingSubjectName) {
      req.flash("error", "Môn học đã tồn tại");
      return res.redirect("/admin/subject_add");
    } else {
      const addMajor = await AppDataSource.createQueryBuilder()
        .insert()
        .into(Subjects)
        .values({
          id: id,
          subject_name: subject_name,
          credits: credits,
        })
        .execute();
      req.flash("success", "Thêm thành công");
      return res.redirect("/admin/subject_list");
    }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};

export const updateSubject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { subject_name, credits, major_id, department_id } = req.body;
  const user_name = (req.session as any).user.username;
  try {
    const subjectRepository = await AppDataSource.getRepository(Subjects);
    const existingSubjectId = await subjectRepository
      .createQueryBuilder("subjects")
      .where("subjects.id = :id", {
        id,
      })
      .getOne();
    const existingSubjectName = await subjectRepository
      .createQueryBuilder("subjects")
      .where("subjects.subject_name = :subject_name and subjects.id != :id", {
        subject_name,
        id,
      })
      .getOne();
    if (id === "" || subject_name === "" || credits === "") {
      req.flash("error", "Yêu cầu nhập đầy đủ thông tin");
      return res.redirect("/getSubject/" + id);
    } else if (existingSubjectName) {
      req.flash("error", "Môn học đã tồn tại");
      return res.redirect("/getSubject/" + id);
    } else {
      const addMajor = await AppDataSource.createQueryBuilder()
        .update(Subjects)
        .set({
          subject_name: subject_name,
          credits: credits,
        })
        .where("subjects.id = :id", { id: id })
        .execute();
      req.flash("success", "Cập nhật thành công");
      return res.redirect("/admin/subject_list");
    }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};
export const createSubjectDepartment = async (req: Request, res: Response) => {
  const { department_id } = req.body;
  const id = req.params;
  try {
    // const checkDepartment = await AppDataSource.getRepository(
    //   Subject_Department
    // )
    //   .createQueryBuilder("subject_department")
    //   .leftJoinAndSelect("subject_department.department", "department_id")
    //   .leftJoinAndSelect("subject_department.subject", "subject_id")
    //   .where(
    //     "subject_department.department_id = :department_id and subject_department.subject_id = :subject_id",
    //     {
    //       department_id: department_id,
    //       subject_id: id,
    //     }
    //   )
    //   .getOne();
    // if (checkDepartment) {
    //   req.flash("error", "Khoa học đã được thêm vào môn học");
    //   res.redirect("/getSubjectAddDepartment/" + id);
    // } else {
    const addDepartmentSubject = await AppDataSource.createQueryBuilder()
      .insert()
      .into(Subject_Department)
      .values({
        subject: id,
        department: department_id,
      })
      .execute();
    req.flash("success", "Thêm thành công");
    res.redirect("/admin/subject_list");
    // }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};
