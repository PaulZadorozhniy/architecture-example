import sinon from 'sinon';
import * as faker from 'faker';
import { InsertData } from 'web/src/internal-api/import-csv/insert-data';
import validatedRows from '../../../fixtures/validated-rows.json';
import { assert } from 'chai';
import { RoleEntityMapper } from 'web/src/internal-api/import-csv/entity-mappers/role';
import { SkillEntityMapper } from 'web/src/internal-api/import-csv/entity-mappers/skill';
import { TerminalObjectiveEntityMapper } from 'web/src/internal-api/import-csv/entity-mappers/terminal-objective';
import { EnablingObjectiveEntityMapper } from 'web/src/internal-api/import-csv/entity-mappers/enabling-objective';
import { generateRoleRecord } from 'common/test/fixtures/role';
import { times, flatMap } from 'lodash';
import { generateSkillRecord } from 'common/test/fixtures/skill';
import { generateRoleSkillRecord } from 'common/test/fixtures/role-skill';
import { generateTerminalObjectiveRecord } from 'common/test/fixtures/terminal-objective';
import { IRow } from 'web/src/internal-api/import-csv/csv-validator';
import { RoleSkillEntityMapper } from 'web/src/internal-api/import-csv/entity-mappers/role-skill';

describe('insert data', () => {
  const insertData = new InsertData();
  const email = faker.internet.email();

  let sandbox;

  before(() => {
    sandbox = sinon.createSandbox();
  });

  describe('#groupRowsByObjectiveType', () => {
    let result;

    beforeEach(() => {
      result = insertData.groupRowsByObjectiveType(validatedRows);
    });

    it('divides rows into terminal and enabling objectives', () => {
      assert.hasAllKeys(result, [
        'terminalObjectiveRows',
        'enablingObjectiveRows'
      ]);
    });

    it('puts rows without parentObjectiveId into terminalObjectiveRows', () => {
      assert.isNotEmpty(result.terminalObjectiveRows);
      result.terminalObjectiveRows.forEach(objective =>
        assert.isNull(objective.parentObjectiveId)
      );
    });

    it('puts rows with parentObjectiveId into enablingObjectiveRows', () => {
      assert.isNotEmpty(result.enablingObjectiveRows);
      result.enablingObjectiveRows.forEach(objective =>
        assert.isNotNull(objective.parentObjectiveId)
      );
    });
  });

  describe('#getOrCreateEntities', () => {
    let getOrCreateEntitiesFromRowStub;

    before(() => {
      getOrCreateEntitiesFromRowStub = sandbox.stub();
      sandbox.replace(
        insertData,
        'getOrCreateEntitiesFromRow',
        getOrCreateEntitiesFromRowStub
      );
    });

    beforeEach(() => {
      getOrCreateEntitiesFromRowStub.resolves([
        faker.random.number(),
        [faker.random.uuid()]
      ]);
    });

    it('returns entities for each row', async () => {
      await insertData.getOrCreateEntities(validatedRows, email);

      const calls = getOrCreateEntitiesFromRowStub.getCalls();

      assert.lengthOf(calls, validatedRows.length);
      calls.forEach((call, index) => {
        assert.equal(call.args[0], email);
        assert.equal(call.args[1], validatedRows[index]);
      });
    });

    after(() => {
      sandbox.restore();
    });
  });

  describe('#getOrCreateEntitiesFromRow', () => {
    const terminalObjectiveRow: IRow = {
      learningObjectiveId: faker.random.number(),
      parentObjectiveId: null,
      objectiveType: 'terminal',
      bloomsLevel: 'Remember',
      objective: faker.random.word(),
      skillNames: [faker.random.word()],
      roleNames: [faker.random.word()],
      skillCurriculumLeadEmail: faker.internet.email()
    };
    const roles = times(5, () => generateRoleRecord());
    const skills = times(5, () => generateSkillRecord());

    const roleSkills = flatMap(roles, role =>
      skills.map(skill =>
        generateRoleSkillRecord({ roleId: role.id, skillId: skill.id })
      )
    );
    const terminalObjectives = times(5, () =>
      generateTerminalObjectiveRecord()
    );

    let roleGetOrCreateRecordsStub;
    let skillGetOrCreateRecordsStub;
    let roleSkillGetOrCreateRecordsStub;
    let terminalObjectiveGetOrCreateRecordsStub;

    let result;

    before(() => {
      roleGetOrCreateRecordsStub = sandbox.stub();
      skillGetOrCreateRecordsStub = sandbox.stub();
      roleSkillGetOrCreateRecordsStub = sandbox.stub();
      terminalObjectiveGetOrCreateRecordsStub = sandbox.stub();

      sandbox.replace(
        RoleEntityMapper.prototype,
        'getOrCreateRecords',
        roleGetOrCreateRecordsStub
      );
      sandbox.replace(
        SkillEntityMapper.prototype,
        'getOrCreateRecords',
        skillGetOrCreateRecordsStub
      );
      sandbox.replace(
        RoleSkillEntityMapper.prototype,
        'getOrCreateRecords',
        roleSkillGetOrCreateRecordsStub
      );
      sandbox.replace(
        TerminalObjectiveEntityMapper.prototype,
        'getOrCreateRecords',
        terminalObjectiveGetOrCreateRecordsStub
      );
    });

    beforeEach(async () => {
      roleGetOrCreateRecordsStub.resolves(roles);
      skillGetOrCreateRecordsStub.resolves(skills);
      roleSkillGetOrCreateRecordsStub.resolves(roleSkills);
      terminalObjectiveGetOrCreateRecordsStub.resolves(terminalObjectives);

      result = await insertData.getOrCreateEntitiesFromRow(
        email,
        terminalObjectiveRow
      );
    });

    it('returns a tuple with the objective id from row and an array of ids of created objectives', () => {
      assert.isArray(result);
      assert.deepEqual(result[0], terminalObjectiveRow.learningObjectiveId);
      assert.deepEqual(result[1], terminalObjectives.map(obj => obj.id));
    });

    after(() => {
      sandbox.restore();
    });
  });

  describe('#importRowsIntoDb', () => {
    let groupRowsByObjectiveTypeStub;
    let getOrCreateEntitiesStub;
    let enablingObjectiveGetOrCreateRecordsStub;

    before(() => {
      groupRowsByObjectiveTypeStub = sandbox.stub();
      getOrCreateEntitiesStub = sandbox.stub();
      enablingObjectiveGetOrCreateRecordsStub = sandbox.stub();

      sandbox.replace(
        insertData,
        'groupRowsByObjectiveType',
        groupRowsByObjectiveTypeStub
      );
      sandbox.replace(
        insertData,
        'getOrCreateEntities',
        getOrCreateEntitiesStub
      );
      sandbox.replace(
        EnablingObjectiveEntityMapper.prototype,
        'getOrCreateRecords',
        enablingObjectiveGetOrCreateRecordsStub
      );
    });

    beforeEach(() => {
      groupRowsByObjectiveTypeStub.resolves({
        terminalObjectiveRows: [],
        enablingObjectiveRows: []
      });
    });

    it('retrieves or creates entities based on data parsed from csv', async () => {
      await insertData.importRowsIntoDb(validatedRows, email);

      sinon.assert.calledOnce(groupRowsByObjectiveTypeStub);
      sinon.assert.calledOnce(getOrCreateEntitiesStub);
      sinon.assert.calledOnce(enablingObjectiveGetOrCreateRecordsStub);
    });

    after(() => {
      sandbox.restore();
    });
  });

  afterEach(() => {
    sandbox.reset();
  });
});
