import authenticateUser from './authenticate-user';
import testConfig from 'config/test'

const { username, password } = testConfig.userWithClaims;

authenticateUser(username, password)
  .then(({ jwt }) => console.log('JWT_TOKEN =', jwt));
