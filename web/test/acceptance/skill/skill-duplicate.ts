import { assert } from 'chai';
import roleRepository from 'common/db/repositories/role';
import skillRepository from 'common/db/repositories/skill';
import roleSkillRepository from 'common/db/repositories/role-skill';
import generateRole from 'common/test/fixtures/role';
import generateSkill from 'common/test/fixtures/skill';
import generateRoleSkill from 'common/test/fixtures/role-skill';
import IRole from 'common/entities/role';
import ISkill from 'common/entities/skill';
import { AxiosResponse } from 'axios';
import webConfig from 'config/web';
import { getClient } from 'web/test/helpers/http-client';

describe('DUPLICATE', () => {
  let client;

  before(() => {
    client = getClient();
  });

  context('valid input', () => {
    let role: IRole;
    let skill: ISkill;
    let terminalObjective: ITerminalObjective;
    let enablingObjective: IEnablingObjective;
    let response: AxiosResponse;

    before(async () => {
      role = generateRole();
      skill = generateSkill();
      terminalObjective = generateTerminalObjective(skill.id);
      enablingObjective = generateEnablingObjective(terminalObjective.id);

      await roleRepository.create(role);
      await skillRepository.create(skill);
      await roleSkillRepository.create(
        generateRoleSkill({ roleId: role.id, skillId: skill.id })
      );
      await terminalObjectiveRepository.create(terminalObjective);
      await enablingObjectiveRepository.create(enablingObjective);

      response = await client.post(
        webConfig.routes.duplicateSkill
          .replace(':roleId', role.id)
          .replace(':skillId', skill.id)
      );
    });

    it('respond with 200 status', () => {
      assert.strictEqual(response.status, 200);
    });

    it('respons contains correct skill data', () => {
      assert.hasAllKeys(response.data, [
        'id',
        'name',
        'isDraft',
        'isOptional',
        'roleId',
        'terminalObjectives',
        'createdAt',
        'updatedAt'
      ]);

      assert.isString(response.data.id);
      assert.notStrictEqual(response.data.id, skill.id);
      assert.strictEqual(response.data.name, skill.name);
      assert.strictEqual(
        response.data.curriculumLeadHandle,
        skill.curriculumLeadHandle
      );
      assert.strictEqual(response.data.isDraft, true);
    });
  });
});
