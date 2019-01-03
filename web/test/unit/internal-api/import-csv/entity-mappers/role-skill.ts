import sinon from 'sinon';
import * as faker from 'faker';
import { assert } from 'chai';
import roleSkillRepository from 'common/db/repositories/role-skill';
import { generateRoleRecord } from 'common/test/fixtures/role';
import { RoleSkillEntityMapper } from 'web/src/internal-api/import-csv/entity-mappers/role-skill';
import { times } from 'lodash';
import { generateSkillRecord } from 'common/test/fixtures/skill';
import { generateRoleSkillRecord } from 'common/test/fixtures/role-skill';

describe('RoleSkillEntityMapper', () => {
  let sandbox: sinon.SinonSandbox;
  let getStub: sinon.SinonStub;
  let сreateStub: sinon.SinonStub;

  before(() => {
    sandbox = sinon.createSandbox();
    getStub = sandbox.stub();
    сreateStub = sandbox.stub();
    sandbox.replace(roleSkillRepository, 'get', getStub);
    sandbox.replace(roleSkillRepository, 'create', сreateStub);
  });

  describe('#getOrCreateRecords', () => {
    const roles = times(10, () => generateRoleRecord());
    const skills = times(10, () => generateSkillRecord());

    let getOrCreateRoleSkillsForEachRoleStub: sinon.SinonStub;

    let result;

    before(() => {
      getOrCreateRoleSkillsForEachRoleStub = sandbox.stub(
        RoleSkillEntityMapper.prototype,
        'getOrCreateRoleSkillsForEachRole'
      );
    });

    beforeEach(async () => {
      getOrCreateRoleSkillsForEachRoleStub.resolves(
        times(10, () =>
          generateRoleSkillRecord({
            roleId: faker.random.uuid(),
            skillId: faker.random.uuid()
          })
        )
      );

      result = await new RoleSkillEntityMapper().getOrCreateRecords(
        roles,
        skills
      );
    });

    it('retrieves or creates rolesSkills for each role', () => {
      const expectedResultLength = roles.length * skills.length;

      assert.strictEqual(
        getOrCreateRoleSkillsForEachRoleStub.callCount,
        roles.length
      );

      assert.strictEqual(result.length, expectedResultLength);
    });

    after(() => {
      getOrCreateRoleSkillsForEachRoleStub.restore();
    });
  });

  describe('#getOrCreateRoleSkillsForEachRole', () => {
    const role = generateRoleRecord();
    const skills = times(10, () => generateSkillRecord());

    let getOrCreateRoleSkillStub: sinon.SinonStub;

    let result;

    before(() => {
      getOrCreateRoleSkillStub = sandbox.stub(
        RoleSkillEntityMapper.prototype,
        'getOrCreateRoleSkill'
      );
    });

    beforeEach(async () => {
      getOrCreateRoleSkillStub.resolves(
        generateRoleSkillRecord({
          roleId: faker.random.uuid(),
          skillId: faker.random.uuid()
        })
      );

      result = await new RoleSkillEntityMapper().getOrCreateRoleSkillsForEachRole(
        skills,
        role
      );
    });

    it('retrieves or creates rolesSkills for each skill and a given role', () => {
      const expectedResultLength = skills.length;

      assert.strictEqual(
        getOrCreateRoleSkillStub.callCount,
        expectedResultLength
      );

      assert.strictEqual(result.length, expectedResultLength);
    });

    after(() => {
      getOrCreateRoleSkillStub.restore();
    });
  });

  describe('#getOrCreateRoleSkill', () => {
    const role = generateRoleRecord();
    const skill = generateSkillRecord();

    let result;

    context('roleSkill exists in DB', () => {
      beforeEach(async () => {
        getStub.onCall(0).resolves(role);
        result = await new RoleSkillEntityMapper().getOrCreateRoleSkill(
          role,
          skill
        );
      });

      it('retrieves roleSkill', () => {
        sinon.assert.calledOnce(getStub);
        sinon.assert.calledWithExactly(getStub, role.id, skill.id);
        assert.deepStrictEqual(result, role);
      });
    });

    context('roleSkill does not exist in DB', () => {
      beforeEach(async () => {
        getStub.onCall(0).resolves(undefined);
        getStub.onCall(1).resolves(role);
        result = await new RoleSkillEntityMapper().getOrCreateRoleSkill(
          role,
          skill
        );
      });

      it('creates roleSkill', () => {
        sinon.assert.calledOnce(сreateStub);
        sinon.assert.calledTwice(getStub);
        assert.deepStrictEqual(result, role);
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
