import Router from 'koa-router';
const router = new Router();

router.get('/curriculum/system/health-check', ctx => {
  ctx.body = 'Service Works';
  ctx.status = 200;
});

export default router;
