import config from 'config/newrelic';

export default {
  app_name: config.listeners.appName,
  license: config.license,
  logging: config.listeners.logging,
  capture_params: true
};
