import logger from './logging';
import { queueConfig, rabbitConfig } from './messaging';
import env from './env';

export default {
  logger,
  rabbitConfig,
  queueConfig,
  mainApiToken: env.MAIN_API_TOKEN,
  mainApiUrl: env.MAIN_API_URL
};
