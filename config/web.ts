import env from './env';
import logger from './logging';
import { queueConfig, rabbitConfig } from './messaging';
import toSafeObject from 'common/utils/to-safe-object';

const config = toSafeObject({
  logger,
  rabbitConfig,
  queueConfig,
  appName: 'architecture-example-web',
  env: env.NODE_ENV,
  port: env.WEB_PORT,
  host: env.WEB_HOST,
  protocol: env.WEB_PROTOCOL,
  ttl: {
    jwt: parseInt(env.JWT_TTL!)
  },
  routes: {
    healthCheck: '/architecture-example/system/health-check/',
    index: '/architecture-example',
    role: '/architecture-example/api/v1/role',
    skill: '/architecture-example/api/v1/role/:roleId/skill',
    account: '/architecture-example/api/v1/account'
  }
});

export default config;
