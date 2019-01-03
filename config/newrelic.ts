import env from './env';
import { isString } from 'util';

function getAppName(envParam: string | undefined): string[] {
  return isString(envParam) ? envParam.split(',') : [];
}

export default {
  license: env.NEW_RELIC_LICENSE_KEY,
  isEnabled:
    env.NEW_RELIC_IS_ENABLED &&
    env.NEW_RELIC_IS_ENABLED.toLowerCase() === 'true',
  web: {
    appName: getAppName(env.NEW_RELIC_APP_NAME_WEB_APP),
    logging: {
      level: env.NEW_RELIC_LOG_LEVEL_WEB_APP
    }
  },
  externalApi: {
    appName: getAppName(env.NEW_RELIC_APP_NAME_EXTERNAL_API),
    logging: {
      level: env.NEW_RELIC_LOG_LEVEL_EXTERNAL_API
    }
  },
  listeners: {
    appName: getAppName(env.NEW_RELIC_APP_NAME_LISTENERS),
    logging: {
      level: env.NEW_RELIC_LOG_LEVEL_LISTENERS
    }
  }
};
