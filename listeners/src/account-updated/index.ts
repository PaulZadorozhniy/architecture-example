import rabbit from 'common/rabbit';
import handleMessage from './handler';
const exchange = 'ps.identity.account-updated.v1';

export default async function() {
  await rabbit.subscribe(exchange, handleMessage);
}
