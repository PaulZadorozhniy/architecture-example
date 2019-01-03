import terminateProcess from '../utils/terminate-process';

export default function gracefulShutdown(logger) {
  logger.info('Attempting graceful shutdown...');

  //TODO: uncomment when Newrelic will be added:
  // await shutdownNewrelic();
  terminateProcess(0);
};
