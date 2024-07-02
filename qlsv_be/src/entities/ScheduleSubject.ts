import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  JoinColumn,
} from "typeorm";
import { Rooms } from "./Room";
import { Class_Course } from "./Class_Course";
import { Schedules } from "./Schedule";
@Entity("schedule_subject")
export class ScheduleSubject {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  startDate: Date;
  @Column()
  endDate: Date;
  @Column()
  period_number: number;
  @ManyToOne(() => Rooms, (room) => room.schedule_subject)
  @JoinColumn({ name: "room_id" })
  room: Rooms;
  @ManyToOne(
    () => Class_Course,
    (class_course) => class_course.schedule_subject
  )
  @JoinColumn({ name: "classCourse_id" })
  class_course: Class_Course;
  @ManyToOne(() => Schedules, (schedule) => schedule.schedule_subject)
  @JoinColumn({ name: "schedule_id" })
  schedule: Schedules;
}
