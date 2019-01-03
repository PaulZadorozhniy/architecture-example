import { assert } from 'chai';
import * as faker from 'faker';
import fp from 'lodash/fp';
import sinon, { SinonStub, SinonSandbox } from 'sinon';
import { times } from 'lodash';
import skillInteractor from 'common/interactors/skill';
import skillRepository from 'common/db/repositories/skill';
import terminalObjectiveRepository from 'common/db/repositories/terminal-objective';
import terminalObjectiveInteractor from 'common/interactors/terminal-objective';
import { RoleSkillModel } from 'common/db/models/role-skill';
import { SkillModel } from 'common/db/models/skill';
import { generateRoleSkillRecord } from 'common/test/fixtures/role-skill';
import { generateSkillRecord } from 'common/test/fixtures/skill';
import rabbit from 'common/rabbit';
import { SkillMessage } from 'common/entities/skill';
import { rabbitConfig } from 'config/messaging';
import { generateTerminalObjectiveRecord } from 'common/test/fixtures/terminal-objective';
import { TerminalObjectiveModel } from 'common/db/models/terminal-objective';

describe('Skill', () => {
  let sandbox: SinonSandbox;

  before(() => {
    sandbox = sinon.createSandbox();
  });

  describe('#retire', () => {
    let reason: string;
    let roleSkill: RoleSkillModel;
    let skill: SkillModel;
    let terminalObjectives: TerminalObjectiveModel[];

    let retireSkillStub: SinonStub;
    let getAllObjectivesStub: SinonStub;
    let retireObjectivesStub: SinonStub;
    let publishToExchangeStub: SinonStub;

    before(() => {
      reason = faker.random.word();
      skill = generateSkillRecord();
      terminalObjectives = times(3, () => generateTerminalObjectiveRecord());
      roleSkill = generateRoleSkillRecord({
        roleId: faker.random.uuid(),
        skillId: skill.id
      });

      retireSkillStub = sandbox.stub();
      getAllObjectivesStub = sandbox.stub();
      retireObjectivesStub = sandbox.stub();
      publishToExchangeStub = sandbox.stub();

      sandbox.replace(skillRepository, 'retire', retireSkillStub);
      sandbox.replace(
        terminalObjectiveRepository,
        'getBySkill',
        getAllObjectivesStub
      );
      sandbox.replace(
        terminalObjectiveInteractor,
        'retire',
        retireObjectivesStub
      );
      sandbox.replace(rabbit, 'publishToExchange', publishToExchangeStub);
    });

    beforeEach(() => {
      getAllObjectivesStub.resolves(terminalObjectives);
      retireObjectivesStub.resolves();
      retireSkillStub.resolves(true);
    });

    context('roleSkill is not related to skill', () => {
      it('throws an error', async () => {
        const badRoleSkill = fp.set('skillId', faker.random.uuid(), roleSkill);

        try {
          await skillInteractor.retire(skill, badRoleSkill, reason);

          return Promise.reject(new Error('Did not throw'));
        } catch (error) {
          assert.ok(error);
        }
      });
    });

    context('roleSkill is related to skill', () => {
      it('retires the children objectives', async () => {
        await skillInteractor.retire(skill, roleSkill, reason);

        assert.strictEqual(
          retireObjectivesStub.callCount,
          terminalObjectives.length
        );
      });

      context('objective retire failed', () => {
        beforeEach(() => {
          retireObjectivesStub.rejects(new Error());
        });

        it('throws an error, does not retire the skill', async () => {
          try {
            await skillInteractor.retire(skill, roleSkill, reason);

            return Promise.reject(new Error('Did not throw'));
          } catch (error) {
            assert.ok(error);
            sinon.assert.notCalled(retireSkillStub);
          }
        });
      });

      context('objective retire succeeded', () => {
        it('retires the skill', async () => {
          await skillInteractor.retire(skill, roleSkill, reason);

          sinon.assert.calledOnce(retireSkillStub);
        });

        context('skill retire failed', () => {
          beforeEach(() => {
            retireSkillStub.rejects(new Error());
          });

          it('throws an error', async () => {
            try {
              await skillInteractor.retire(skill, roleSkill, reason);

              return Promise.reject(new Error('Did not throw'));
            } catch (error) {
              assert.ok(error);
            }
          });
        });

        context('skill retire succeeded', () => {
          let retiredSkill;

          context('skill is not in draft mode', () => {
            let skillNotInDraft;

            before(() => {
              skillNotInDraft = fp.set('isDraft', false, skill);
            });

            beforeEach(() => {
              retiredSkill = {
                ...skillNotInDraft,
                isDeleted: true,
                deleteReason: reason
              };

              retireSkillStub.resolves(retiredSkill);
            });

            it('sends retire skill message to rabbit', async () => {
              await skillInteractor.retire(skillNotInDraft, roleSkill, reason);

              sinon.assert.calledOnce(publishToExchangeStub);
              sinon.assert.calledWithExactly(
                publishToExchangeStub,
                rabbitConfig.exchanges.skillUpdated,
                new SkillMessage(retiredSkill, roleSkill)
              );
            });
          });

          context('skill is in draft mode', () => {
            let skillInDraft;

            before(() => {
              skillInDraft = fp.set('isDraft', true, skill);
            });

            it('does not send a retire skill message to rabbit', async () => {
              await skillInteractor.retire(skillInDraft, roleSkill, reason);

              sinon.assert.notCalled(publishToExchangeStub);
            });
          });
        });
      });
    });
  });

  describe('#get', () => {
    const skill = generateSkillRecord();

    let getSkillStub: SinonStub;

    before(() => {
      getSkillStub = sandbox.stub();
      sandbox.replace(skillRepository, 'get', getSkillStub);
    });

    context('skill does not exist', () => {
      beforeEach(() => {
        getSkillStub.resolves(undefined);
      });

      it('returns undefined', async () => {
        const result = await skillInteractor.get(skill.id);

        assert.isUndefined(result);
      });
    });

    context('skill exists and is retired', () => {
      beforeEach(() => {
        getSkillStub.resolves({
          ...skill,
          isDeleted: true
        });
      });

      it('returns undefined', async () => {
        const result = await skillInteractor.get(skill.id);

        assert.isUndefined(result);
      });
    });

    context('skill exists and is not retired', () => {
      beforeEach(() => {
        getSkillStub.resolves({
          ...skill,
          isDeleted: false
        });
      });

      it('returns an skill', async () => {
        const result = await skillInteractor.get(skill.id);

        assert.deepStrictEqual(result, skill);
      });
    });
  });

  afterEach(() => sandbox.reset());
  after(() => sandbox.restore());
});
