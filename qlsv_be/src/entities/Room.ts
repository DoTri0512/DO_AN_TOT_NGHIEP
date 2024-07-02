import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  JoinColumn,
} from "typeorm";

import { Classes } from "./Class";
import { Schedules } from "./Schedule";
import { Enrollments } from "./Enrollment";
import { Exams } from "./Exam";
import { ScheduleSubject } from "./ScheduleSubject";
@Entity()
export class Rooms {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  room_name: string;
  @OneToMany(() => ScheduleSubject, (schedule_subject) => schedule_subject.room)
  schedule_subject: ScheduleSubject[];
  @OneToMany(() => Exams, (exam) => exam.room)
  exam: Exams[];
}
