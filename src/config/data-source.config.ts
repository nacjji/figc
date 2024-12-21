import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config();
export const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database:
    process.env.STAGE === 'local'
      ? process.env.DB_NAME_DEV
      : process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  entities: ['src/**/*.entity.ts'],
  synchronize: false,
  logging: false,
});
