import config from 'config/web';
import Router from 'koa-router';
import { getAllHandler } from './get-all-handler';

const router = new Router({ prefix: config.routes.account });

router.get('/', getAllHandler);

export default router;
