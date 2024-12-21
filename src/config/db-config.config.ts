import { registerAs } from '@nestjs/config';

export default registerAs('database', async () => {
  return {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database:
      process.env.STAGE === 'local'
        ? process.env.DB_NAME_DEV
        : process.env.DB_NAME,
  };
});
