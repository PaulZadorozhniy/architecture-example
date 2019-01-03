import apiTokenRepository from 'common/db/repositories/api-token';
import { isString } from 'lodash';

export default function apiTokenVerification() {
  return async (ctx, next) => {
    const apiTokenHeader = ctx.request.headers.authorization;

    if (
      !apiTokenHeader ||
      !isString(apiTokenHeader) ||
      apiTokenHeader.length < 8
    ) {
      return ctx.throw(401);
    }

    // remove "Bearer "
    const token = apiTokenHeader.substring(7);
    const apiTokenRecord = await apiTokenRepository.get({ token });

    if (!apiTokenRecord) {
      return ctx.throw(401);
    }

    await next();
  };
}
