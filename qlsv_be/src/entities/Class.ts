import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  PrimaryColumn,
  OneToMany,
} from "typeorm";
import { Departments } from "./Department";
import { Majors } from "./Major";
import { Students } from "./Student";
import { Lecturers } from "./Lecturer";
import { Schedules } from "./Schedule";
import { Enrollments } from "./Enrollment";
import { ScheduleSubject } from "./ScheduleSubject";
@Entity()
export class Classes {
  @PrimaryColumn()
  id: string;

  @Column()
  class_name: string;
  @ManyToOne(() => Departments, (department) => department.classes)
  department: Departments;
  @ManyToOne(() => Majors, (major) => major.classes)
  major: Majors;
  @OneToMany(() => Students, (student) => student.classes)
  student: Students[];
}
