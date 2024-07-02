import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Majors } from "./Major";
import { Departments } from "./Department";
// import { Courses } from "./Course";
import { Classes } from "./Class";
import { Enrollments } from "./Enrollment";
import { Grades_Subjects } from "./Grades_Subjects";
import { Conduct_Scores } from "./Conduct_Scores";
import { Exams } from "./Exam";
import { ExamStudent } from "./ExamStudent";
@Entity()
export class Students {
  @PrimaryColumn()
  id: string;
  @Column()
  firstName: string;
  @Column()
  lastName: string;
  @Column()
  fullName: string;
  @Column()
  birthDate: Date;
  @Column()
  address: string;
  @Column()
  phoneNumber: string;
  @Column()
  email: string;
  @Column()
  gender: string;
  @Column()
  country: string;
  @Column()
  citizenID: string;
  @Column()
  nation: string;
  @Column()
  year_of_admission: Date;
  @Column()
  year_of_starting_admission: Date;
  @Column()
  fullNameFather: string;
  @Column()
  phoneNumberFather: string;
  @Column()
  fullNameMother: string;
  @Column()
  phoneNumberMother: string;
  @ManyToOne(() => Departments, (department) => department.student)
  department: Departments;
  @ManyToOne(() => Majors, (major) => major.student)
  major: Majors;
  @ManyToOne(() => Classes, (classes) => classes.student)
  classes: Classes;
  @OneToMany(() => Enrollments, (enrollment) => enrollment.student)
  enrollment: Enrollments[];
  @OneToMany(() => Grades_Subjects, (grade_subject) => grade_subject.student)
  grade_subject: Grades_Subjects[];
  @OneToMany(() => Conduct_Scores, (conduct_score) => conduct_score.student)
  conduct_score: Conduct_Scores[];
  @Column()
  img_student: string;
  @OneToMany(() => ExamStudent, (examStudent) => examStudent.student)
  examStudent: ExamStudent[];
}
