import { assert } from 'chai';
import * as sinon from 'sinon';
import { times } from 'lodash';
import { generateTerminalObjectiveRecord } from 'common/test/fixtures/terminal-objective';
import terminalObjectiveRepository from 'common/db/repositories/terminal-objective';
import { TerminalObjectiveEntityMapper } from 'web/src/internal-api/import-csv/entity-mappers/terminal-objective';
import validatedRows from '../../../../fixtures/validated-rows.json';
import { generateSkillRecord } from 'common/test/fixtures/skill';
import { TerminalObjective } from 'common/entities/terminal-objective';

describe('TerminalObjectiveEntityMapper', () => {
  let sandbox: sinon.SinonSandbox;
  let findOneStub: sinon.SinonStub;
  let сreateStub: sinon.SinonStub;

  before(() => {
    sandbox = sinon.createSandbox();
    findOneStub = sandbox.stub();
    сreateStub = sandbox.stub();
    sandbox.replace(terminalObjectiveRepository, 'findOne', findOneStub);
    sandbox.replace(terminalObjectiveRepository, 'create', сreateStub);
  });

  describe('#getOrCreateRecords', () => {
    const skills = times(2, () => generateSkillRecord());
    const getOrCreateTerminalObjectivesFromSkillStubResponse = [
      generateTerminalObjectiveRecord(),
      generateTerminalObjectiveRecord()
    ];
    let getOrCreateTerminalObjectivesFromSkillStub: sinon.SinonStub;
    let result;
    let row;

    before(() => {
      getOrCreateTerminalObjectivesFromSkillStub = sandbox.stub(
        TerminalObjectiveEntityMapper.prototype,
        'getOrCreateTerminalObjectivesFromSkill'
      );

      getOrCreateTerminalObjectivesFromSkillStub.resolves(
        getOrCreateTerminalObjectivesFromSkillStubResponse
      );
    });

    beforeEach(async () => {
      row = validatedRows[0];
      result = await new TerminalObjectiveEntityMapper().getOrCreateRecords(
        row,
        skills
      );
    });

    it('retrives or creates terminal objectives', () => {
      assert.strictEqual(
        getOrCreateTerminalObjectivesFromSkillStub.callCount,
        skills.length
      );

      skills.forEach((skill, index) => {
        const call = getOrCreateTerminalObjectivesFromSkillStub.getCall(index);

        assert.deepStrictEqual(call.args[0], row);
        assert.deepStrictEqual(call.args[1], skill);
      });

      assert.strictEqual(result.length, skills.length);
    });

    after(() => getOrCreateTerminalObjectivesFromSkillStub.restore());
  });

  describe('#getOrCreateTerminalObjectivesFromSkill', () => {
    context('terminal objective exists in db', () => {
      const row = validatedRows[0];
      const skill = generateSkillRecord();
      let terminalObjective;
      let result;

      beforeEach(async () => {
        terminalObjective = generateTerminalObjectiveRecord();
        findOneStub.resolves(terminalObjective);

        result = await new TerminalObjectiveEntityMapper().getOrCreateTerminalObjectivesFromSkill(
          row,
          skill
        );
      });

      it('retrieves a terminal objective', () => {
        sinon.assert.calledOnce(findOneStub);

        sinon.assert.calledWithExactly(
          findOneStub,
          {
            description: row.objective,
            skillId: skill.id
          },
          { withRelations: false }
        );

        assert.deepStrictEqual(
          result,
          new TerminalObjective(terminalObjective)
        );
      });

      afterEach(() => sandbox.reset());
    });

    context('terminal objective does not exist in db', () => {
      const row = validatedRows[0];
      const skill = generateSkillRecord();
      let terminalObjective;
      let result;

      beforeEach(async () => {
        terminalObjective = generateTerminalObjectiveRecord();
        findOneStub.onCall(0).resolves(null);
        findOneStub.onCall(1).resolves(terminalObjective);

        result = await new TerminalObjectiveEntityMapper().getOrCreateTerminalObjectivesFromSkill(
          row,
          skill
        );
      });

      it('retrives terminal objective', () => {
        sinon.assert.calledTwice(findOneStub);
        sinon.assert.calledOnce(сreateStub);

        assert.deepStrictEqual(
          result,
          new TerminalObjective(terminalObjective)
        );
      });
    });
  });

  after(() => sandbox.restore());
});
