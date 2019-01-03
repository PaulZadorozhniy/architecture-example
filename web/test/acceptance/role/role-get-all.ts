import roleRepository from 'common/db/repositories/role';
import { assert } from 'chai';
import generateRole from 'common/test/fixtures/role';
import IRole from 'common/entities/role';
import { times } from 'lodash';
import webConfig from 'config/web';
import { getClient } from 'web/test/helpers/http-client';

describe('GET ALL', () => {
  let roles: IRole[];
  let client;

  before(() => {
    client = getClient();
  });

  beforeEach(() => {
    roles = times(5, () => generateRole());
    return Promise.all(roles.map(role => roleRepository.create(role)));
  });

  it('responds with all roles', async () => {
    const response = await client.get(webConfig.routes.role, {});

    assert.isArray(response.data);
    assert.isNotEmpty(response.data);
    response.data.forEach(role =>
      assert.hasAllKeys(role, ['id', 'name', 'baseRole'])
    );
  });

  afterEach(() => roleRepository.removeArray(roles.map(role => role.id)));
});
