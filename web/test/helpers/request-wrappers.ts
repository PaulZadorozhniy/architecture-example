import axios from 'axios';
import commonConfig from 'config/common';
import baseURL from './base-url';
import authenticate from './authenticate-user';

export const webServer = axios.create({
  baseURL,
  maxRedirects: 0
});

export async function createAuthedWebServerWrapper(
  username,
  password,
  validateStatus?
) {
  const { jwt } = await authenticate(username, password);

  return axios.create({
    baseURL,
    maxRedirects: 0,
    headers: {
      Cookie: `${commonConfig.identity.cookieName}=${jwt}`
    },
    validateStatus
  });
}
