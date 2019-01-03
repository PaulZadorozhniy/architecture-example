import config from 'config/external-api';
import { assert } from 'chai';
import { omit } from 'lodash';
import roleRepository from 'common/db/repositories/role';
import generateRole from 'common/test/fixtures/role';
import IRole from 'common/entities/role';
import { getClient } from 'external-api/test/helpers/http-client';

describe('GET', () => {
  let client;
  let role: IRole;

  before(() => {
    client = getClient();
  });

  beforeEach(async () => {
    role = generateRole();
    await roleRepository.create(role);
  });

  it('responds with terminal objective by id', async () => {
    const response = await client.get(`${config.routes.role}/${role.id}`);

    assert.strictEqual(response.status, 200);
    assert.hasAllKeys(response.data, [
      'id',
      'name',
      'baseRole',
      'createdAt',
      'updatedAt'
    ]);
    assert.deepEqual(omit(response.data, ['updatedAt', 'createdAt']), role);
  });

  afterEach(async () => {
    await roleRepository.remove(role.id);
  });
});
