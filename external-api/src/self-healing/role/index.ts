import config from 'config/external-api';
import Router from 'koa-router';
import getRoleHandler from './get-handler';

const router = new Router({ prefix: config.routes.role });

router.get('/:id', getRoleHandler);

export default router;
