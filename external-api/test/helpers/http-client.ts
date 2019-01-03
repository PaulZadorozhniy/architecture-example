import { createServerWrapper } from 'external-api/test/helpers/request-wrapper';

let client;

async function authenticate() {
  client = await createServerWrapper();
}

function getClient() {
  if (client === undefined) {
    throw new Error('You are not authenticated');
  }
  return client;
}

export { authenticate, getClient };
