import roleRepository from 'common/db/repositories/role';
import { assert } from 'chai';
import * as faker from 'faker';
import generateRole from 'common/test/fixtures/role';
import webConfig from 'config/web';
import { RoleModel } from 'common/db/models/role';
import { getClient } from 'web/test/helpers/http-client';

describe('CREATE', () => {
  let client;

  before(() => {
    client = getClient();
  });

  context('valid input', () => {
    let name: string;
    let requestData;
    let roleId: string;
    let baseRole: RoleModel;

    beforeEach(async () => {
      baseRole = await roleRepository.create(generateRole());
      name = faker.random.word();
      requestData = { name, baseRole: baseRole.id };
    });

    it('responds with status 201 and the id of the created Role', async () => {
      const { data, status } = await client.post(
        webConfig.routes.role,
        requestData
      );
      assert.strictEqual(status, 201);
      assert.hasAllKeys(data, ['id']);
      assert.isString(data.id);

      roleId = data.id;
    });

    it('creates a role in DB', async () => {
      const { data } = await client.post(webConfig.routes.role, requestData);

      const record = await roleRepository.get(data.id);
      roleId = data.id;
      assert.ok(record);
    });

    afterEach(async () => {
      await roleRepository.remove(roleId);
      await roleRepository.remove(baseRole.id);
    });
  });

  context('invalid request data', () => {
    context('request data missing required fields', () => {
      it('responds with status 400', async () => {
        const { status } = await client.post(
          webConfig.routes.role,
          {},
          {
            validateStatus: () => true
          }
        );

        assert.strictEqual(status, 400);
      });
    });

    context('non-existing base role', () => {
      it('responds with status 400', async () => {
        const { status } = await client.post(
          webConfig.routes.role,
          { name: faker.random.word(), baseRole: faker.random.uuid() },
          {
            validateStatus: () => true
          }
        );

        assert.strictEqual(status, 400);
      });
    });

    context('invalid types of properties', () => {
      it('responds with status 400', async () => {
        const { status } = await client.post(
          webConfig.routes.role,
          { name: faker.random.boolean(), baseRole: faker.random.word() },
          {
            validateStatus: () => true
          }
        );

        assert.strictEqual(status, 400);
      });
    });
  });
});
