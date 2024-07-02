import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Subjects } from "./Subject";
import { Rooms } from "./Room";
import { Students } from "./Student";
import { ExamStudent } from "./ExamStudent";
@Entity()
export class Exams {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  day: Date;
  @Column()
  exam_period: string;
  @Column()
  start_period: string;
  @Column()
  end_period: string;
  @Column()
  startTime: string;
  @Column()
  endTime: string;
  @ManyToOne(() => Rooms, (room) => room.exam)
  room: Rooms;
  @ManyToOne(() => Subjects, (subject) => subject.exam)
  @JoinColumn({ name: "subject_id" })
  subject: Subjects;
  @OneToMany(() => ExamStudent, (examStudent) => examStudent.exam)
  examStudent: ExamStudent[];
}
