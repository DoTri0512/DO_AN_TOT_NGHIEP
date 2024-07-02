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
@Entity("grades_subjects")
export class Grades_Subjects {
  @PrimaryGeneratedColumn()
  id: string;
  @Column("double")
  exam_score: number;
  @ManyToOne(() => Students, (student) => student.grade_subject)
  student: Students;
  @ManyToOne(() => Subjects, (subject) => subject.grade_subject)
  subject: Subjects;
}
