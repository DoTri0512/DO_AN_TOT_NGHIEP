import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { Students } from "./Student";
@Entity("conduct_score")
export class Conduct_Scores {
  @PrimaryGeneratedColumn()
  id: number;
  @Column("double")
  conduct_score: number;
  @ManyToOne(() => Students, (student) => student.conduct_score)
  student: Students;
}
