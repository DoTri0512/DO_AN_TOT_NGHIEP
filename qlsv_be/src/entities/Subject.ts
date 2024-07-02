import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  PrimaryColumn,
  OneToMany,
  JoinTable,
  ManyToMany,
  JoinColumn,
} from "typeorm";
import { Enrollments } from "./Enrollment";
import { Grades_Subjects } from "./Grades_Subjects";
// import { Courses } from "./Course";
import { Exams } from "./Exam";
import { ScheduleSubject } from "./ScheduleSubject";
import { Class_Course } from "./Class_Course";
import { Departments } from "./Department";
import { Subject_Department } from "./Subject_Department";
@Entity()
export class Subjects {
  @PrimaryColumn()
  id: string;
  @Column()
  subject_name: string;
  @Column()
  credits: number;
  @OneToMany(() => Grades_Subjects, (grade_subject) => grade_subject.subject)
  grade_subject: Grades_Subjects[];
  @OneToMany(() => Exams, (exam) => exam.subject)
  exam: Exams[];
  @OneToMany(() => Class_Course, (class_course) => class_course.subject)
  class_course: Class_Course[];

  @OneToMany(
    () => Subject_Department,
    (subject_department) => subject_department.subject
  )
  subject_department: Subject_Department[];
}
