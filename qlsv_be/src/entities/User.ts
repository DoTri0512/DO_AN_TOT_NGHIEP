import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Column,
} from "typeorm";
import { Students } from "./Student";
@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  username: string;
  @Column()
  password: string;
  @Column()
  role: number;
  @OneToOne(() => Students)
  @JoinColumn()
  student: Students;
}
