import { Request, Response } from "express";
// import { Courses } from "../entities/Course";
import { AppDataSource } from "../database/db";
import { Rooms } from "../entities/Room";
// import flash from "connect-flash";
export const getAllCourses = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 6;
  const offset = (page - 1) * limit;
  const userRepository = await AppDataSource.getRepository(Rooms);
  const [courses, count] = await userRepository.findAndCount({
    skip: offset,
    take: limit,
  });
  const totalPages = Math.ceil(count / limit);
  const user = (req.session as any).user;
  if (user) {
    res.render("admin/course/course_list", {
      list: courses,
      user,
      messages: req.flash(),
      currentPage: page,
      totalPages,
    });
  }
};
export const getOneCourse = async (req: Request, res: Response) => {
  try {
    // const { id } = req.params;
    const id = parseInt(req.params.id, 10);
    const courseRepository = await AppDataSource.getRepository(Rooms);
    const course = await courseRepository.findOneBy({ id: id });
    const user = (req.session as any).user.username;
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (user) {
      res.render("admin/course/course_update", {
        item: course,
        user,
        message: null,
        messages: req.flash(),
      });
    }
  } catch (error) {
    console.error("Error getting course:", error);
    res.status(500).json({ message: "Error getting course" });
  }
};

//form-add
export const getAddCourse = async (req: Request, res: Response) => {
  const user = (req.session as any).user;
  if (user) {
    res.render("admin/course/course_add", {
      user,
      messages: req.flash(),
      message: null,
    });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  const { id, room_name } = req.body;
  try {
    const courseRepository = await AppDataSource.getRepository(Rooms);
    const existingCourseId = await courseRepository
      .createQueryBuilder("rooms")
      .where("room.id = :id", {
        id,
      })
      .getOne();
    const existingCourseName = await courseRepository
      .createQueryBuilder("rooms")
      .where("rooms.room_name = :room_name", {
        room_name,
      })
      .getOne();
    if (id === "" || room_name === "") {
      req.flash("error", "Yêu cầu nhập đầy đủ thông tin");
      return res.redirect("/admin/course_add");
    } else if (existingCourseId || existingCourseName) {
      req.flash("error", "Khóa học đã tồn tại!");
      return res.redirect("/admin/course_add");
    } else {
      const addCourse = await AppDataSource.createQueryBuilder()
        .insert()
        .into(Rooms)
        .values({
          id: id,
          room_name: room_name,
        })
        .execute();
      req.flash("success", "Thêm thành công !");
      return res.redirect("/admin/course_list");
    }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  const { room_name } = req.body;
  const id = parseInt(req.params.id, 10);
  try {
    const courseRepository = await AppDataSource.getRepository(Rooms);
    const existingCourseId = await courseRepository
      .createQueryBuilder("rooms")
      .where("courses.id = :id", {
        id,
      })
      .getOne();
    const existingCourseName = await courseRepository
      .createQueryBuilder("rooms")
      .where("rooms.room_name = :room_name", {
        room_name,
      })
      .getOne();
    if (room_name === "") {
      req.flash("error", "Yêu cầu nhập đầy đủ thông tin");
      return res.redirect("/admin/course_update/" + id);
    }
    if (existingCourseName) {
      req.flash("error", "Khóa học đã tồn tại!");
      return res.redirect("/admin/course_update/" + id);
    } else {
      const updateCourse = await AppDataSource.createQueryBuilder()
        .update(Rooms)
        .set({ room_name: room_name })
        .where("id = :id", { id: id })
        .execute();
      req.flash("success", "Cập nhật thành công !");
      return res.redirect("/admin/course_list");
      // res.status(200).send("Update thanh cong");
    }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};
