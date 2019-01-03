import * as bunyan from 'bunyan';
import * as fs from 'fs';
import * as path from 'path';
import accessLog from 'access-log';
import * as os from 'os';
import config from 'config/logging';

function create(): any {
  if (!config.logDir) {
    throw new Error('The logDir is required for the logger config.');
  }
  if (!config.logLevel) {
    throw new Error('The logLevel is required for the logger config.');
  }
  if (!config.logFileName) {
    throw new Error('The logFileName is required for the logger config.');
  }

  if (process.env.NODE_ENV !== 'test') {
    try {
      fs.statSync(config.logDir);
    } catch (e) {
      fs.mkdirSync(config.logDir);
    }
  }

  const logLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
  const loggers: any = {};

  logLevels.forEach(level => {
    const stream: any = { level };

    if (level !== 'debug' && process.env.NODE_ENV !== 'test') {
      stream.path = path.join(
        config.logDir,
        `${config.logFileName}-${level}.log`
      );
    } else {
      stream.stream = process.stdout;
    }

    const logger = bunyan.createLogger({
      name: config.logFileName.replace('.log', ''),
      serializers: { err: bunyan.stdSerializers.err },
      streams: [stream]
    });

    loggers[level] = (msg, error = '') => {
      logger[level](msg, error);
      if (config.logDebug === true && level !== 'debug') {
        loggers.debug(msg, error);
      }
    };
  });

  const logWriteStream = fs.createWriteStream(
    path.join(config.logDir, 'api-access.log'),
    {
      flags: 'a',
      encoding: 'utf8'
    }
  );

  logWriteStream.on('error', loggers.error);

  // API access log
  loggers.accessLog = (req, res) => {
    const user = req.apiTokenObject ? req.apiTokenObject.client : '-';
    const format = `:host - :Xip - ${user} [:clfDate] ":method :url :protocol/:httpVersion" :statusCode :contentLength`;

    accessLog(req, res, format, logMessage => {
      logWriteStream.write(`${logMessage}${os.EOL}`);
      if (config.logDebug === true) {
        loggers.debug(`${logMessage}${os.EOL}`);
      }
    });
  };

  return loggers;
}

export default create();
