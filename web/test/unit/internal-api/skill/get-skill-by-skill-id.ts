import * as faker from 'faker';
import { assert } from 'chai';
import sinon, { SinonStub, SinonSandbox } from 'sinon';
import { handleGetBySkillId } from '../../../../src/internal-api/skill/get-by-skill-id-handler';
import roleRepository from 'common/db/repositories/role';
import roleSkillRepository from 'common/db/repositories/role-skill';
import skillInteractor from 'common/interactors/skill';
import { generateSkillRecord } from 'common/test/fixtures/skill';
import { SkillModel } from 'common/db/models/skill';
import { generateRoleRecord } from 'common/test/fixtures/role';
import { RoleModel } from 'common/db/models/role';
import { SkillResponse } from 'common/entities/skill';
import { RoleSkillModel } from 'common/db/models/role-skill';

describe('GET', () => {
  let id: string;
  let sandbox: SinonSandbox;
  let getSkillStub: SinonStub;
  let getRoleStub: SinonStub;
  let getRoleSkillStub: SinonStub;
  let ctx;
  let skill: SkillModel;
  let role: RoleModel;
  let isOptional: boolean;
  let roleSkill: RoleSkillModel;

  before(() => {
    sandbox = sinon.createSandbox();
    getRoleStub = sandbox.stub();
    getRoleSkillStub = sandbox.stub();
    getSkillStub = sandbox.stub();
    sandbox.replace(skillInteractor, 'get', getSkillStub);
    sandbox.replace(roleRepository, 'get', getRoleStub);
    sandbox.replace(roleSkillRepository, 'get', getRoleSkillStub);
  });

  context('valid input', () => {
    beforeEach(async () => {
      id = faker.random.uuid();
      skill = generateSkillRecord();
      role = generateRoleRecord();
      isOptional = faker.random.boolean();

      roleSkill = {
        roleId: role.id,
        skillId: skill.id,
        isOptional,
        updatedAt: new Date()
      };

      getSkillStub.resolves(skill);
      getRoleStub.resolves(role);
      getRoleSkillStub.resolves(roleSkill);

      ctx = {
        params: { id, roleId: role.id },
        throw: (status, msg) => {
          throw new Error(`ctx.throw: Error ${status}: ${msg}`);
        }
      };

      await handleGetBySkillId(ctx);
    });

    it('sets ctx.status to 200', () => {
      assert.strictEqual(ctx.status, 200);
    });

    it('sets terminal objective data to ctx.body', () => {
      const responseBody: SkillResponse = ctx.body;
      const expectedResponseBody = new SkillResponse(skill, roleSkill);
      assert.deepEqual(responseBody, expectedResponseBody);
    });

    it('calls repository with right params', () => {
      sinon.assert.calledOnce(getSkillStub);
      sinon.assert.calledWithExactly(getSkillStub, id);
    });
  });

  context('invalid input', () => {
    let ctxThrow;
    before(() => {
      ctxThrow = sandbox.stub();
    });

    context('skill does not exist or is retired', () => {
      beforeEach(async () => {
        ctx = {
          params: { id: faker.random.uuid(), roleId: faker.random.uuid() },
          throw: ctxThrow
        };

        getSkillStub.resolves(undefined);
        getRoleStub.resolves({});
        getRoleSkillStub.resolves({});

        await handleGetBySkillId(ctx);
      });

      it('throws 404 error', () => {
        sinon.assert.calledOnce(ctxThrow);
        sinon.assert.calledWithExactly(ctxThrow, 404);
      });
    });

    context('role does not exist', () => {
      beforeEach(async () => {
        ctx = {
          params: { id: faker.random.uuid(), roleId: faker.random.uuid() },
          throw: ctxThrow
        };

        getSkillStub.resolves({});
        getRoleStub.resolves(undefined);
        getRoleSkillStub.resolves({});

        await handleGetBySkillId(ctx);
      });

      it('throws 404 error', () => {
        sinon.assert.calledOnce(ctxThrow);
        sinon.assert.calledWithExactly(ctxThrow, 404);
      });
    });

    context('roleSkill does not exist', () => {
      beforeEach(async () => {
        ctx = {
          params: { id: faker.random.uuid(), roleId: faker.random.uuid() },
          throw: ctxThrow
        };

        getSkillStub.resolves({});
        getRoleStub.resolves({});
        getRoleSkillStub.resolves(undefined);

        await handleGetBySkillId(ctx);
      });

      it('throws 404 error', () => {
        sinon.assert.calledOnce(ctxThrow);
        sinon.assert.calledWithExactly(ctxThrow, 404);
      });
    });
  });

  afterEach(() => {
    sandbox.reset();
  });

  after(() => {
    sandbox.restore();
  });
});
