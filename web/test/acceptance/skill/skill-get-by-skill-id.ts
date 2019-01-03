import * as faker from 'faker';
import { assert } from 'chai';
import config from 'config/web';
import skillRepository from 'common/db/repositories/skill';
import generateSkill from 'common/test/fixtures/skill';
import ISkill, { SkillResponse } from 'common/entities/skill';
import roleRepository from 'common/db/repositories/role';
import roleSkillRepository from 'common/db/repositories/role-skill';
import generateRole from 'common/test/fixtures/role';
import { RoleModel } from '../../../../common/db/models/role';
import { getClient } from 'web/test/helpers/http-client';

describe('GET', () => {
  let role: RoleModel;
  let roleId: string;
  let isOptional: boolean;
  let skill: ISkill;
  let skillRecord;
  let roleSkillRecord;
  let response;
  let client;

  before(() => {
    client = getClient();
  });

  beforeEach(async () => {
    skill = generateSkill();
    role = await roleRepository.create(generateRole());
    roleId = role.id;
    isOptional = faker.random.boolean();
    await skillRepository.create(skill);
    await roleSkillRepository.create({ roleId, skillId: skill.id, isOptional });
    skillRecord = await skillRepository.get(skill.id);
    roleSkillRecord = await roleSkillRepository.get(roleId, skill.id);

    response = await client.get(
      `${config.routes.skill.replace(':roleId', roleId)}/${skill.id}`
    );
  });

  it('responds with skill by id', () => {
    const responseData = {
      ...response.data,
      updatedAt: new Date(response.data.updatedAt),
      createdAt: new Date(response.data.createdAt)
    };
    const expectedData = new SkillResponse(skillRecord, roleSkillRecord);

    assert.strictEqual(response.status, 200);

    assert.deepEqual(responseData, expectedData);
  });

  afterEach(async () => {
    await roleSkillRepository.remove(roleId, skill.id);
    await skillRepository.remove(skill.id);
    await roleRepository.remove(roleId);
  });
});
