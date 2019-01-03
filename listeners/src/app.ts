import './newrelic-initialization';
import logger from 'common/logger';
import {
  bindToHardTermination,
  bindToSoftTermination
} from '../../common/system-event-handlers';
import subscribeToAccountClosed from './account-closed';
import subscribeToAccountUpdated from './account-updated';

logger.info('Starting listener...');

// Bind to process events
bindToHardTermination(logger);
bindToSoftTermination(logger);

// Message Subsribers
subscribeToAccountClosed();
subscribeToAccountUpdated();
