import { Request, Response } from "express";
import { Departments } from "../entities/Department";
import { AppDataSource } from "../database/db";
import { Subject_Department } from "../entities/Subject_Department";
export const getAllDepartment = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 6;
  const offset = (page - 1) * limit;
  const departmentRepository = await AppDataSource.getRepository(Departments);
  const [departments, count] = await departmentRepository.findAndCount({
    skip: offset,
    take: limit,
  });
  const totalPages = Math.ceil(count / limit);
  const user_name = (req.session as any).user;
  if (user_name) {
    res.render("admin/department/department_list", {
      list: departments,
      user_name,
      messages: req.flash(),
      currentPage: page,
      totalPages,
    });
  }
  // res.json(courses);
};
export const getOneDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const departmentRepository = await AppDataSource.getRepository(Departments);
    const department = await departmentRepository.findOneBy({ id: id });
    const user_name = (req.session as any).user;

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    if (user_name) {
      res.render("admin/department/department_update", {
        item: department,
        user_name,
        message: null,
        messages: req.flash(),
      });
    }
  } catch (error) {
    console.error("Error getting department:", error);
    res.status(500).json({ message: "Error getting department" });
  }
};

export const getDetailDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 6;
    const offset = (page - 1) * limit;
    const [department, count] = await AppDataSource.getRepository(
      Subject_Department
    )
      .createQueryBuilder("subject_department")
      .leftJoinAndSelect("subject_department.department", "department_id")
      .leftJoinAndSelect("subject_department.subject", "subject_id")
      .where("subject_department.department_id = :department_id", {
        department_id: id,
      })
      .skip(offset)
      .take(limit)
      .getManyAndCount();
    const user_name = (req.session as any).user;
    const totalPages = Math.ceil(count / limit);
    const item = await AppDataSource.getRepository(Departments).findOneBy({ id: id });
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    if (user_name) {
      console.log(item);
      res.render("admin/department/department_detail", {
        list: department,
        user_name,
        message: null,
        messages: req.flash(),
        currentPage: page,
        totalPages,
        item: item,
      });
    }
  } catch (error) {
    console.error("Error getting department:", error);
    res.status(500).json({ message: "Error getting department" });
  }
};

export const getAddDepartment = async (req: Request, res: Response) => {
  const user_name = (req.session as any).user;
  if (user_name) {
    res.render("admin/department/department_add", {
      user_name,
      message: null,
      messages: req.flash(),
    });
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  const { id, department_name } = req.body;
  try {
    const departmentRepository = await AppDataSource.getRepository(Departments);
    const existingDepartmentId = await departmentRepository
      .createQueryBuilder("departments")
      .where("departments.id = :id", {
        id,
      })
      .getOne();
    const existingDepartmentName = await departmentRepository
      .createQueryBuilder("departments")
      .where("departments.department_name = :department_name", {
        department_name,
      })
      .getOne();
    if (id === "" || department_name === "") {
      req.flash("error", "Yêu cầu nhập đầy đủ thông tin");
      return res.redirect("/admin/department_add");
    } else if (existingDepartmentId || existingDepartmentName) {
      req.flash("error", "Khoa học đã tồn tại");
      return res.redirect("/admin/department_add");
    } else {
      const addDepartment = await AppDataSource.createQueryBuilder()
        .insert()
        .into(Departments)
        .values({
          id: id,
          department_name: department_name,
        })
        .execute();
      req.flash("success", "Thêm thành công");
      return res.redirect("/admin/department_list");
    }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  const { department_name } = req.body;
  const { id } = req.params;
  const user_name = (req.session as any).user.username;
  try {
    const departmentRepository = await AppDataSource.getRepository(Departments);
    const department = await departmentRepository.findOneBy({ id: id });
    const existingDepartmentName = await departmentRepository
      .createQueryBuilder("departments")
      .where("departments.department_name = :department_name", {
        department_name,
      })
      .getOne();
    if (id === "" || department_name === "") {
      req.flash("error", "Yêu cầu nhập đầy đủ thông tin");
      return res.redirect("/admin/department_update/" + id);
    } else if (existingDepartmentName) {
      req.flash("error", "Khoa học đã tồn tại");
      return res.redirect("/admin/department_update/" + id);
    } else {
      const updateDepartment = await AppDataSource.createQueryBuilder()
        .update(Departments)
        .set({ department_name: department_name })
        .where("id = :id", { id: id })
        .execute();
      req.flash("success", "Cập nhật thành công");
      return res.redirect("/admin/department_list");
    }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};
