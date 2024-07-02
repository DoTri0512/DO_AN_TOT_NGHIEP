import { Request, Response } from "express";
import { Departments } from "../entities/Department";
import { AppDataSource } from "../database/db";
import { Majors } from "../entities/Major";
export const getAllMajor = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 6;
  const offset = (page - 1) * limit;
  const [items, count] = await AppDataSource.getRepository(Majors).findAndCount(
    {
      relations: ["department"],
      skip: offset,
      take: limit,
    }
  );
  const totalPages = Math.ceil(count / limit);
  const user_name = (req.session as any).user;
  if (user_name) {
    res.render("admin/major/major_list", {
      list: items,
      user_name,
      messages: req.flash(),
      currentPage: page,
      totalPages,
    });
  }
};
export const getOneMajor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const major = await AppDataSource.getRepository(Majors)
      .createQueryBuilder("majors")
      .leftJoinAndSelect("majors.department", "department_id")
      .where("majors.id = :id", { id: id })
      .getOne();
    const department = await AppDataSource.getRepository(Departments).find();
    const user_name = (req.session as any).user;

    if (!major) {
      return res.status(404).json({ message: "Major not found" });
    }
    if (user_name) {
      res.render("admin/major/major_update", {
        item: major,
        user_name,
        message: null,
        messages: req.flash(),
        list_department: department,
      });
    }
  } catch (error) {
    console.error("Error getting major:", error);
    res.status(500).json({ message: "Error getting major" });
  }
};

export const getAddMajor = async (req: Request, res: Response) => {
  const user_name = (req.session as any).user;
  const department = await AppDataSource.getRepository(Departments).find();
  if (user_name) {
    res.render("admin/major/major_add", {
      user_name,
      message: null,
      messages: req.flash(),
      list_department: department,
    });
  }
};
export const createMajor = async (req: Request, res: Response) => {
  const { id, major_name, department_id } = req.body;
  const user_name = (req.session as any).user.username;
  try {
    const majorRepository = await AppDataSource.getRepository(Majors);
    const departmentRepository = await AppDataSource.getRepository(Departments);
    const existingMajorId = await majorRepository
      .createQueryBuilder("majors")
      .where("majors.id = :id", {
        id,
      })
      .getOne();
    const existingDepartmentId = await departmentRepository
      .createQueryBuilder("departments")
      .where("departments.id = :id", {
        id: department_id,
      })
      .getOne();
    const existingMajorName = await majorRepository
      .createQueryBuilder("majors")
      .where("majors.major_name = :major_name", {
        major_name,
      })
      .getOne();
    if (id === "" || major_name === "") {
      req.flash("error", "Yêu cầu nhập đầy đủ thông tin");
      return res.redirect("/admin/major_add");
    } else if (existingMajorId || existingMajorName) {
      req.flash("error", "Ngành học đã tồn tại");
      return res.redirect("/admin/major_add");
    } else {
      const addMajor = await AppDataSource.createQueryBuilder()
        .insert()
        .into(Majors)
        .values({
          id: id,
          major_name: major_name,
          department: department_id,
        })
        .execute();
      req.flash("success", "Thêm thành công");
      return res.redirect("/admin/major_list");
    }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};
export const updateMajor = async (req: Request, res: Response) => {
  const { major_name, department_id, id_2 } = req.body;
  const { id } = req.params;
  const user_name = (req.session as any).user.username;
  try {
    const major_id = await AppDataSource.getRepository(Majors)
      .createQueryBuilder("majors")
      .leftJoinAndSelect("majors.department", "department_id")
      .where("majors.id = :id ", { id: id })
      .getOne();
    const majorRepository = await AppDataSource.getRepository(Majors);
    const existingMajorName = await AppDataSource.getRepository(Majors)
      .createQueryBuilder("majors")
      .leftJoinAndSelect("majors.department", "department_id")
      .where("majors.major_name = :major_name and majors.id != :id  ", {
        major_name,
        id,
      })
      .getOne();
    if (id === "" || major_name === "") {
      req.flash("error", "Yêu cầu nhập đầy đủ thông tin");
      return res.redirect("/getMajor/" + id);
    } else if (existingMajorName) {
      req.flash("error", "Ngành học đã tồn tại");
      return res.redirect("/getMajor/" + id);
    } else {
      const updateMajor = await AppDataSource.createQueryBuilder()
        .update(Majors)
        .set({
          // id: id_2,
          major_name: major_name,
          department: department_id,
        })
        .where("id = :id", { id: id })
        .execute();
      req.flash("success", "Cập nhật thành công");
      return res.redirect("/admin/major_list");
    }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};
