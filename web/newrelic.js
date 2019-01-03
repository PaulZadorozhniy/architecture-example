const config = require('../config/newrelic').default;

exports.config = {
  app_name: config.web.appName,
  license: config.license,
  logging: config.web.logging,
  enabled: true
};
