import logger from '../logger';
import { rabbitConfig } from 'config/messaging';
import { createSubscriberChannel } from './create-channel';
import { publishToChannel } from './publish';
import getMessageHeader from './get-message-header';

export default async function subscribe(
  exchangeName,
  handler,
  listenerName = rabbitConfig.listenerName
) {
  const queueName = `${exchangeName}=>${listenerName}`;
  const queue = {
    exchangeName,
    queueName,
    deadLetter: `${queueName}-dead-letter`
  };

  const channel = await createSubscriberChannel(queue);
  const consumer = await channel.consume(queue.queueName, message =>
    handleMessage(channel, queue, message, handler)
  );

  return () => {
    channel.cancel(consumer.consumerTag);
  };
}

async function handleMessage(channel, queue, message, handler) {
  const originalRetryCount =
    parseInt(getMessageHeader(message, 'retryCount')) || 0;

  try {
    channel.ack(message);
    await handler(JSON.parse(message.content.toString()));
  } catch (error) {
    logger.error(
      `Error handling rabbit message on queue: ${queue.queueName}`,
      error
    );
    const retryCount = originalRetryCount + 1;
    const sendToDeadLetter = retryCount >= rabbitConfig.maxRetries;
    const backOffTime = sendToDeadLetter
      ? 0
      : rabbitConfig.backOffInterval * retryCount;
    const queueName = sendToDeadLetter ? queue.deadLetter : queue.queueName;

    message.properties = {
      ...message.properties,
      headers: { ...message.properties.headers, retryCount }
    };

    if (sendToDeadLetter) {
      logger.error(
        `Sending rabbit message to dead letter. queue: ${
          queue.queueName
        } message: ${JSON.stringify(message)}`
      );
    }

    publishToChannel(channel, queueName, message, backOffTime);
  }
}

export { handleMessage };
