import { handleGet } from '../../../../src/internal-api/skill/get-handler';
import { assert } from 'chai';
import sinon from 'sinon';
import skillRepository from 'common/db/repositories/skill';
import roleSkillRepository from 'common/db/repositories/role-skill';
import roleRepository from 'common/db/repositories/role';
import generateSkill from 'common/test/fixtures/skill';
import { generateRoleSkillRecord } from 'common/test/fixtures/role-skill';
import * as faker from 'faker';
import { times } from 'lodash';
import generateTerminalObjective from 'common/test/fixtures/terminal-objective';
import { pipe, set } from 'lodash/fp';
import generateRole from 'common/test/fixtures/role';
import { SkillWithChildrenResponse } from 'common/entities/skill';
import { SkillModel } from 'common/db/models/skill';
import { RoleSkillModel } from 'common/db/models/role-skill';

describe('GET ALL BY ROLE ID', () => {
  const baseCtx = {
    params: {},
    request: {
      body: {}
    },
    headers: {}
  };

  let sandbox: sinon.SinonSandbox;
  let getRoleSkillsStub: sinon.SinonStub;
  let getRoleStub: sinon.SinonStub;
  let getArraySkillsStub: sinon.SinonStub;

  before(() => {
    sandbox = sinon.createSandbox();
    getRoleSkillsStub = sandbox.stub();
    getRoleStub = sandbox.stub();
    getArraySkillsStub = sandbox.stub();
    sandbox.replace(skillRepository, 'getArray', getArraySkillsStub);
    sandbox.replace(roleSkillRepository, 'getAll', getRoleSkillsStub);
    sandbox.replace(roleRepository, 'get', getRoleStub);
  });

  context('role does not exist', () => {
    let ctx: any;
    let ctxThrowStub: sinon.SinonStub;

    before(() => {
      ctxThrowStub = sandbox.stub();

      ctx = {
        ...baseCtx,
        params: { roleId: faker.random.uuid() },
        throw: ctxThrowStub
      };
    });

    beforeEach(() => getRoleStub.resolves(undefined));

    beforeEach(() => handleGet(ctx));

    it('throws a 404 error', () => {
      sinon.assert.calledWith(ctxThrowStub, 404);
    });
  });

  context('role exists', () => {
    const roleId = faker.random.uuid();
    const ctx: any = {
      ...baseCtx,
      params: { roleId }
    };
    let skills: SkillModel[];
    let roleSkills: RoleSkillModel[];

    beforeEach(() => {
      skills = times(
        3,
        pipe(
          generateSkill,
          skill =>
            set(
              'terminalObjectives',
              times(3, () => ({
                ...generateTerminalObjective(skill.id),
                id: faker.random.uuid(),
                updatedAt: new Date(),
                enablingObjectives: []
              })),
              skill
            ),
          set('updatedAt', new Date()),
          set('createdAt', new Date()),
          set('id', faker.random.uuid()),
          skill => skill as SkillModel // because TYPESCRIPT
        )
      );

      roleSkills = skills.map((skill: SkillModel) =>
        generateRoleSkillRecord({ roleId, skillId: skill.id })
      );

      getArraySkillsStub.resolves(skills);
      getRoleSkillsStub.resolves(roleSkills);
      getRoleStub.resolves(generateRole());
    });

    beforeEach(() => handleGet(ctx));

    it('sets ctx.status = 200', () => {
      assert.strictEqual(ctx.status, 200);
    });

    it('writes all skills of a role to ctx.body', () => {
      const expectedResponse = skills.map(
        (skill, i) => new SkillWithChildrenResponse(skill, roleSkills[i])
      );

      assert.isArray(ctx.body);
      assert.isNotEmpty(ctx.body);
      for (const skill of ctx.body) {
        assert.hasAllKeys(skill, [
          'id',
          'name',
          'roleId',
          'isOptional',
          'terminalObjectives',
          'updatedAt',
          'createdAt',
          'isDraft'
        ]);

        for (const terminalObjective of skill.terminalObjectives) {
          assert.hasAllKeys(terminalObjective, [
            'id',
            'description',
            'skillId',
            'updatedAt',
            'createdAt',
            'enablingObjectives',
            'bloomLevel'
          ]);
        }
      }
      assert.deepStrictEqual(ctx.body, expectedResponse);
    });
  });

  afterEach(() => {
    sandbox.reset();
  });

  after(() => {
    sandbox.restore();
  });
});
