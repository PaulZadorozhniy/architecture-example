import * as amqp from 'amqplib';
import logger from '../logger';
import { rabbitConfig } from 'config/messaging';
import assertQueue from './assert-queue';
import generateAmqpUrl from './generate-amqp-url';

let connection;

export const createPublisherConnection = async function() {
  await connect(rabbitConfig.publisherHosts);
  return connection.createChannel();
};

export const createSubscriberChannel = async function(queue) {
  await connect(rabbitConfig.subscriberHosts);
  await assertQueue(queue, connection);

  return connection.createChannel();
};

export const closeConnection = async function() {
  if (connection) {
    await connection.close();
    connection = null;
  }
};

async function connect(hosts) {
  if (!connection) {
    const url = generateAmqpUrl(
      hosts,
      rabbitConfig.username,
      rabbitConfig.password
    );

    connection = await amqp.connect(url);

    connection.on('close', () => {
      logger.info('Rabbit connection closed.');
    });
    connection.on('error', e => {
      logger.error(
        'Rabbit connection has error. Terminating listener process.',
        e
      );
      // Do not stop the entire app because of amqp connection error
      // process.exit(1);
    });
  }
}
