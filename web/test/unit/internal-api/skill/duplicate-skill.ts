import { assert } from 'chai';
import { duplicateSkillHandler } from '../../../../src/internal-api/skill/duplicate-handler';
import { generateRoleRecord } from 'common/test/fixtures/role';
import { RoleModel } from 'common/db/models/role';
import { generateSkillRecord } from 'common/test/fixtures/skill';
import { generateTerminalObjectiveRecord } from 'common/test/fixtures/terminal-objective';
import { generateEnablingObjectiveRecord } from 'common/test/fixtures/enabling-objective';
import * as faker from 'faker';
import sinon from 'sinon';
import roleRepository from 'common/db/repositories/role';
import skillRepository from 'common/db/repositories/skill';
import roleSkillRepository from 'common/db/repositories/role-skill';
import terminalObjectiveRepository from 'common/db/repositories/terminal-objective';
import { SkillWithChildrenResponse } from 'common/entities/skill';
import { generateRoleSkillRecord } from 'common/test/fixtures/role-skill';
import terminalObjectiveInteractor from 'common/interactors/terminal-objective';

describe('DUPLICATE', () => {
  let ctx: any;
  let sandbox: sinon.SinonSandbox;
  let createTerminalObjectiveStub: sinon.SinonStub;
  let getArrayEnablingObjectiveStub: sinon.SinonStub;
  let throwError: sinon.SinonStub;
  let updateTerminalObjectiveStub: sinon.SinonStub;
  let getAllTerminalObjectiveStub: sinon.SinonStub;
  let updateSkillStub: sinon.SinonStub;
  let getRoleStub: sinon.SinonStub;
  let getSkillStub: sinon.SinonStub;
  let createSkillStub: sinon.SinonStub;
  let getRoleSkillStub: sinon.SinonStub;
  let createRoleSkillStub: sinon.SinonStub;
  let duplicateTerminalObjectiveStub: sinon.SinonStub;

  before(() => {
    sandbox = sinon.createSandbox();
    createTerminalObjectiveStub = sandbox.stub();
    getArrayEnablingObjectiveStub = sandbox.stub();
    getAllTerminalObjectiveStub = sandbox.stub();
    throwError = sandbox.stub();
    updateTerminalObjectiveStub = sandbox.stub();
    updateSkillStub = sandbox.stub();
    getRoleStub = sandbox.stub();
    getSkillStub = sandbox.stub();
    createSkillStub = sandbox.stub();
    getRoleSkillStub = sandbox.stub();
    createRoleSkillStub = sandbox.stub();
    duplicateTerminalObjectiveStub = sandbox.stub();

    sandbox.replace(
      terminalObjectiveRepository,
      'create',
      createTerminalObjectiveStub
    );
    sandbox.replace(
      terminalObjectiveRepository,
      'getBySkill',
      getAllTerminalObjectiveStub
    );
    sandbox.replace(
      terminalObjectiveRepository,
      'update',
      updateTerminalObjectiveStub
    );
    sandbox.replace(skillRepository, 'update', updateSkillStub);
    sandbox.replace(skillRepository, 'get', getSkillStub);
    sandbox.replace(skillRepository, 'create', createSkillStub);
    sandbox.replace(roleRepository, 'get', getRoleStub);
    sandbox.replace(roleSkillRepository, 'get', getRoleSkillStub);
    sandbox.replace(roleSkillRepository, 'create', createRoleSkillStub);
    sandbox.replace(
      terminalObjectiveInteractor,
      'duplicate',
      duplicateTerminalObjectiveStub
    );
  });

  context('valid input', () => {
    const role: RoleModel = generateRoleRecord();
    const originalSkill = generateSkillRecord();
    const originalRoleSkill = generateRoleSkillRecord({
      roleId: role.id,
      skillId: originalSkill.id
    });
    const originalTerminalObjectives = [
      generateTerminalObjectiveRecord(originalSkill.id)
    ];
    const originalEnablingObjective = generateEnablingObjectiveRecord(
      originalTerminalObjectives[0].id
    );
    const duplicatedSkillId = faker.random.uuid();
    const duplicatedTerminalObjectiveId = faker.random.uuid();
    const duplicatedEnablingObjective = {
      ...originalEnablingObjective,
      id: faker.random.uuid(),
      terminalObjectiveId: duplicatedTerminalObjectiveId
    };
    const duplicatedTerminalObjectives = [
      {
        ...originalTerminalObjectives[0],
        enablingObjectives: [duplicatedEnablingObjective],
        id: duplicatedTerminalObjectiveId,
        skillId: duplicatedSkillId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    const duplicatedSkill = {
      ...originalSkill,
      id: duplicatedSkillId,
      terminalObjectives: duplicatedTerminalObjectives,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const duplicatedRoleSKill = {
      ...originalRoleSkill,
      skillId: duplicatedSkill.id
    };

    beforeEach(async () => {
      ctx = {
        params: { roleId: role.id, skillId: originalSkill.id },
        throw: throwError
      };

      getRoleStub.resolves(role);
      getRoleSkillStub.resolves(originalRoleSkill);
      getArrayEnablingObjectiveStub.resolves(
        originalTerminalObjectives[0].enablingObjectives
      );
      createTerminalObjectiveStub.resolves(duplicatedTerminalObjectiveId);
      getAllTerminalObjectiveStub
        .onCall(0)
        .resolves(originalTerminalObjectives);
      getAllTerminalObjectiveStub
        .onCall(1)
        .resolves(duplicatedTerminalObjectives);
      getSkillStub.resolves(originalSkill);
      createSkillStub.resolves(duplicatedSkill);

      await duplicateSkillHandler(ctx);
    });

    it('sets ctx.status 200', () => {
      assert.strictEqual(ctx.status, 200);
    });

    it('creates a new skill record', () => {
      const { args } = createSkillStub.getCall(0);
      const skillData = args[0];

      sinon.assert.calledOnce(createSkillStub);
      assert.isString(skillData.id);
      assert.notStrictEqual(skillData.id, originalSkill.id);
      assert.strictEqual(skillData.name, originalSkill.name);
      assert.strictEqual(
        skillData.curriculumLeadHandle,
        originalSkill.curriculumLeadHandle
      );
      assert.strictEqual(skillData.isDraft, true);
    });

    it('creates a roleSkill record', () => {
      const { args } = createRoleSkillStub.getCall(0);
      const roleSkillData = args[0];

      sinon.assert.calledOnce(createRoleSkillStub);
      assert.isString(roleSkillData.skillId);
      assert.notStrictEqual(roleSkillData.skillId, originalRoleSkill.skillId);
      assert.strictEqual(roleSkillData.roleId, originalRoleSkill.roleId);
      assert.strictEqual(
        roleSkillData.isOptional,
        originalRoleSkill.isOptional
      );
    });

    it('creates new children objectives', () => {
      const calls = duplicateTerminalObjectiveStub.getCalls();

      assert.strictEqual(calls.length, originalTerminalObjectives.length);
      calls.forEach(call => {
        const [terminalObjectiveId, skillId] = call.args;

        assert.isString(skillId);
        assert.exists(
          originalTerminalObjectives.find(obj => obj.id === terminalObjectiveId)
        );
      });
    });

    it('writes duplicated skill data to ctx.body', () => {
      const skillResponse: SkillWithChildrenResponse = ctx.body;
      const expectedResponse = new SkillWithChildrenResponse(
        duplicatedSkill,
        duplicatedRoleSKill
      );

      assert.deepStrictEqual(skillResponse, expectedResponse);
    });
  });

  // context('invalid input');

  afterEach(() => sandbox.reset());
  after(() => sandbox.restore());
});
