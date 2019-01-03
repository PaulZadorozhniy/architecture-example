import * as faker from 'faker';
import { assert } from 'chai';
import fp from 'lodash/fp';
import sinon, { SinonStub, SinonSandbox } from 'sinon';
import { generateSkillRecord } from 'common/test/fixtures/skill';
import { SkillModel } from 'common/db/models/skill';
import { generateRoleRecord } from 'common/test/fixtures/role';
import { RoleModel } from 'common/db/models/role';
import { retireSkillHandler } from 'web/src/internal-api/skill/retire-handler';
import skillRepository from 'common/db/repositories/skill';
import roleSkillRepository from 'common/db/repositories/role-skill';
import skillInteractor from 'common/interactors/skill';
import { generateRoleSkillRecord } from 'common/test/fixtures/role-skill';
import { RoleSkillModel } from 'common/db/models/role-skill';

describe('RETIRE', () => {
  const reason = faker.random.word();

  let validCtx: any;

  let role: RoleModel;
  let skill: SkillModel;
  let roleSkill: RoleSkillModel;

  let sandbox: SinonSandbox;
  let ctxThrowStub: SinonStub;
  let getSkillStub: SinonStub;
  let getRoleSkillStub: SinonStub;
  let retireSkillStub: SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    ctxThrowStub = sandbox.stub();
    retireSkillStub = sandbox.stub();
    getSkillStub = sandbox.stub();
    getRoleSkillStub = sandbox.stub();

    sandbox.replace(skillRepository, 'get', getSkillStub);
    sandbox.replace(roleSkillRepository, 'get', getRoleSkillStub);
    sandbox.replace(skillInteractor, 'retire', retireSkillStub);

    role = generateRoleRecord();
    skill = generateSkillRecord();
    roleSkill = generateRoleSkillRecord({
      roleId: role.id,
      skillId: skill.id
    });

    validCtx = {
      params: { roleId: role.id, id: skill.id },
      request: {
        body: { reason }
      },
      throw: ctxThrowStub
    };

    retireSkillStub.resolves();
  });

  context('invalid params', () => {
    it('sets ctx.status = 400 on invalid role id', async () => {
      const invalidCtx = fp.set('params.roleId', {}, validCtx);

      await retireSkillHandler(invalidCtx);

      sinon.assert.calledWith(ctxThrowStub, 400);
    });

    it('sets ctx.status = 400 on invalid skill id', async () => {
      const invalidCtx = fp.set('params.id', {}, validCtx);

      await retireSkillHandler(invalidCtx);

      sinon.assert.calledWith(ctxThrowStub, 400);
    });

    it('sets ctx.status = 400 on invalid reason', async () => {
      const invalidCtx = fp.set('request.body.reason', {}, validCtx);

      await retireSkillHandler(invalidCtx);

      sinon.assert.calledWith(ctxThrowStub, 400);
    });
  });

  context('valid params', () => {
    context('skill does not exist', () => {
      beforeEach(() => {
        getSkillStub.resolves(undefined);
      });

      it('sets ctx.status = 404', async () => {
        await retireSkillHandler(validCtx);

        assert.strictEqual(validCtx.status, 404);
      });
    });

    context('skill exists but is already retired', () => {
      beforeEach(() => {
        const retiredSkill = fp.set('isDeleted', true, skill);

        getSkillStub.resolves(retiredSkill);
        getRoleSkillStub.resolves(roleSkill);
      });

      it('sets ctx.status = 404', async () => {
        await retireSkillHandler(validCtx);

        assert.strictEqual(validCtx.status, 404);
      });
    });

    context('skill exists but is not bound to the role', () => {
      beforeEach(() => {
        getSkillStub.resolves(skill);
        getRoleSkillStub.resolves(undefined);
      });

      it('sets ctx.status = 404', async () => {
        await retireSkillHandler(validCtx);

        assert.strictEqual(validCtx.status, 404);
      });
    });

    context('skill exists and is bound to the role', () => {
      beforeEach(() => {
        getSkillStub.resolves(skill);
        getRoleSkillStub.resolves(roleSkill);
      });

      it('sets ctx.status = 204', async () => {
        await retireSkillHandler(validCtx);

        assert.strictEqual(validCtx.status, 204);
      });

      it('retires the skill and its children objctives', async () => {
        await retireSkillHandler(validCtx);

        sinon.assert.calledWithExactly(
          retireSkillStub,
          skill,
          roleSkill,
          reason
        );
      });
    });
  });

  afterEach(() => sandbox.reset());
  after(() => sandbox.restore());
});
