import { AxiosInstance, AxiosResponse } from 'axios';
import { times } from 'lodash';
import { assert } from 'chai';
import * as faker from 'faker';
import IRole from 'common/entities/role';
import generateRole from 'common/test/fixtures/role';
import roleRepository from 'common/db/repositories/role';
import skillRepository from 'common/db/repositories/skill';
import generateSkill from 'common/test/fixtures/skill';
import roleSkillRepository from 'common/db/repositories/role-skill';
import generateRoleSkill from 'common/test/fixtures/role-skill';
import webConfig from 'config/web';
import terminalObjectiveRepository from 'common/db/repositories/terminal-objective';
import enablingObjectiveRepository from 'common/db/repositories/enabling-objective';
import generateTerminalObjective from 'common/test/fixtures/terminal-objective';
import generateEnablingObjective from 'common/test/fixtures/enabling-objective';
import { getClient } from 'web/test/helpers/http-client';

describe('RETIRE', () => {
  const reason = faker.random.word();

  let client: AxiosInstance;
  let response: AxiosResponse;

  let role: IRole;
  let skillId: string;
  let terminalObjectiveId: string;
  let enablingObjectiveIds: string[];

  before(async () => {
    client = getClient();

    role = generateRole();
    await roleRepository.create(role);
  });

  beforeEach(async () => {
    const skill = await skillRepository.create(generateSkill());

    skillId = skill.id;
    await roleSkillRepository.create(
      generateRoleSkill({ roleId: role.id, skillId })
    );
    // create children:
    const terminalObjective = generateTerminalObjective(skillId);

    terminalObjectiveId = terminalObjective.id;

    await terminalObjectiveRepository.create(terminalObjective);

    const enablingObjectives = await Promise.all(
      times(5, () =>
        enablingObjectiveRepository.create(
          generateEnablingObjective(terminalObjectiveId)
        )
      )
    );

    enablingObjectiveIds = enablingObjectives.map((obj: any) => obj.id);

    response = await client.delete(
      `${webConfig.routes.skill.replace(':roleId', role.id)}/${skillId}`,
      {
        data: {
          reason
        }
      }
    );
  });

  it('responds with status 204', () => {
    assert.strictEqual(response.status, 204);
  });

  it('retires the skill', async () => {
    const skill = await skillRepository.get(skillId);

    assert.strictEqual(skill!.isDeleted, true);
  });

  it('stores the reason in the DB', async () => {
    const skill = await skillRepository.get(skillId);

    assert.strictEqual(skill!.deleteReason, reason);
  });

  context('skill has children', () => {
    it('retires the terminal objectives', async () => {
      const terminalObjective = await terminalObjectiveRepository.get(
        terminalObjectiveId
      );

      assert.strictEqual(terminalObjective!.isDeleted, true);
      assert.strictEqual(terminalObjective!.deleteReason, reason);
    });

    it('retires the enabling objectives', async () => {
      const enablingObjectives = await enablingObjectiveRepository.getArray(
        enablingObjectiveIds
      );

      enablingObjectives.forEach(enablingObjective => {
        assert.strictEqual(enablingObjective.isDeleted, true);
        assert.strictEqual(enablingObjective.deleteReason, reason);
      });
    });
  });

  after(() => roleRepository.remove(role.id));

  afterEach(async () => {
    await roleSkillRepository.remove(role.id, skillId);
    await enablingObjectiveRepository.removeArray(enablingObjectiveIds);
    await terminalObjectiveRepository.remove(terminalObjectiveId);
    await skillRepository.remove(skillId);
  });
});
