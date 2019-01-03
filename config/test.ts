import env from './env';
import toSafeObject from 'common/utils/to-safe-object';

const config = toSafeObject({
  userWithClaims: {
    username: env.TEST_USER_WITH_CLAIMS_USERNAME,
    password: env.TEST_USER_WITH_CLAIMS_PASSWORD,
    email: env.TEST_USER_WITH_CLAIMS_EMAIL
  },
  userWithoutClaims: {
    username: env.TEST_USER_WITHOUT_CLAIMS_USERNAME,
    password: env.TEST_USER_WITHOUT_CLAIMS_PASSWORD
  }
});

export default config;
