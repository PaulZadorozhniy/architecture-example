import { getAccountByHandle } from '../caches/account-cache';
import logger from 'common/logger';

export default async function getAccountInfoByHandle(ctx, next) {
  try {
    const { firstName, email } = await getAccountByHandle(ctx.handle);

    ctx.firstName = firstName;
    ctx.email = email;
  } catch (error) {
    logger.error(error);
    ctx.throw(500);
  }

  await next();
}
