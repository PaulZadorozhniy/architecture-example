import config from 'config/external-api';
import skillRepository from 'common/db/repositories/skill';
import generateSkill from 'common/test/fixtures/skill';
import { assert } from 'chai';
import { SkillResponse } from 'common/entities/skill';
import roleRepository from 'common/db/repositories/role';
import roleSkillRepository from 'common/db/repositories/role-skill';
import generateRole from 'common/test/fixtures/role';
import * as faker from 'faker';
import { AxiosInstance } from 'axios';
import fp from 'lodash/fp';
import { getClient } from 'external-api/test/helpers/http-client';

const stripOutDates = fp.omit(['createdAt', 'updatedAt']);

describe('GET', () => {
  let client: AxiosInstance;
  let roleId: string;
  let isOptional: boolean;
  let skillRecord;
  let roleSkillRecord;

  before(() => {
    client = getClient();
  });

  beforeEach(async () => {
    const skill = generateSkill();
    const role = await roleRepository.create(generateRole());
    roleId = role.id;
    isOptional = faker.random.boolean();
    await skillRepository.create(skill);
    skillRecord = await skillRepository.get(skill.id);
    await roleSkillRepository.create({ roleId, skillId: skill.id, isOptional });
    roleSkillRecord = await roleSkillRepository.get(roleId, skill.id);
  });

  it('responds with the skill', async () => {
    const response = await client.get(
      `${config.routes.skill.replace(':roleId', roleId)}/${skillRecord.id}`
    );

    assert.strictEqual(response.status, 200);
    assert.deepEqual(
      stripOutDates(response.data),
      stripOutDates(new SkillResponse(skillRecord, roleSkillRecord))
    );
  });

  afterEach(async () => {
    await roleSkillRepository.remove(roleId, skillRecord.id);
    await skillRepository.remove(skillRecord.id);
    await roleRepository.remove(roleId);
  });
});
