import sinon from 'sinon';
import { assert } from 'chai';
import roleRepository from 'common/db/repositories/role';
import generateRole from 'common/test/fixtures/role';
import { RoleEntityMapper } from 'web/src/internal-api/import-csv/entity-mappers/role';
import validatedRows from '../../../../fixtures/validated-rows.json';

describe('RoleEntityMapper', () => {
  let sandbox: sinon.SinonSandbox;
  let getByNameStub: sinon.SinonStub;
  let getStub: sinon.SinonStub;
  let сreateStub: sinon.SinonStub;

  before(() => {
    sandbox = sinon.createSandbox();
    getByNameStub = sandbox.stub();
    getStub = sandbox.stub();
    сreateStub = sandbox.stub();
    sandbox.replace(roleRepository, 'getByName', getByNameStub);
    sandbox.replace(roleRepository, 'get', getStub);
    sandbox.replace(roleRepository, 'create', сreateStub);
  });

  describe('#getOrCreateRecords', () => {
    const row = validatedRows[0];
    let getOrCreateRolesFromRoleNameStub: sinon.SinonStub;

    let result;

    before(() => {
      getOrCreateRolesFromRoleNameStub = sandbox.stub(
        RoleEntityMapper.prototype,
        'getOrCreateRolesFromRoleName'
      );
    });

    beforeEach(async () => {
      getOrCreateRolesFromRoleNameStub.resolves([]);

      result = await new RoleEntityMapper().getOrCreateRecords(row);
    });

    it('retrieves or creates roles for each row', () => {
      assert.strictEqual(
        getOrCreateRolesFromRoleNameStub.callCount,
        row.roleNames.length
      );

      assert.strictEqual(result.length, row.roleNames.length);
    });

    after(() => {
      getOrCreateRolesFromRoleNameStub.restore();
    });
  });

  describe('#getOrCreateRolesFromRoleName', () => {
    const role = generateRole();
    const roleName = role.name;
    let result;

    context('roleName exists in DB', () => {
      beforeEach(async () => {
        getByNameStub.resolves(role);
        result = await new RoleEntityMapper().getOrCreateRolesFromRoleName(
          roleName
        );
      });

      it('retrieves role', () => {
        sinon.assert.calledOnce(getByNameStub);
        sinon.assert.calledWithExactly(getByNameStub, roleName);
        assert.deepStrictEqual(result, role);
      });
    });

    context('roleName does not exist in DB', () => {
      beforeEach(async () => {
        getByNameStub.resolves(undefined);
        сreateStub.resolves({});
        getStub.resolves(role);
        result = await new RoleEntityMapper().getOrCreateRolesFromRoleName(
          roleName
        );
      });

      it('creates role', () => {
        sinon.assert.calledOnce(сreateStub);
        sinon.assert.calledOnce(getStub);
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
