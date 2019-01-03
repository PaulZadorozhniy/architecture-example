import config from 'config/external-api';

const { port, env, host, protocol } = config;

const baseURL =
  env === 'development'
    ? `${protocol}://${host}:${port}`
    : `${protocol}://${host}`;

export default baseURL;
