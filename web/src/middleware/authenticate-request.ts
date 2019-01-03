import { getHandleByJwt } from '../caches/jwt-cache';
import config from 'config/common';
import logger from 'common/logger';

function redirect(ctx) {
  ctx.status = 307;
  ctx.redirect(`/id?redirectTo=${encodeURIComponent(ctx.originalUrl)}`);
  return;
}

export default async function(ctx, next) {
  try {
    const jwt = ctx.cookies.get(config.identity.cookieName);

    if (!jwt) {
      return redirect(ctx);
    }

    const handle: string | null = await getHandleByJwt(jwt);

    if (handle === null) {
      return redirect(ctx);
    }

    ctx.handle = handle;
  } catch (error) {
    logger.error(error);
    ctx.throw(500);
  }

  await next();
}
