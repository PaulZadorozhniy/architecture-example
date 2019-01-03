import './src/newrelic-initialization';
import config from 'config/web';
import app from './src/app';
import logger from 'common/logger';

app.listen(config.port, () => {
  logger.info('listening on port ' + config.port); // eslint-disable-line no-console
});

process.on('unhandledRejection', error => {
  logger.fatal({ message: 'WebApp unhandledRejection error', data: {}, error });
});

process.on('uncaughtException', error => {
  logger.fatal({ message: 'WebApp uncaughtException error', data: {}, error });
});
