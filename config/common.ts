import toSafeObject from 'common/utils/to-safe-object';
import env from './env';

const config = toSafeObject({
  allowedClaims: ['employee-developer-unknowns', 'employee-curriculum'],
  identity: {
    apiUrl: env.IDENTITY_API_URL,
    apiKey: env.IDENTITY_API_KEY,
    cookieName: env.JWT_COOKIE_NAME
  },
  prism: {
    apiUrl: env.PRISM_API_URL,
    apiKey: env.PRISM_API_KEY,
    notificationsScriptUrl: env.PRISM_NOTIFICATIONS_SCRIPT_URL
  },
  dvs: {
    ingestBaseUrl: env.DVS_PUBLISH_URL,
    replicateUrl: env.DVS_SUBSCRIBE_URL
  }
});

export default config;
