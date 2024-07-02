import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { Majors } from "./Major";
import { Departments } from "./Department";
// import { Courses } from "./Course";
import { Classes } from "./Class";
import { Class_Course } from "./Class_Course";
@Entity()
export class Lecturers {
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
  province: string;
  @Column()
  citizenID: string;
  @Column()
  nation: string;
  @ManyToOne(() => Departments, (department) => department.lecturer)
  department: Departments;
  @ManyToOne(() => Majors, (major) => major.lecturer)
  major: Majors;
  @OneToMany(() => Class_Course, (class_course) => class_course.lecturer)
  class_course: Class_Course[];
}
