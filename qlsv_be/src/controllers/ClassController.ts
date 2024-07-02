import { Request, Response } from "express";
import { Departments } from "../entities/Department";
import { AppDataSource } from "../database/db";
import { Majors } from "../entities/Major";
import { Classes } from "../entities/Class";
import { Students } from "../entities/Student";
import * as xlsx from "xlsx";
export const getAllClasses = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 6;
  const offset = (page - 1) * limit;
  const [items, count] = await AppDataSource.getRepository(
    Classes
  ).findAndCount({
    relations: ["department", "major"],
    skip: offset,
    take: limit,
  });
  const totalPages = Math.ceil(count / limit);
  const user = (req.session as any).user;
  if (user) {
    res.render("admin/classes/class_list", {
      list: items,
      user,
      messages: req.flash(),
      currentPage: page,
      totalPages,
    });
  }
};

export const getDetailClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const classes_student = await AppDataSource.getRepository(Students)
      .createQueryBuilder("students")
      .leftJoinAndSelect("students.classes", "class_id")
      .leftJoinAndSelect("students.department", "department_id")
      .leftJoinAndSelect("students.major", "major_id")
      .where("students.classesId = :classesId", { classesId: id })
      .getMany();
    const classes = await AppDataSource.getRepository(Classes)
      .createQueryBuilder("classes")
      .leftJoinAndSelect("classes.department", "department_id")
      .leftJoinAndSelect("classes.major", "major_id")
      .where("classes.id = :id", { id: id })
      .getOne();
    const user = (req.session as any).user;

    if (!classes_student) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (user) {
      // console.log(classes_student);
      res.render("admin/classes/class_detail", {
        list: classes_student,
        user,
        message: null,
        messages: req.flash(),
        item: classes,
      });
    }
  } catch (error) {
    console.error("Error getting classes:", error);
    res.status(500).json({ message: "Error getting classess" });
  }
};

export const getAddClass = async (req: Request, res: Response) => {
  const user = (req.session as any).user;
  const department = await AppDataSource.getRepository(Departments).find();
  const major = await AppDataSource.getRepository(Majors).find();
  if (user) {
    res.render("admin/classes/class_add", {
      user,
      message: null,
      messages: req.flash(),
      list_department: department,
      list_major: major,
    });
  }
};
export const getOneClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const classes = await AppDataSource.getRepository(Classes)
      .createQueryBuilder("classes")
      .leftJoinAndSelect("classes.department", "department_id")
      .leftJoinAndSelect("classes.major", "major_id")
      .where("classes.id = :id", { id: id })
      .getOne();
    const department = await AppDataSource.getRepository(Departments).find();
    const major = await AppDataSource.getRepository(Majors).find();
    const user = (req.session as any).user;

    if (!classes) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (user) {
      res.render("admin/classes/class_update", {
        item: classes,
        user,
        message: null,
        messages: req.flash(),
        list_department: department,
        list_major: major,
      });
    }
  } catch (error) {
    console.error("Error getting classes:", error);
    res.status(500).json({ message: "Error getting classess" });
  }
};

export const createClass = async (req: Request, res: Response) => {
  const { id, class_name, department_id, major_id } = req.body;
  const user_name = (req.session as any).user.username;
  try {
    const classRepository = await AppDataSource.getRepository(Classes);
    const existingClassId = await classRepository
      .createQueryBuilder("classes")
      .where("classes.id = :id", {
        id,
      })
      .getOne();
    const existingClassName = await classRepository
      .createQueryBuilder("classes")
      .where("classes.class_name = :class_name", {
        class_name,
      })
      .getOne();
    if (id === "" || class_name === "") {
      req.flash("error", "Yêu cầu nhập đầy đủ thông tin");
      return res.redirect("/admin/class_add");
    } else if (existingClassId || existingClassName) {
      req.flash("error", "Lớp học đã tồn tại");
      return res.redirect("/admin/class_add");
    } else {
      const addClass = await AppDataSource.createQueryBuilder()
        .insert()
        .into(Classes)
        .values({
          id: id,
          class_name: class_name,
          department: department_id,
          major: major_id,
        })
        .execute();
      req.flash("success", "Thêm thành công");
      return res.redirect("/admin/class_list");
    }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};

export const updateClass = async (req: Request, res: Response) => {
  const { class_name, department_id, major_id } = req.body;
  const { id } = req.params;
  const user_name = (req.session as any).user.username;
  try {
    const classes = await AppDataSource.getRepository(Classes)
      .createQueryBuilder("classes")
      .leftJoinAndSelect("classes.department", "department_id")
      .leftJoinAndSelect("classes.major", "major_id")
      .where("classes.id = :id ", { id: id })
      .getOne();
    const existingClassName = await AppDataSource.getRepository(Classes)
      .createQueryBuilder("classes")
      .leftJoinAndSelect("classes.department", "department_id")
      .leftJoinAndSelect("classes.major", "major_id")
      .where("classes.class_name = :class_name and classes.id != :id  ", {
        class_name,
        id,
      })
      .getOne();
    if (id === "" || class_name === "") {
      req.flash("error", "Yêu cầu nhập đầy đủ thông tin");
      return res.redirect("/admin/class_update/" + id);
    } else {
      const updateMajor = await AppDataSource.createQueryBuilder()
        .update(Classes)
        .set({
          class_name: class_name,
          department: department_id,
          major: major_id,
        })
        .where("id = :id", { id: id })
        .execute();
      req.flash("success", "Cập nhật thành công");
      return res.redirect("/admin/class_list");
    }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};

export const exportStudents = async (req: Request, res: Response) => {
  const { id } = req.params;
  const classes = await AppDataSource.getRepository(Classes)
    .createQueryBuilder("classes")
    .leftJoinAndSelect("classes.department", "department_id")
    .leftJoinAndSelect("classes.major", "major_id")
    .where("classes.id = :id", { id: id })
    .getOne();
  const classes_student = await AppDataSource.getRepository(Students)
    .createQueryBuilder("students")
    .leftJoinAndSelect("students.classes", "class_id")
    .leftJoinAndSelect("students.department", "department_id")
    .leftJoinAndSelect("students.major", "major_id")
    .where("students.classesId = :classesId", { classesId: id })
    .getMany();
  const studentsData = classes_student.map((student, index) => ({
    STT: index + 1,
    "Mã sinh viên": student.id,
    "Họ và tên": student.fullName,
    "Lớp học": student.classes.class_name,
    "Khoa học": student.department.department_name,
    "Ngành học": student.major.major_name,
  }));
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(studentsData);
  xlsx.utils.book_append_sheet(workbook, worksheet, "Students");

  // Tạo file Excel
  const fileName = `students_class_${classes?.class_name}.xlsx`;
  const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
  res.send(buffer);
};
