import testConfig from 'config/test';
import { createAuthedWebServerWrapper } from './request-wrappers';

let client;

async function authenticate() {
  const { username, password } = testConfig.userWithClaims;

  client = await createAuthedWebServerWrapper(username, password);
}

function getClient() {
  if (client === undefined) {
    throw new Error('You are not authenticated');
  }
  return client;
}

export { authenticate, getClient };
