import * as fs from 'fs';
import * as path from 'path';

import env from './env';

const config: any = {
  database: env.DB_DATABASE,
  host: env.DB_HOST,
  logging: false,
  username: env.DB_USER_NAME,
  password: env.DB_PASSWORD,
  port: env.DB_PORT,
  synchronize: false,
  type: 'postgres',
  entities: [path.normalize(`${__dirname}/../common/db/models/**/*.ts`)],
  migrations: ['common/db/migrations/**/*.ts'],
  cli: {
    migrationsDir: 'common/db/migrations'
  }
};

if (env.NODE_ENV !== 'development' && env.NODE_ENV !== undefined) {
  config.ssl = {
    ca: fs
      .readFileSync(
        path.normalize(`${__dirname}/../rds-combined-ca-bundle.pem`)
      )
      .toString(),
    rejectUnauthorized: false
  };
}

export default config;
