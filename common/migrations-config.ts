import dbConfig from 'config/database';

const {
  type,
  host,
  port,
  username,
  password,
  database,
  synchronize,
  logging,
  ssl
} = dbConfig;

const entities = ['db/models/*.ts'];
const migrations = ['db/migrations/**/*.ts'];
const cli = {
  migrationsDir: 'db/migrations'
};

export {
  type,
  host,
  port,
  username,
  password,
  database,
  synchronize,
  logging,
  entities,
  migrations,
  cli,
  ssl
};
