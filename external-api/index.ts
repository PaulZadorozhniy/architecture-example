import './src/newrelic-initialization';
import config from 'config/external-api';
import app from './src/app';
import logger from 'common/logger';

app.listen(config.port, () => {
  logger.info('listening on port ' + config.port); // eslint-disable-line no-console
});

process.on('unhandledRejection', error => {
  logger.fatal({
    message: 'ExternalApi unhandledRejection error',
    data: {},
    error
  });
});

process.on('uncaughtException', error => {
  logger.fatal({
    message: 'ExternalApi uncaughtException error',
    data: {},
    error
  });
});
