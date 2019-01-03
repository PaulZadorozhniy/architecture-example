import { pick } from 'lodash';
import { identity } from 'common/test/helpers/api-wrappers';

export default async function authenticateUser(
  username: string,
  password: string
): Promise<{ jwt: string; handle: string }> {
  const { data: userData } = await identity.post('/authenticate', {
    username,
    password
  });

  return pick(userData, ['handle', 'jwt']);
}
