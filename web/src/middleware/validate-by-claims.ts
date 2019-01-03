import { getClaimsByHandle } from '../caches/user-claims-cache';
import config from 'config/common';
import logger from 'common/logger';

export default async function(ctx, next) {
  if (ctx.handle) {
    let userClaims;

    try {
      userClaims = await getClaimsByHandle(ctx.handle);
    } catch (error) {
      logger.error(error);
      return ctx.throw(500);
    }

    if (!userClaims.some(claim => config.allowedClaims.includes(claim))) {
      return ctx.throw(403);
    }
  }

  await next();
}
