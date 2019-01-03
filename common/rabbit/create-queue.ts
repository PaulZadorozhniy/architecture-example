import axios from 'axios';
import urlJoin from 'url-join';
import { rabbitConfig, queueConfig } from 'config/messaging';

export default async function createQueue(exchangeName) {
  const url = urlJoin(
    rabbitConfig.queueManagerBaseUrl,
    'exchanges',
    encodeURIComponent(exchangeName),
    'queues'
  );

  return axios.post(url, { ...queueConfig, exchangeName });
}
