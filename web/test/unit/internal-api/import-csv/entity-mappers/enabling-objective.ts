import * as sinon from 'sinon';
import { times } from 'lodash';
import { assert } from 'chai';
import * as faker from 'faker';
import enablingObjectiveRepository from 'common/db/repositories/enabling-objective';
import generateTerminalObjective from 'common/test/fixtures/terminal-objective';
import { generateEnablingObjectiveRecord } from 'common/test/fixtures/enabling-objective';
import { EnablingObjectiveEntityMapper } from 'web/src/internal-api/import-csv/entity-mappers/enabling-objective';
import validatedRows from 'web/test/fixtures/validated-rows.json';
import { IRow } from 'web/src/internal-api/import-csv/csv-validator';

describe('EnablingObjectiveEntityMapper', () => {
  let sandbox: sinon.SinonSandbox;
  let getByDescriptionAndParentStub: sinon.SinonStub;
  let сreateStub: sinon.SinonStub;

  before(() => {
    sandbox = sinon.createSandbox();
    getByDescriptionAndParentStub = sandbox.stub();
    сreateStub = sandbox.stub();
    sandbox.replace(
      enablingObjectiveRepository,
      'getByDescriptionAndParent',
      getByDescriptionAndParentStub
    );
    sandbox.replace(enablingObjectiveRepository, 'create', сreateStub);
  });

  describe('#getOrCreateRecords', () => {
    const terminalObjectiveIdMap = {
      [faker.random.number()]: [faker.random.uuid()]
    };
    const getOrCreateEnablingObjectivesFromRowStubResponse = [
      generateEnablingObjectiveRecord(),
      generateEnablingObjectiveRecord()
    ];
    let getOrCreateEnablingObjectivesFromRowStub: sinon.SinonStub;
    let result;

    before(() => {
      getOrCreateEnablingObjectivesFromRowStub = sandbox.stub(
        EnablingObjectiveEntityMapper.prototype,
        'getOrCreateEnablingObjectivesFromRow'
      );

      getOrCreateEnablingObjectivesFromRowStub.resolves(
        getOrCreateEnablingObjectivesFromRowStubResponse
      );
    });

    beforeEach(async () => {
      result = await new EnablingObjectiveEntityMapper().getOrCreateRecords(
        validatedRows,
        terminalObjectiveIdMap
      );
    });

    it('retrieves or creates enabling objectives', () => {
      assert.strictEqual(
        getOrCreateEnablingObjectivesFromRowStub.callCount,
        validatedRows.length
      );

      validatedRows.forEach((row, index) => {
        const call = getOrCreateEnablingObjectivesFromRowStub.getCall(index);

        assert.deepStrictEqual(call.args[0], row);
        assert.deepStrictEqual(call.args[1], terminalObjectiveIdMap);
      });

      assert.strictEqual(
        result.length,
        validatedRows.length *
          getOrCreateEnablingObjectivesFromRowStubResponse.length
      );
    });

    after(() => getOrCreateEnablingObjectivesFromRowStub.restore());
  });

  describe('#getOrCreateEnablingObjectivesFromRow', () => {
    context('enabling objective exists in db', () => {
      const row: IRow = validatedRows[0];
      const terminalObjectives = times(2, () => generateTerminalObjective());
      let enablingObjective;
      let result;

      beforeEach(async () => {
        enablingObjective = generateEnablingObjectiveRecord();
        getByDescriptionAndParentStub.resolves(enablingObjective);

        result = await new EnablingObjectiveEntityMapper().getOrCreateEnablingObjectivesFromRow(
          row,
          {
            [row.parentObjectiveId!]: terminalObjectives.map(obj => obj.id)
          }
        );
      });

      it('retrives enabling objective', () => {
        assert.strictEqual(
          getByDescriptionAndParentStub.callCount,
          terminalObjectives.length
        );

        terminalObjectives.forEach((terminalObjective, index) => {
          sinon.assert.calledWithExactly(
            getByDescriptionAndParentStub.getCall(index),
            {
              description: row.objective,
              terminalObjectiveId: terminalObjective.id
            }
          );

          assert.deepStrictEqual(
            result,
            times(terminalObjectives.length, () => enablingObjective)
          );
        });
      });

      afterEach(() => sandbox.reset());
    });

    context('enabling objective does not exist in db', () => {
      const row = validatedRows[0];
      const terminalObjectives = times(2, () => generateTerminalObjective());
      let enablingObjective;
      let result;

      beforeEach(async () => {
        enablingObjective = generateEnablingObjectiveRecord();
        getByDescriptionAndParentStub.resolves(null);
        сreateStub.resolves(enablingObjective);

        result = await new EnablingObjectiveEntityMapper().getOrCreateEnablingObjectivesFromRow(
          row,
          {
            [row.parentObjectiveId!]: terminalObjectives.map(obj => obj.id)
          }
        );
      });

      it('retrives enabling objective', () => {
        assert.strictEqual(
          getByDescriptionAndParentStub.callCount,
          terminalObjectives.length
        );
        assert.strictEqual(сreateStub.callCount, terminalObjectives.length);

        terminalObjectives.forEach((terminalObjective, index) => {
          sinon.assert.calledWithExactly(
            getByDescriptionAndParentStub.getCall(index),
            {
              description: row.objective,
              terminalObjectiveId: terminalObjective.id
            }
          );

          assert.deepStrictEqual(
            result,
            times(terminalObjectives.length, () => enablingObjective)
          );
        });
      });
    });
  });

  after(() => sandbox.restore());
});
