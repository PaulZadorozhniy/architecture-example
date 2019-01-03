import logger from '../logger';
import createQueue from './create-queue';

export default async function assertQueue(queue, connection) {
  const channel = await connection.createChannel();

  await channel
    .on('error', () => logger.info(`Queue with name "${queue.queueName}" did not exist, creating...`))
    .checkQueue(queue.queueName)
    .catch(async () => await createQueue(queue.exchangeName));
};