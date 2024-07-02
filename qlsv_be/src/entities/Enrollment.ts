import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { Students } from "./Student";
import { Subjects } from "./Subject";
import { Schedules } from "./Schedule";
import { Rooms } from "./Room";
import { Classes } from "./Class";
import { Class_Course } from "./Class_Course";
@Entity()
export class Enrollments {
  @PrimaryGeneratedColumn()
  id: string;
  // @Column()
  // enrollment_date: Date;
  // @Column()
  // startDate: Date;
  // @Column()
  // endDate: Date;
  @ManyToOne(() => Students, (student) => student.enrollment)
  student: Students;
  @ManyToOne(() => Class_Course, (class_course) => class_course.enrollment)
  class_course: Class_Course;
}
