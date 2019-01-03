import Koa from 'koa';
import system from './system';
import role from './internal-api/role';
import skill from './internal-api/skill';
import importCsv from './internal-api/import-csv';
import account from './internal-api/account';
import bodyParser from 'koa-body';

const app = new Koa();

app
  .use(bodyParser({ multipart: false, strict: false }))
  .use(system.routes())
  .use(role.routes())
  .use(skill.routes())
  .use(importCsv.routes())
  .use(account.routes())

export default app;
