import { get } from 'lodash';
import * as faker from 'faker';
import webConfig from 'config/web';
import skillRepository from 'common/db/repositories/skill';
import roleRepository from 'common/db/repositories/role';
import roleSkillRepository from 'common/db/repositories/role-skill';
import { assert } from 'chai';
import generateRole from 'common/test/fixtures/role';
import IRole from 'common/entities/role';
import { getClient } from 'web/test/helpers/http-client';

describe('CREATE', () => {
  let client;
  let role: IRole;

  before(async () => {
    client = getClient();

    role = generateRole();
    await roleRepository.create(role);
  });

  context('valid input', () => {
    const skillName = faker.random.word();
    const isDraft = false;
    const isOptional = true;

    let response: any;

    beforeEach(async () => {
      response = await client.post(
        webConfig.routes.skill.replace(':roleId', role.id),
        {
          name: skillName,
          isDraft,
          isOptional
        }
      );
    });

    it('should respond with the created entity and status 201', async () => {
      assert.strictEqual(response.status, 201);

      assert.strictEqual(response.data.name, skillName);
      assert.strictEqual(response.data.isDraft, isDraft);
      assert.strictEqual(response.data.isOptional, isOptional);
      assert.strictEqual(response.data.roleId, role.id);
      assert.isString(response.data.updatedAt);
      assert.isString(response.data.createdAt);
    });

    it('should create a record in the database', async () => {
      const entity = skillRepository.get(response.data.id);

      assert.ok(entity);
    });

    it('should return the created skill at the GET all skills of a role endpoint', async () => {
      const skillsByRoleIdResponse = await client.get(
        webConfig.routes.skill.replace(':roleId', role.id)
      );

      assert.isNotEmpty(skillsByRoleIdResponse.data);
    });

    afterEach(async () => {
      const skillId = get(response, 'data.id');
      if (skillId) {
        await roleSkillRepository.remove(role.id, skillId);
        await skillRepository.remove(skillId);
      }
    });
  });

  context('invalid input', () => {
    context('bad role id', () => {
      let response: any;

      beforeEach(async () => {
        response = await client.post(
          webConfig.routes.skill.replace(':roleId', faker.random.uuid()),
          {
            name: faker.random.word(),
            isDraft: faker.random.boolean(),
            isOptional: faker.random.boolean()
          },
          {
            validateStatus: () => true
          }
        );
      });

      it('should respond with an empty body and status 404', async () => {
        assert.strictEqual(response.status, 404);
        assert.isEmpty(response.data);
      });
    });

    context('missing required fields', () => {
      let response: any;

      beforeEach(async () => {
        response = await client.post(
          webConfig.routes.skill.replace(':roleId', role.id),
          {},
          {
            validateStatus: () => true
          }
        );
      });

      it('should respond with status 400', async () => {
        assert.strictEqual(response.status, 400);
      });
    });

    context('bad name field', () => {
      let response: any;

      beforeEach(async () => {
        response = await client.post(
          webConfig.routes.skill.replace(':roleId', role.id),
          {
            name: faker.random.boolean(),
            isOptional: faker.random.boolean(),
            isDraft: faker.random.boolean()
          },
          {
            validateStatus: () => true
          }
        );
      });

      it('should respond with status 400', async () => {
        assert.strictEqual(response.status, 400);
      });
    });

    context('bad isDraft field', () => {
      let response: any;

      beforeEach(async () => {
        response = await client.post(
          webConfig.routes.skill.replace(':roleId', role.id),
          {
            name: faker.random.word(),
            isOptional: faker.random.boolean(),
            isDraft: faker.random.number()
          },
          {
            validateStatus: () => true
          }
        );
      });

      it('should respond with status 400', async () => {
        assert.strictEqual(response.status, 400);
      });
    });

    context('bad isOptional field', () => {
      let response: any;

      beforeEach(async () => {
        response = await client.post(
          webConfig.routes.skill.replace(':roleId', role.id),
          {
            name: faker.random.word(),
            isOptional: faker.random.number(),
            isDraft: faker.random.boolean()
          },
          {
            validateStatus: () => true
          }
        );
      });

      it('should respond with status 400', async () => {
        assert.strictEqual(response.status, 400);
      });
    });
  });

  after(() => roleRepository.remove(role.id));
});
