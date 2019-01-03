import { assert } from 'chai';
import config from 'config/external-api';
import { getClient } from 'external-api/test/helpers/http-client';

describe('Health check', () => {
  let client;

  before(() => {
    client = getClient();
  });

  it('should respond with 200', async () => {
    const res = await client.get(config.routes.healthCheck);

    assert.equal(res.status, 200);
  });
});
