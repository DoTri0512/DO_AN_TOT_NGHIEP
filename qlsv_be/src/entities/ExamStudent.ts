import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  JoinColumn,
} from "typeorm";
import { Schedules } from "./Schedule";
import { Exams } from "./Exam";
import { Students } from "./Student";
@Entity("exam_student")
export class ExamStudent {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  enrollmentNumber: number; // Cột số báo danh
  @ManyToOne(() => Exams, (exam) => exam.examStudent)
  @JoinColumn({ name: "exam_id" })
  exam: Exams;
  @ManyToOne(() => Students, (student) => student.examStudent)
  @JoinColumn({ name: "student_id" })
  student: Students;
}
