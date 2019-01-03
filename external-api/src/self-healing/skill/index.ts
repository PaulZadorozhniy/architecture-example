import config from 'config/external-api';
import Router from 'koa-router';
import getSkillHandler from './get-handler';

const router = new Router({ prefix: config.routes.skill });

router.get('/:id', getSkillHandler);

export default router;
