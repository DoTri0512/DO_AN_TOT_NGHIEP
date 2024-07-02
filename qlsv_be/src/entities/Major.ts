import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  JoinColumn,
} from "typeorm";
import { Departments } from "./Department";
import { Classes } from "./Class";
import { Subjects } from "./Subject";
import { Students } from "./Student";
import { Lecturers } from "./Lecturer";
@Entity()
export class Majors {
  @PrimaryColumn()
  id: string;
  @Column()
  major_name: string;
  @ManyToOne(() => Departments, (department) => department.major)
  // department: Departments;
  @JoinColumn({ name: "department_id" })
  department: Departments;
  @OneToMany(() => Classes, (classes) => classes.major)
  classes: Classes[];
  @OneToMany(() => Students, (student) => student.major)
  student: Students[];
  @OneToMany(() => Lecturers, (lecturer) => lecturer.major)
  lecturer: Lecturers[];
}
