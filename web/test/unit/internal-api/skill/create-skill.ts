import sinon from 'sinon';
import { omit, set } from 'lodash';
import { handleCreate } from '../../../../src/internal-api/skill/create-handler';
import skillRepository from 'common/db/repositories/skill';
import roleSkillRepository from 'common/db/repositories/role-skill';
import roleRepository from 'common/db/repositories/role';
import * as faker from 'faker';
import generateRole from 'common/test/fixtures/role';
import { assert } from 'chai';
import generateSkill from 'common/test/fixtures/skill';
import * as validationModule from '../../../../src/helpers/validate';
import rabbit from 'common/rabbit';
import { rabbitConfig } from 'config/messaging';
import { SkillResponse, SkillMessage } from 'common/entities/skill';

describe('CREATE', () => {
  let ctx: any;

  let sandbox;
  let createSkillStub;
  let createRoleSkillStub;
  let ctxThrowStub;
  let roleRepositoryGetStub;
  let getRoleSkillStub;
  let validateStub;
  let publishToExchange;

  before(() => {
    sandbox = sinon.createSandbox();
    roleRepositoryGetStub = sandbox.stub();
    createSkillStub = sandbox.stub();
    createRoleSkillStub = sandbox.stub();
    ctxThrowStub = sandbox.stub();
    getRoleSkillStub = sandbox.stub();
    validateStub = sandbox.stub();
    publishToExchange = sandbox.stub();

    sandbox.replace(validationModule, 'validate', validateStub);
    sandbox.replace(skillRepository, 'create', createSkillStub);
    sandbox.replace(roleSkillRepository, 'create', createRoleSkillStub);
    sandbox.replace(roleSkillRepository, 'get', getRoleSkillStub);
    sandbox.replace(roleRepository, 'get', roleRepositoryGetStub);
    sandbox.replace(rabbit, 'publishToExchange', publishToExchange);
  });

  context('valid input', () => {
    let roleId: string;
    let skillId: string;
    let skillData: any;
    let isOptional: boolean;

    beforeEach(() => {
      skillId = faker.random.uuid();

      roleId = faker.random.uuid();
      skillData = omit(generateSkill(), ['id']);
      isOptional = faker.random.boolean();

      ctx = {
        request: { body: { ...skillData, isOptional } },
        params: { roleId },
        throw: ctxThrowStub
      };

      validateStub.returns({});
    });

    context('role exists', () => {
      let skill: any;
      const roleSkill: any = { roleId, skillId, isOptional: false };

      beforeEach(() => {
        skill = {
          ...skillData,
          updatedAt: new Date(),
          createdAt: new Date(),
          id: skillId,
          terminalObjectives: []
        };
        roleRepositoryGetStub.resolves(generateRole());
        createSkillStub.resolves(skill);
        getRoleSkillStub.resolves(roleSkill);
      });

      it('creates a record in DB', async () => {
        await handleCreate(ctx);
        const { args } = createSkillStub.getCall(0);
        const actualSkillData = args[0];

        assert.strictEqual(actualSkillData.name, skillData.name);
        assert.strictEqual(actualSkillData.isDraft, skillData.isDraft);
        assert.isString(actualSkillData.id);
      });

      it('attaches the skill to the role', async () => {
        await handleCreate(ctx);

        sinon.assert.calledWithExactly(createRoleSkillStub, {
          roleId,
          skillId,
          isOptional
        });
      });

      it('responds with the created entity and status 201', async () => {
        await handleCreate(ctx);

        assert.deepStrictEqual(ctx.body, new SkillResponse(skill, roleSkill));
        assert.strictEqual(ctx.status, 201);
      });

      context('skill is not in draft mode', () => {
        let ctxNotInDraft;
        let skillNotInDraft;

        beforeEach(() => {
          ctxNotInDraft = { ...ctx };
          skillNotInDraft = { ...skill, isDraft: false };
          set(ctxNotInDraft, 'request.body.isDraft', false);
          createSkillStub.resolves(skillNotInDraft);
        });

        it('sends a message to rabbit', async () => {
          await handleCreate(ctxNotInDraft);

          sinon.assert.calledOnce(publishToExchange);
          sinon.assert.calledWithExactly(
            publishToExchange,
            rabbitConfig.exchanges.skillUpdated,
            new SkillMessage(skillNotInDraft, roleSkill)
          );
        });
      });

      context('skill is in draft mode', () => {
        let ctxInDraft;

        beforeEach(() => {
          ctxInDraft = { ...ctx };
          set(ctxInDraft, 'request.body.isDraft', true);
        });

        it('does not send a message to rabbit', async () => {
          await handleCreate(ctxInDraft);

          sinon.assert.notCalled(publishToExchange);
        });
      });
    });

    context('role does not exist', () => {
      beforeEach(() => {
        roleRepositoryGetStub.resolves(undefined);
        return handleCreate(ctx);
      });

      it('throws a 404 error', () => {
        sinon.assert.calledWithExactly(ctxThrowStub, 404, '');
      });
    });
  });

  context('invalid input', () => {
    let errorMessage: string;
    let errors: any[];

    beforeEach(() => {
      errorMessage = faker.random.words();
      errors = [{}];

      validateStub.returns({
        errors,
        errorMessage
      });

      ctx = {
        request: { body: {} },
        params: { roleId: undefined },
        throw: ctxThrowStub
      };

      return handleCreate(ctx);
    });

    it('throws a 400 error', () => {
      sinon.assert.calledWithExactly(ctxThrowStub, 400, errorMessage, {
        messages: errors
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
