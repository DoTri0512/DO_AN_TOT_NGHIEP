import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from "typeorm";
import { Majors } from "./Major";
import { Classes } from "./Class";
import { Subjects } from "./Subject";
import { Students } from "./Student";
import { Lecturers } from "./Lecturer";
import { Subject_Department } from "./Subject_Department";
@Entity()
export class Departments {
  @PrimaryColumn()
  id: string;
  @Column()
  department_name: string;
  @OneToMany(() => Majors, (major) => major.department)
  major: Majors[];
  @OneToMany(() => Classes, (classes) => classes.department)
  classes: Classes[];
  @OneToMany(() => Students, (student) => student.department)
  student: Students[];
  @OneToMany(() => Lecturers, (lecturer) => lecturer.department)
  lecturer: Lecturers[];
  @OneToMany(
    () => Subject_Department,
    (subject_department) => subject_department.department
  )
  subject_department: Subject_Department[];
}
