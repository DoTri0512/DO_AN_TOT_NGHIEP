import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  JoinColumn,
} from "typeorm";

import { ScheduleSubject } from "./ScheduleSubject";
@Entity()
export class Schedules {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  day: number;
  @Column()
  start_period: string;
  @Column()
  end_period: string;
  @Column()
  startTime: string;
  @Column()
  endTime: string;
  @OneToMany(
    () => ScheduleSubject,
    (schedule_subject) => schedule_subject.schedule
  )
  schedule_subject: ScheduleSubject[];
  // @ManyToOne(() => Periods, (period) => period.schedule)
  // period: Periods;
}
