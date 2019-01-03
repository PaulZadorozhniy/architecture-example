import { AxiosInstance } from 'axios';
import { assert } from 'chai';
import webConfig from 'config/web';
import roleRepository from 'common/db/repositories/role';
import roleSkillRepository from 'common/db/repositories/role-skill';
import skillRepository from 'common/db/repositories/skill';
import generateSkill from 'common/test/fixtures/skill';
import generateRole from 'common/test/fixtures/role';
import generateRoleSkill from 'common/test/fixtures/role-skill';
import IRoleSkill from 'common/entities/role-skill';
import { RoleModel } from '../../../../common/db/models/role';
import { SkillModel } from '../../../../common/db/models/skill';
import { getClient } from 'web/test/helpers/http-client';

describe('UPDATE', () => {
  let client: AxiosInstance;
  let skill: SkillModel;
  let role: RoleModel;
  let newRole: RoleModel;

  before(() => {
    client = getClient();
  });

  describe('updates skill', () => {
    let response;
    let roleSkill: IRoleSkill;

    before(async () => {
      skill = await skillRepository.create(generateSkill(undefined, false));
      role = await roleRepository.create(generateRole());
      newRole = await roleRepository.create(generateRole());
      const newSkillData = generateSkill();
      roleSkill = generateRoleSkill({ roleId: role.id, skillId: skill.id });

      await roleSkillRepository.create(roleSkill);

      response = await client.put(
        `${webConfig.routes.skill.replace(':roleId', role.id)}/${skill.id}`,
        {
          roleId: newRole.id,
          name: newSkillData.name,
          isDraft: newSkillData.isDraft,
          isOptional: !roleSkill.isOptional
        }
      );
    });

    it('should respond with the updated entity and status 200', () => {
      assert.strictEqual(response.status, 200);
      assert.isObject(response.data);
      assert.isNotEmpty(response.data);
    });
  });
});
