import terminateProcess from '../utils/terminate-process';

export default function handleUncaughtError(logger, error) {
  logger.fatal(error);
  //TODO: uncomment when Newrelic will be added:
  // newRelicErrorReporter(error);
  terminateProcess(1);
};
