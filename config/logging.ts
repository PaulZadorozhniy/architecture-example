import env from './env';

export default {
  logDebug: env.LOG_DEBUG!.toLowerCase().trim() === 'true',
  logLevel: env.LOG_LEVEL!,
  logDir: env.LOG_DIR!,
  logFileName: env.LOG_FILE_NAME!
};
