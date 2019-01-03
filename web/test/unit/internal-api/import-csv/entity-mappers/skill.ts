import sinon from 'sinon';
import * as faker from 'faker';
import { assert } from 'chai';
import { times } from 'lodash';
import skillRepository from 'common/db/repositories/skill';
import { generateSkillRecord } from 'common/test/fixtures/skill';
import { SkillEntityMapper } from 'web/src/internal-api/import-csv/entity-mappers/skill';
import * as accountCache from 'web/src/caches/account-cache';
import validatedRows from '../../../../fixtures/validated-rows.json';

describe('SkillEntityMapper', () => {
  let sandbox: sinon.SinonSandbox;
  let getByNameStub: sinon.SinonStub;
  let getStub: sinon.SinonStub;
  let сreateStub: sinon.SinonStub;
  let updateStub: sinon.SinonStub;

  before(() => {
    sandbox = sinon.createSandbox();
    getByNameStub = sandbox.stub();
    getStub = sandbox.stub();
    сreateStub = sandbox.stub();
    updateStub = sandbox.stub();
    sandbox.replace(skillRepository, 'getByName', getByNameStub);
    sandbox.replace(skillRepository, 'get', getStub);
    sandbox.replace(skillRepository, 'create', сreateStub);
    sandbox.replace(skillRepository, 'update', updateStub);
  });

  describe('#getOrCreateRecords', () => {
    const email = faker.internet.email();
    const row = validatedRows[0];
    let getOrCreateSkillsFromSkillNameStub: sinon.SinonStub;
    let getAccountByEmailStub: sinon.SinonStub;

    before(() => {
      getOrCreateSkillsFromSkillNameStub = sandbox.stub(
        SkillEntityMapper.prototype,
        'getOrCreateSkillsFromSkillName'
      );
      getAccountByEmailStub = sandbox.stub(accountCache, 'getAccountByEmail');
    });

    beforeEach(async () => {
      getOrCreateSkillsFromSkillNameStub.resolves([]);
      getAccountByEmailStub.resolves({ handle: faker.random.uuid() });
    });

    context('row has an email', () => {
      beforeEach(() => new SkillEntityMapper().getOrCreateRecords(row, email));

      it('gets account info for the email from row', () => {
        sinon.assert.calledOnce(getAccountByEmailStub);
        sinon.assert.calledWithExactly(
          getAccountByEmailStub,
          row.skillCurriculumLeadEmail
        );
      });
    });

    context('row has no email', () => {
      const rowWithoutEmail = {
        ...validatedRows[0],
        skillCurriculumLeadEmail: ''
      };

      beforeEach(() =>
        new SkillEntityMapper().getOrCreateRecords(rowWithoutEmail, email)
      );

      it('gets account info for the email of the current user', () => {
        sinon.assert.calledOnce(getAccountByEmailStub);
        sinon.assert.calledWithExactly(getAccountByEmailStub, email);
      });
    });

    it('retrieves or creates skills for each row', async () => {
      const expectedCount = 10;
      const rowWithMultipleSkills = {
        ...row,
        skillNames: times(expectedCount, () => faker.random.word())
      };

      const result = await new SkillEntityMapper().getOrCreateRecords(
        rowWithMultipleSkills,
        email
      );

      assert.strictEqual(
        getOrCreateSkillsFromSkillNameStub.callCount,
        expectedCount
      );

      assert.strictEqual(result.length, expectedCount);
    });

    after(() => {
      getOrCreateSkillsFromSkillNameStub.restore();
    });
  });

  describe('#getOrCreateRolesFromRoleName', () => {
    const handle = faker.random.uuid();
    const skill = generateSkillRecord();
    const skillName = skill.name;

    let result;

    context('skillName exists in DB', () => {
      context('skill in the DB has a different curriculum lead handle', () => {
        const skillWithDiffHandle = {
          ...skill,
          curriculumLeadHandle: faker.random.uuid()
        };

        beforeEach(async () => {
          getByNameStub.resolves(skillWithDiffHandle);
          getStub.resolves(skillWithDiffHandle);
          result = await new SkillEntityMapper().getOrCreateSkillsFromSkillName(
            handle,
            skillName
          );
        });

        it('changes the curriculum lead handle of the skill in the DB', () => {
          sinon.assert.calledOnce(updateStub);
          sinon.assert.calledWithExactly(updateStub, skillWithDiffHandle.id, {
            curriculumLeadHandle: handle
          });
        });

        it('returns the updated skill', () => {
          assert.deepStrictEqual(result, skillWithDiffHandle);
        });
      });

      context('skill in the DB has the same curriculum lead handle', () => {
        const skillWithSameHandle = {
          ...skill,
          curriculumLeadHandle: handle
        };

        beforeEach(async () => {
          getByNameStub.resolves(skillWithSameHandle);
          result = await new SkillEntityMapper().getOrCreateSkillsFromSkillName(
            handle,
            skillName
          );
        });

        it('does not change the found skill', () => {
          sinon.assert.notCalled(updateStub);
        });

        it('returns the found skill', () => {
          assert.deepStrictEqual(result, skillWithSameHandle);
        });
      });
    });

    context('skillName does not exist in DB', () => {
      beforeEach(async () => {
        getByNameStub.resolves(undefined);
        сreateStub.resolves({});
        getStub.resolves(skill);
        result = await new SkillEntityMapper().getOrCreateSkillsFromSkillName(
          handle,
          skillName
        );
      });

      it('creates skill', () => {
        sinon.assert.calledOnce(сreateStub);
        sinon.assert.calledOnce(getStub);
      });

      it('returns skill', () => {
        assert.deepStrictEqual(result, skill);
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
