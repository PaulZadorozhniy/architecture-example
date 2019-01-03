import env from './env';

export const rabbitConfig = {
  publisherHosts: env.RABBIT_PUBLISHER_HOSTS,
  subscriberHosts: env.RABBIT_SUBSCRIBER_HOSTS,
  username: env.RABBIT_USERNAME,
  password: env.RABBIT_PASSWORD,
  queueManagerBaseUrl: env.QUEUE_MANAGER_BASE_URL,
  maxRetries: 5,
  backOffInterval: 1000,
  listenerName: 'ps.curriculum.listener',
  exchanges: {
    skillUpdated: 'architecture.example.skill-updated.v1',
    roleUpdated: 'architecture.example.role-updated.v1'
  }
};

export const queueConfig = {
  organization: 'architecture',
  context: 'example',
  application: 'listener',
  createDeadLetterQueue: true,
  alertThreshold: 1000,
  deadLetterAlertThreshold: 100,
  teamsToAlert: ['TheBestTeam']
};

export default { rabbitConfig, queueConfig };
