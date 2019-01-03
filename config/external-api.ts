import env from './env';
import toSafeObject from 'common/utils/to-safe-object';

const config = toSafeObject({
  appName: 'curriculum-external-api',
  env: env.NODE_ENV,
  port: env.API_PORT,
  host: env.API_HOST,
  protocol: env.API_PROTOCOL,
  routes: {
    healthCheck: '/curriculum/api/system/health-check',
    skill: '/curriculum/api/v1/role/:roleId/skill',
    role: '/curriculum/api/v1/role/',
  }
});

export default config;
