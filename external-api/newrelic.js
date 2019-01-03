const config = require('../config/newrelic').default;

exports.config = {
  app_name: config.externalApi.appName,
  license: config.license,
  logging: config.externalApi.logging,
  enabled: true
};
