import axios from 'axios';
import { assert } from 'chai';
import webConfig from 'config/web';

const { port, routes, env, host, protocol } = webConfig;

const baseURL =
  env === 'development'
    ? `${protocol}://${host}:${port}`
    : `${protocol}://${host}`;

const requestWrapper = axios.create({
  baseURL,
  maxRedirects: 0
});

it('should respond with 200', async () => {
  const res = await requestWrapper.get(routes.healthCheck);

  assert.equal(res.status, 200);
});
