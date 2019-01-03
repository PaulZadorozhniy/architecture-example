import sinon from 'sinon';
import handleUpdate from '../../../../src/internal-api/skill/update-handler';
import skillRepository from 'common/db/repositories/skill';
import roleSkillRepository from 'common/db/repositories/role-skill';
import * as faker from 'faker';
import { assert } from 'chai';
import generateSkill, { generateSkillRecord } from 'common/test/fixtures/skill';
import * as validationModule from '../../../../src/helpers/validate';
import { generateRoleSkillRecord } from 'common/test/fixtures/role-skill';
import { set, times, pick } from 'lodash';
import rabbit from 'common/rabbit';
import { rabbitConfig } from 'config/messaging';
import { SkillModel } from 'common/db/models/skill';
import { generateTerminalObjectiveRecord } from 'common/test/fixtures/terminal-objective';
import { TerminalObjectiveModel } from 'common/db/models/terminal-objective';
import { EnablingObjectiveModel } from 'common/db/models/enabling-objective';
import { SkillResponse, SkillMessage } from 'common/entities/skill';
import { RoleSkillModel } from 'common/db/models/role-skill';

describe('UPDATE', () => {
  let ctx: any;

  let sandbox;
  let updateSkillStub;
  let createRoleSkillStub;
  let removeRoleSkillStub;
  let ctxThrowStub;
  let getSkillStub;
  let getSkillArrayStub;
  let getRoleSkillStub;
  let validateStub;
  let publishToExchange;

  before(() => {
    sandbox = sinon.createSandbox();
    updateSkillStub = sandbox.stub();
    createRoleSkillStub = sandbox.stub();
    removeRoleSkillStub = sandbox.stub();
    getRoleSkillStub = sandbox.stub();
    ctxThrowStub = sandbox.stub();
    getSkillStub = sandbox.stub();
    getSkillArrayStub = sandbox.stub();
    validateStub = sandbox.stub();
    publishToExchange = sandbox.stub();

    sandbox.replace(validationModule, 'validate', validateStub);
    sandbox.replace(skillRepository, 'update', updateSkillStub);
    sandbox.replace(skillRepository, 'get', getSkillStub);
    sandbox.replace(skillRepository, 'getArray', getSkillArrayStub);
    sandbox.replace(roleSkillRepository, 'get', getRoleSkillStub);
    sandbox.replace(roleSkillRepository, 'create', createRoleSkillStub);
    sandbox.replace(roleSkillRepository, 'remove', removeRoleSkillStub);
    sandbox.replace(rabbit, 'publishToExchange', publishToExchange);
  });

  context('valid input', () => {
    let currentRoleId: string;
    let updatedRoleId: string;
    let skillId: string;
    let skillData: any;
    let isOptional: boolean;
    let skillRecord: SkillModel;
    let roleSkillRecord: RoleSkillModel;

    beforeEach(() => {
      skillId = faker.random.uuid();
      updateSkillStub.resolves(true);

      currentRoleId = faker.random.uuid();
      updatedRoleId = faker.random.uuid();
      skillData = pick(generateSkill(), ['name', 'isDraft']);
      isOptional = faker.random.boolean();

      roleSkillRecord = generateRoleSkillRecord({
        roleId: updatedRoleId,
        skillId,
        isOptional
      });

      ctx = {
        params: { id: skillId, roleId: currentRoleId },
        request: { body: { ...skillData, isOptional, roleId: updatedRoleId } },
        throw: ctxThrowStub
      };

      skillRecord = generateSkillRecord({ id: skillId });
      validateStub.returns({});
      updateSkillStub.resolves(true);
      getSkillStub.resolves(skillRecord);
      getSkillArrayStub.resolves([skillRecord]);
      getRoleSkillStub.resolves(roleSkillRecord);
    });

    context('update success', () => {
      it('update a Skill record in the database', async () => {
        await handleUpdate(ctx);

        sinon.assert.calledOnce(updateSkillStub);
        sinon.assert.calledWithExactly(updateSkillStub, skillId, skillData);
      });

      it('removes the old RoleSkill record in the database', async () => {
        await handleUpdate(ctx);

        sinon.assert.calledOnce(removeRoleSkillStub);
        sinon.assert.calledWithExactly(
          removeRoleSkillStub,
          currentRoleId,
          skillId
        );
      });

      it('creates the new RoleSkill record in the database', async () => {
        await handleUpdate(ctx);

        sinon.assert.calledOnce(createRoleSkillStub);
        sinon.assert.calledWithExactly(createRoleSkillStub, {
          roleId: updatedRoleId,
          skillId,
          isOptional
        });
      });

      it('responds with the updated entity and status 200', async () => {
        await handleUpdate(ctx);

        const expected = new SkillResponse(skillRecord, roleSkillRecord);
        const actual = ctx.body;

        assert.strictEqual(ctx.status, 200);
        assert.deepStrictEqual(actual, expected);
      });

      context('skill is not in draft mode and was not', () => {
        let ctxNotInDraft;
        let updatedSkillRecord: SkillModel;

        beforeEach(() => {
          const initialSkillRecord: SkillModel = {
            ...skillRecord,
            isDraft: false
          };

          updatedSkillRecord = {
            ...initialSkillRecord,
            name: faker.random.word()
          };

          getSkillStub.resolves(initialSkillRecord);
          getSkillArrayStub.resolves([updatedSkillRecord]);

          ctxNotInDraft = { ...ctx };
          set(ctxNotInDraft, 'request.body.isDraft', false);
        });

        it('sends skill message to rabbit', async () => {
          await handleUpdate(ctxNotInDraft);

          const expectedMessage = new SkillMessage(
            updatedSkillRecord,
            roleSkillRecord
          );

          sinon.assert.calledOnce(publishToExchange);
          sinon.assert.calledWithExactly(
            publishToExchange,
            rabbitConfig.exchanges.skillUpdated,
            expectedMessage
          );
        });
      });

      context('skill ceases to be in draft mode', () => {
        let enablingObjectives: EnablingObjectiveModel[] = [];
        let terminalObjectives: TerminalObjectiveModel[];
        let ctxNotInDraft;
        let updatedSkillRecord: SkillModel;

        beforeEach(() => {
          terminalObjectives = times(2, () =>
            generateTerminalObjectiveRecord()
          );

          enablingObjectives.length = 0;
          terminalObjectives.forEach(terminalObjective => {
            enablingObjectives = enablingObjectives.concat(
              terminalObjective.enablingObjectives
            );
          });

          updatedSkillRecord = {
            ...skillRecord,
            isDraft: false,
            terminalObjectives
          };

          getSkillStub.resolves({ ...skillRecord, isDraft: true });

          getSkillArrayStub.resolves([updatedSkillRecord]);

          ctxNotInDraft = { ...ctx };
          set(ctxNotInDraft, 'request.body.isDraft', false);
        });

        it('sends skill message to rabbit', async () => {
          await handleUpdate(ctxNotInDraft);

          const { args } = publishToExchange.getCall(0);
          const [actualExchange, actualMessage] = args;
          const expectedMessage = new SkillMessage(
            updatedSkillRecord,
            roleSkillRecord
          );

          assert.strictEqual(
            actualExchange,
            rabbitConfig.exchanges.skillUpdated
          );

          assert.deepStrictEqual(actualMessage, expectedMessage);
        });

        context('sends children objectives messages to rabbit', () => {
          beforeEach(async () => {
            await handleUpdate(ctxNotInDraft);
          });

          it('publishes the correct number of objective messages', () => {
            const publishObjectivesCalls = publishToExchange.callCount;

            assert.strictEqual(
              publishObjectivesCalls,
              terminalObjectives.length + enablingObjectives.length + 1 // + 1 is for skill
            );
          });

          it('publishes the correct terminal objectives data', () => {
            const publishObjectivesCalls = publishToExchange
              .getCalls()
              .slice(1);

            terminalObjectives.forEach(terminalObjective => {
              const foundTerminallPublish = publishObjectivesCalls.find(
                publishObjectiveCall =>
                  publishObjectiveCall.args[1].id === terminalObjective.id
              );

              assert.exists(foundTerminallPublish);
              assert.strictEqual(
                foundTerminallPublish.args[0],
                rabbitConfig.exchanges.terminalObjectiveUpdated
              );
              assert.deepEqual(foundTerminallPublish.args[1], {
                id: terminalObjective.id,
                description: terminalObjective.description,
                skillId: terminalObjective.skillId,
                bloomLevel: terminalObjective.bloomLevel,
                isDeleted: terminalObjective.isDeleted
              });
            });
          });

          it('publishes the correct enabling objectives data', () => {
            const publishObjectivesCalls = publishToExchange
              .getCalls()
              .slice(1);

            enablingObjectives.forEach(enablingObjective => {
              const foundEnablingPublish = publishObjectivesCalls.find(
                publishObjectiveCall =>
                  publishObjectiveCall.args[1].id === enablingObjective.id
              );

              assert.exists(foundEnablingPublish);
              assert.strictEqual(
                foundEnablingPublish.args[0],
                rabbitConfig.exchanges.enablingObjectiveUpdated
              );
              assert.deepEqual(foundEnablingPublish.args[1], {
                id: enablingObjective.id,
                description: enablingObjective.description,
                terminalObjectiveId: enablingObjective.terminalObjectiveId,
                bloomLevel: enablingObjective.bloomLevel,
                isDeleted: enablingObjective.isDeleted
              });
            });
          });
        });
      });

      context('skill is in draft mode', () => {
        let ctxInDraft;

        beforeEach(() => {
          ctxInDraft = { ...ctx };
          set(ctxInDraft, 'request.body.isDraft', true);
          getSkillArrayStub.resolves([
            {
              ...skillRecord,
              isDraft: true,
              terminalObjectives: []
            }
          ]);
        });

        it('does not send a message to rabbit', async () => {
          await handleUpdate(ctxInDraft);

          sinon.assert.notCalled(publishToExchange);
        });
      });
    });

    context('update failed', () => {
      it('throws a 404 error when skill does not exist', async () => {
        getSkillStub.resolves(undefined);
        await handleUpdate(ctx);

        sinon.assert.calledWithExactly(ctxThrowStub, 404);
      });

      it('throws a 404 error when roleSkill does not exist', async () => {
        getRoleSkillStub.resolves(undefined);
        await handleUpdate(ctx);

        sinon.assert.calledWithExactly(ctxThrowStub, 404);
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

      return handleUpdate(ctx);
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
