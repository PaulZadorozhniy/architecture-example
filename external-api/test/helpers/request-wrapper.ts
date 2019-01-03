import axios from 'axios';
import baseURL from './base-url';
import config from 'config/external-api';

export async function createServerWrapper() {
  const { data } = await axios.post(`${baseURL}${config.routes.apiToken}`, {
    client: 'curriculum-acceptance-test'
  });

  const { token } = data;

  return axios.create({
    baseURL,
    maxRedirects: 0,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
