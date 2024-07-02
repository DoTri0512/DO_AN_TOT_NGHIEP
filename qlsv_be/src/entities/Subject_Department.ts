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
import { Departments } from "./Department";
import { Subjects } from "./Subject";
@Entity()
export class Subject_Department {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Subjects, (subject) => subject.subject_department)
  @JoinColumn({ name: "subject_id" })
  subject: Subjects;
  @ManyToOne(() => Departments, (department) => department.subject_department)
  @JoinColumn({ name: "department_id" })
  department: Departments;
}
