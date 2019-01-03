import { times, flatten } from 'lodash';
import webConfig from 'config/web';
import skillRepository from 'common/db/repositories/skill';
import roleRepository from 'common/db/repositories/role';
import roleSkillRepository from 'common/db/repositories/role-skill';
import terminalObjectiveRepository from 'common/db/repositories/terminal-objective';
import enablingObjectiveRepository from 'common/db/repositories/enabling-objective';
import { assert } from 'chai';
import generateSkill from 'common/test/fixtures/skill';
import generateRole from 'common/test/fixtures/role';
import generateRoleSkill from 'common/test/fixtures/role-skill';
import ISkill from 'common/entities/skill';
import IRole from 'common/entities/role';
import IRoleSkill from 'common/entities/role-skill';
import generateTerminalObjective from 'common/test/fixtures/terminal-objective';
import generateEnablingObjective from 'common/test/fixtures/enabling-objective';
import ITerminalObjective from 'common/entities/terminal-objective';
import { getClient } from 'web/test/helpers/http-client';

describe('GET ALL BY ROLE ID', () => {
  let skills: ISkill[];
  let role: IRole;
  let roleSkills: IRoleSkill[];
  let terminalObjectives: ITerminalObjective[];
  let createdTerminalObjectiveIds: string[];
  let createdEnablingObjectiveIds: string[];
  let client;

  before(() => {
    client = getClient();
  });

  before(async () => {
    role = generateRole();

    skills = times(5, () => generateSkill());
    await Promise.all(skills.map(skill => skillRepository.create(skill)));

    terminalObjectives = flatten(
      skills.map(skill => times(5, () => generateTerminalObjective(skill.id)))
    );
    createdTerminalObjectiveIds = terminalObjectives.map(
      terminalObjective => terminalObjective.id
    );
    createdTerminalObjectiveIds = createdTerminalObjectiveIds.sort();
    roleSkills = skills.map(skill =>
      generateRoleSkill({
        roleId: role.id,
        skillId: skill.id
      })
    );

    await roleRepository.create(role);
    await Promise.all(
      terminalObjectives.map(terminalObjective =>
        terminalObjectiveRepository.create(terminalObjective)
      )
    );
    await Promise.all(
      roleSkills.map(roleSkill => roleSkillRepository.create(roleSkill))
    );

    async function createEnablingObjectives(
      terminalObjectiveIds: string[]
    ): Promise<string[]> {
      const enablingObjectives = await Promise.all(
        terminalObjectiveIds.map(terminalObjectiveId =>
          enablingObjectiveRepository.create(
            generateEnablingObjective(terminalObjectiveId)
          )
        )
      );

      return enablingObjectives.map(enablingObjective => enablingObjective.id);
    }

    createdEnablingObjectiveIds = await createEnablingObjectives(
      createdTerminalObjectiveIds
    );
  });

  context('requesting skills for a role', () => {
    let response;

    before(async () => {
      response = await client.get(
        webConfig.routes.skill.replace(':roleId', role.id)
      );
    });

    it('response should contain all keys', async () => {
      assert.isArray(response.data);
      assert.isNotEmpty(response.data);
    });

    it('skills in response should have correct ids, names and roleIds', () => {
      response.data.forEach(responseSkill => {
        const element = skills.find(skill => responseSkill.id === skill.id);

        assert.strictEqual(responseSkill.id, element!.id);
        assert.strictEqual(responseSkill.name, element!.name);
        assert.strictEqual(responseSkill.roleId, role.id);
      });
    });

    it('skills in response should have correct terminal objectives', () => {
      response.data.forEach(responseSkill => {
        responseSkill.terminalObjectives.forEach(terminalObjective => {
          assert.hasAllKeys(terminalObjective, [
            'id',
            'description',
            'skillId',
            'updatedAt',
            'createdAt',
            'enablingObjectives',
            'bloomLevel'
          ]);

          assert.isObject(terminalObjective);
          assert.isNotEmpty(terminalObjective);
          assert.strictEqual(terminalObjective.skillId, responseSkill.id);
        });
      });
    });

    it('terminal objectives in response should have correct enabling objectives', () => {
      response.data.forEach(responseSkill => {
        responseSkill.terminalObjectives.forEach(terminalObjective => {
          assert.isArray(terminalObjective.enablingObjectives);
          assert.lengthOf(terminalObjective.enablingObjectives, 1);
        });
      });
    });

    after(async () => {
      await Promise.all(
        roleSkills.map(roleSkill =>
          roleSkillRepository.remove(roleSkill.roleId, roleSkill.skillId)
        )
      );
      await roleRepository.remove(role.id);
      await enablingObjectiveRepository.removeArray(
        createdEnablingObjectiveIds
      );
      await terminalObjectiveRepository.removeArray(
        createdTerminalObjectiveIds
      );
      await skillRepository.removeArray(skills.map(skill => skill.id));
    });
  });
});
