import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  PrimaryColumn,
  JoinColumn,
  OneToMany,
} from "typeorm";
// import { Courses } from "./Course";
import { ScheduleSubject } from "./ScheduleSubject";
import { Subjects } from "./Subject";
import { Enrollments } from "./Enrollment";
import { Lecturers } from "./Lecturer";
@Entity("class_course")
export class Class_Course {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  classCourse_name: string;
  @ManyToOne(() => Subjects, (subject) => subject.class_course)
  subject: Subjects;
  @OneToMany(
    () => ScheduleSubject,
    (schedule_subject) => schedule_subject.class_course
  )
  schedule_subject: ScheduleSubject[];
  @OneToMany(() => Enrollments, (enrollment) => enrollment.class_course)
  enrollment: Enrollments[];
  @ManyToOne(() => Lecturers, (lecturer) => lecturer.class_course)
  lecturer: Lecturers;
}
