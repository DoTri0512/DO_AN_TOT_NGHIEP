import { Request, Response } from "express";
import { AppDataSource } from "../database/db";
import { Students } from "../entities/Student";
import { Conduct_Scores } from "../entities/Conduct_Scores";
export const getAllConductScore = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 6;
  const offset = (page - 1) * limit;
  const [items, count] = await AppDataSource.getRepository(
    Conduct_Scores
  ).findAndCount({
    relations: [
      "student",
      "student.classes",
      "student.major",
      "student.department",
    ],
    skip: offset,
    take: limit,
  });
  const totalPages = Math.ceil(count / limit);
  const user = await (req.session as any).user;
  const rating = items.map((item) => {
    let ratingValue = "";
    if (item.conduct_score >= 9) {
      ratingValue = "Xuất sắc";
    } else if (item.conduct_score >= 8) {
      ratingValue = "Giỏi";
    } else if (item.conduct_score >= 7) {
      ratingValue = "Khá";
    } else if (item.conduct_score >= 6) {
      ratingValue = "Trung bình";
    } else {
      ratingValue = "Yếu";
    }
    return {
      ...item,
      rating: ratingValue,
    };
  });
  if (user) {
    res.render("admin/conduct/conduct_list", {
      list: rating,
      user,
      messages: req.flash(),
      currentPage: page,
      totalPages,
    });
  }
};

export const getOneConductScore = async (req: Request, res: Response) => {
  const user = await (req.session as any).user;
  const id = parseInt(req.params.id);
  const item = await AppDataSource.getRepository(Conduct_Scores)
    .createQueryBuilder("conduct_score")
    .leftJoinAndSelect("conduct_score.student", "student_id")
    .where("conduct_score.id = :id", { id: id })
    .getOne();
  if (user) {
    res.render("admin/conduct/conduct_update", {
      user,
      messages: req.flash(),
      item: item,
    });
  }
};

export const getAddConductScore = async (req: Request, res: Response) => {
  const user = await (req.session as any).user;
  if (user) {
    res.render("admin/conduct/conduct_add", {
      user,
      messages: req.flash(),
    });
  }
};

export const createConductScore = async (req: Request, res: Response) => {
  const { student_id, conduct_score } = req.body;
  try {
    const students = await AppDataSource.getRepository(Students)
      .createQueryBuilder("students")
      .where("students.id = :id", { id: student_id })
      .getOne();
    if (student_id === "" || conduct_score === "") {
      req.flash("error", "Yêu cầu nhập đầy đủ thông tin");
      res.redirect("/admin/conduct_add");
    } else if (students) {
      const addGradeExam = await AppDataSource.createQueryBuilder()
        .insert()
        .into(Conduct_Scores)
        .values({
          student: student_id,
          conduct_score: conduct_score,
        })
        .execute();
      req.flash("success", "Nhập điểm rèn luyện thành công");
      res.redirect("/admin/conduct_list");
    } else {
      req.flash("error", "Sinh viên không tồn tại");
      res.redirect("/admin/conduct_add");
    }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};

export const updateConductScore = async (req: Request, res: Response) => {
  const { student_id, conduct_score } = req.body;
  const id = parseInt(req.params.id, 10);
  try {
    const students = await AppDataSource.getRepository(Students)
      .createQueryBuilder("students")
      .where("students.id = :id", { id: student_id })
      .getOne();
    if (student_id === "" || conduct_score === "") {
      req.flash("error", "Yêu cầu nhập đầy đủ thông tin");
      res.redirect("/admin/conduct_update/" + id);
    } else if (students) {
      const addGradeExam = await AppDataSource.createQueryBuilder()
        .update(Conduct_Scores)
        .set({
          student: student_id,
          conduct_score: conduct_score,
        })
        .where("conduct_score.id = :id", { id: id })
        .execute();
      req.flash("success", "Cập nhật điểm rèn luyện thành công");
      res.redirect("/admin/conduct_list");
    } else {
      req.flash("error", "Sinh viên không tồn tại");
      res.redirect("/admin/conduct_add");
    }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};
