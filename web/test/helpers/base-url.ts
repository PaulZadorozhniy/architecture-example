import config from 'config/web';

const { port, env, host, protocol } = config;

const baseURL =
  env === 'development'
    ? `${protocol}://${host}:${port}`
    : `${protocol}://${host}`;

export default baseURL;
