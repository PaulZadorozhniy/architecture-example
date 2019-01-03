import Router from 'koa-router';
import config from 'config/external-api';

const router = new Router({ prefix: config.routes.healthCheck });

router.get('/', ctx => {
  ctx.body = 'Service Works';
  ctx.status = 200;
});

export default router;
