import handleUncaughtError from './handle-uncaught-error';
import gracefulShutdown from './graceful-shutdown';

export const bindToHardTermination = function(logger) {
  process.on('uncaughtException', err => handleUncaughtError(logger, err));
  process.on('unhandledRejection', err => handleUncaughtError(logger, err));
};

export const bindToSoftTermination = function(logger) {
  process.on('SIGINT', () => gracefulShutdown(logger));
  process.on('SIGTERM', () => gracefulShutdown(logger));
};
