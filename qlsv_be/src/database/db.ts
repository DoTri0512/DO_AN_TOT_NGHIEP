import { DataSource } from "typeorm";
export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "123456",
  database: "quan_ly_sinh_vien",
  synchronize: true,
  logging: true,
  entities: ["src/entities/*.ts"],
  subscribers: [],
  migrations: [],
});
