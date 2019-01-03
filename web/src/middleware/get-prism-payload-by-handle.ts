import { getPayloadByHandle } from '../caches/prism-cache';
import logger from 'common/logger';

export default async function(ctx, next) {
  try {
    const prismPayload = await getPayloadByHandle(ctx.handle);

    ctx.prismPayload = prismPayload.payload;
  } catch (error) {
    logger.error(error);
    ctx.throw(500);
  }

  await next();
}
