import { Request, Response } from "express";
import { Departments } from "../entities/Department";
import { AppDataSource } from "../database/db";
import { Majors } from "../entities/Major";
import { Classes } from "../entities/Class";
import { Students } from "../entities/Student";
// import { Courses } from "../entities/Course";
import { Users } from "../entities/User";
import { Lecturers } from "../entities/Lecturer";
export const getAllLecturer = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 6;
  const offset = (page - 1) * limit;
  const [items, count] = await AppDataSource.getRepository(
    Lecturers
  ).findAndCount({
    relations: ["department", "major"],
  });
  const totalPages = Math.ceil(count / limit);
  const user_name = await (req.session as any).user;
  if (user_name) {
    res.render("admin/lecturer/lecturer_list", {
      list: items,
      user_name,
      success: null,
      messages: req.flash(),
      currentPage: page,
      totalPages,
    });
  }
};

export const getOneLecturer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const items = await AppDataSource.getRepository(Lecturers)
    .createQueryBuilder("lecturers")
    .leftJoinAndSelect("lecturers.department", "department_id")
    .leftJoinAndSelect("lecturers.major", "major_id")
    .where("lecturers.id = :id", { id: id })
    .getOne();
  const department = await AppDataSource.getRepository(Departments).find();
  const major = await AppDataSource.getRepository(Majors).find();
  const user_name = await (req.session as any).user;
  if (user_name) {
    res.render("admin/lecturer/lecturer_update", {
      item: items,
      user_name,
      message: null,
      messages: req.flash(),
      list_department: department,
      list_major: major,
    });
  }
};

export const getAddLecturer = async (req: Request, res: Response) => {
  const user_name = (req.session as any).user;
  const department = await AppDataSource.getRepository(Departments).find();
  const major = await AppDataSource.getRepository(Majors).find();
  const classes = await AppDataSource.getRepository(Classes).find();
  if (user_name) {
    res.render("admin/lecturer/lecturer_add", {
      user_name,
      message: null,
      messages: req.flash(),
      list_department: department,
      list_major: major,
      list_class: classes,
    });
  }
};

export const createLecturer = async (req: Request, res: Response) => {
  const {
    id,
    firstName,
    lastName,
    fullName,
    phoneNumber,
    email,
    citizenID,
    department_id,
    major_id,
    address,
    province,
    birthDate,
    nation,
    gender,
  } = req.body;
  try {
    const existingLecturerID = await AppDataSource.getRepository(Lecturers)
      .createQueryBuilder("lecturers")
      .where("lecturers.id = :id", {
        id: id,
      })
      .getOne();
    if (
      id === "" ||
      firstName === "" ||
      lastName === "" ||
      fullName === "" ||
      phoneNumber === "" ||
      citizenID === "" ||
      email === "" ||
      birthDate === "" ||
      address === "" ||
      province === "" ||
      gender === "" ||
      nation === ""
    ) {
      req.flash("error", "Yêu cầu nhập đầy đủ thông tin");
      return res.redirect("/admin/lecturer_add");
    } else if (phoneNumber.length < 10) {
      req.flash("error", "Số điện thoại độ dài phải 10 chữ số");
      return res.redirect("/admin/lecturer_add");
    } else if (citizenID.length < 12) {
      req.flash("error", "CCCD độ dài phải 12 chữ số");
      return res.redirect("/admin/lecturer_add");
    } else if (existingLecturerID) {
      req.flash("error", "Mã giảng viên đã tồn tại");
      return res.redirect("/admin/lecturer_add");
    } else {
      const add = await AppDataSource.createQueryBuilder()
        .insert()
        .into(Lecturers)
        .values({
          id: id,
          firstName: firstName,
          lastName: lastName,
          fullName: fullName,
          phoneNumber: phoneNumber,
          email: email,
          citizenID: citizenID,
          department: department_id,
          major: major_id,
          birthDate: birthDate,
          address: address,
          province: province,
          gender: gender,
          nation: nation,
        })
        .execute();
      req.flash("success", "Thêm thành công");
      return res.redirect("/admin/lecturer_list");
    }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};

export const updateLecturer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    fullName,
    phoneNumber,
    email,
    citizenID,
    course_id,
    department_id,
    major_id,
    class_id,
    address,
    province,
    birthDate,
    nation,
    gender,
  } = req.body;
  try {
    const user_name = (req.session as any).user.username;
    const classRepository = await AppDataSource.getRepository(Classes);
    const majorRepository = await AppDataSource.getRepository(Majors);
    const departmentRepository = await AppDataSource.getRepository(Departments);
    const existingMajorId = await majorRepository
      .createQueryBuilder("majors")
      .where("majors.id = :id", {
        id: major_id,
      })
      .getOne();
    const existingDepartmentId = await departmentRepository
      .createQueryBuilder("departments")
      .where("departments.id = :id", {
        id: department_id,
      })
      .getOne();
    const existingClassId = await classRepository
      .createQueryBuilder("classes")
      .where("classes.id = :id", {
        id: class_id,
      })
      .getOne();
    const existingStudentID = await classRepository
      .createQueryBuilder("students")
      .where("students.id = :id", {
        id: id,
      })
      .getOne();
    if (existingStudentID) {
      req.flash("error", "Mã giảng viên đã tồn tại");
      return res.redirect("/getLecturer/" + id);
    } else if (!existingDepartmentId) {
      req.flash("error", "Khoa học không tồn tại");
      return res.redirect("/getLecturer/" + id);
    } else if (!existingMajorId) {
      req.flash("error", "Ngành học không tồn tại");
      return res.redirect("/getLecturer/" + id);
    } else {
      const add = await AppDataSource.createQueryBuilder()
        .update(Lecturers)
        .set({
          firstName: firstName,
          lastName: lastName,
          fullName: fullName,
          phoneNumber: phoneNumber,
          email: email,
          citizenID: citizenID,
          department: department_id,
          major: major_id,
          // birthDate: birthDate,
          address: address,
          province: province,
          gender: gender,
          nation: nation,
        })
        .where("lecturers.id = :id", { id: id })
        .execute();
      req.flash("success", "Cập nhật thành công");
      return res.redirect("/admin/lecturer_list");
    }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};
