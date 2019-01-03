import rabbit from 'common/rabbit';
import handleMessage from './handler';

const exchange = 'ps.identity.account-closed.v1';

export default async () => {
  await rabbit.subscribe(exchange, handleMessage);
};