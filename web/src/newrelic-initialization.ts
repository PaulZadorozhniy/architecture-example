import config from 'config/newrelic';

if (config.isEnabled) {
  // tslint:disable-next-line
  require('newrelic');
}
