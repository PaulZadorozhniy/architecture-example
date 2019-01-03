import Koa from 'koa';
import system from './system';
import enablingObjective from './self-healing/enabling-objective';
import terminalObjective from './self-healing/terminal-objective';
import skill from './self-healing/skill';
import role from './self-healing/role';
import apiToken from './self-healing/api-token';
import bodyParser from 'koa-body';
import apiTokenVerification from './middleware/api-token-verification';

const app = new Koa();

app
  .use(bodyParser())
  .use(apiToken.routes())
  .use(system.routes())
  .use(apiTokenVerification())
  .use(role.routes())
  .use(skill.routes())
  .use(terminalObjective.routes())
  .use(enablingObjective.routes());

export default app;
