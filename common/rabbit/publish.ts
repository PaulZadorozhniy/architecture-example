import { createPublisherConnection } from '../rabbit/create-channel';

export const publishToExchange = async function(exchangeName, data) {
  const channel = await createPublisherConnection();

  await channel.publish(exchangeName, '', Buffer.from(JSON.stringify(data)));
};

export const publishToChannel = function(
  channel,
  queueName,
  message,
  waitTime
) {
  if (!waitTime) {
    channel.sendToQueue(queueName, message.content, message.properties);
  } else {
    setTimeout(() => {
      channel.sendToQueue(queueName, message.content, message.properties);
    }, waitTime);
  }
};
