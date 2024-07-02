import { Request, Response } from "express";
import { AppDataSource } from "../database/db";
import { Subjects } from "../entities/Subject";
import { Rooms } from "../entities/Room";
import { Schedules } from "../entities/Schedule";
import { Classes } from "../entities/Class";
import { ScheduleSubject } from "../entities/ScheduleSubject";
import { Class_Course } from "../entities/Class_Course";
import moment from "moment";
export const getAllSchedule = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 6;
  const offset = (page - 1) * limit;
  const [items, count] = await AppDataSource.getRepository(
    Schedules
  ).findAndCount({
    skip: offset,
    take: limit,
  });
  const totalPages = Math.ceil(count / limit);
  const user_name = await (req.session as any).user;
  if (user_name) {
    res.render("admin/schedule/schedule_list", {
      list: items,
      user_name,
      messages: req.flash(),
      currentPage: page,
      totalPages,
    });
  }
};

export const getOneSchedule = async (req: Request, res: Response) => {
  // const id = parseInt(req.params.id, 10);
  const { id } = req.params;
  const user_name = await (req.session as any).user;
  const schedule = await AppDataSource.getRepository(Schedules)
    .createQueryBuilder("schedule")
    .where("schedule.id = :id", { id })
    .getOne();
  if (user_name) {
    res.render("admin/schedule/schedule_update", {
      user_name,
      success: null,
      messages: req.flash(),
      item: schedule,
    });
  }
};

export const getDetailSchedule = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const user_name = await (req.session as any).user;
  const page = parseInt(req.query.page as string) || 1;
  const limit = 6;
  const offset = (page - 1) * limit;
  const [items, count] = await AppDataSource.getRepository(ScheduleSubject)
    .createQueryBuilder("schedule_subject")
    .leftJoinAndSelect("schedule_subject.schedule", "schedule_id")
    .leftJoinAndSelect("schedule_subject.room", "room_id")
    .leftJoinAndSelect("schedule_subject.class_course", "classCourse_id")
    .leftJoinAndSelect("classCourse_id.subject", "subject_id")
    .where("schedule_subject.schedule_id = :schedule_id", { schedule_id: id })
    .skip(offset)
    .take(limit)
    .getManyAndCount();
  const totalPages = Math.ceil(count / limit);
  if (user_name) {
    res.render("admin/schedule/schedule_detail", {
      user_name,
      success: null,
      messages: req.flash(),
      list: items,
      currentPage: page,
      totalPages,
      moment,
    });
  }
};

export const getAddSchedule = async (req: Request, res: Response) => {
  const user_name = await (req.session as any).user;
  if (user_name) {
    res.render("admin/schedule/schedule_add", {
      user_name,
      success: null,
      messages: req.flash(),
    });
  }
};

export const createSchedule = async (req: Request, res: Response) => {
  const { day, start_period, end_period, startTime, endTime } = req.body;
  try {
    if (day === "") {
      req.flash("error", "Yêu cầu nhập đầy đủ thông tin");
      res.redirect("/admin/schedule_add");
    } else {
      const addSchedule = await AppDataSource.createQueryBuilder()
        .insert()
        .into(Schedules)
        .values({
          day: day,
          start_period: start_period,
          end_period: end_period,
          startTime: startTime,
          endTime: endTime,
        })
        .execute();
    }
    req.flash("success", "Thêm thời khóa biểu thành công");
    res.redirect("/admin/schedule_list");
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};

export const updateSchedule = async (req: Request, res: Response) => {
  const { day, start_period, end_period, startTime, endTime } = req.body;
  const { id } = req.params;
  try {
    const addSchedule = await AppDataSource.createQueryBuilder()
      .update(Schedules)
      .set({
        day: day,
        start_period: start_period,
        end_period: end_period,
        startTime: startTime,
        endTime: endTime,
      })
      .where("id = :id", { id: id })
      .execute();
    req.flash("success", "Cập nhật thời khóa biểu thành công");
    res.redirect("/admin/schedule_list");
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};

export const getAddScheduleSubject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user_name = await (req.session as any).user;
  const schedule = await AppDataSource.getRepository(Schedules)
    .createQueryBuilder("schedules")
    .where("id = :id", { id })
    .getOne();
  const list_course = await AppDataSource.getRepository(Class_Course)
    .createQueryBuilder("class_course")
    .leftJoinAndSelect("class_course.subject", "subject_id")
    .getMany();
  const list_room = await AppDataSource.getRepository(Rooms)
    .createQueryBuilder("rooms")
    .getMany();
  if (user_name) {
    res.render("admin/schedule/schedule_addSubject", {
      user_name,
      success: null,
      messages: req.flash(),
      item: schedule,
      list_course: list_course,
      list_room: list_room,
    });
  }
};

export const createScheduleSubject = async (req: Request, res: Response) => {
  const { room_id, classCourse_id, startDate, endDate, period_number } =
    req.body;
  const id = req.params;
  const id_2 = parseInt(req.params.id, 10);
  try {
    const class_course = await AppDataSource.getRepository(ScheduleSubject)
      .createQueryBuilder("schedule_subject")
      .leftJoinAndSelect("schedule_subject.class_course", "classCourse_id")
      .leftJoinAndSelect("schedule_subject.schedule", "schedule_id")
      .where(
        "schedule_subject.classCourse_id = :classCourse_id and schedule_subject.schedule_id = :schedule_id",
        {
          classCourse_id: classCourse_id,
          schedule_id: id_2,
        }
      )
      .getOne();
    const room = await AppDataSource.getRepository(ScheduleSubject)
      .createQueryBuilder("schedule_subject")
      .leftJoinAndSelect("schedule_subject.room", "room_id")
      .leftJoinAndSelect("schedule_subject.schedule", "schedule_id")
      .where(
        "schedule_subject.room_id = :room_id and schedule_subject.schedule_id = :schedule_id",
        {
          room_id: room_id,
          schedule_id: id_2,
        }
      )
      .getOne();
    if (
      class_course ||
      startDate === "" ||
      endDate === "" ||
      period_number === ""
    ) {
      req.flash("error", "Lớp học phần đã được thêm vào thời khóa biểu");
      res.redirect("/schedule/schedule_addSSubject/" + id_2);
    } else if (room) {
      req.flash("error", "Phòng học  đã được thêm vào thời khóa biểu");
      res.redirect("/schedule/schedule_addSSubject/" + id_2);
    } else {
      const addSchedule = await AppDataSource.createQueryBuilder()
        .insert()
        .into(ScheduleSubject)
        .values({
          room: room_id,
          class_course: classCourse_id,
          schedule: id,
          startDate: startDate,
          endDate: endDate,
          period_number: period_number,
        })
        .execute();
      req.flash("success", "Thêm thời khóa biểu cho lớp học phần thành công");
      res.redirect("/admin/schedule_list");
    }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};
