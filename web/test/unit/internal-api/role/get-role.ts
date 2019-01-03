import { assert } from 'chai';
import sinon from 'sinon';
import repository from 'common/db/repositories/role';
import generateRole from 'common/test/fixtures/role';
import { getRoleHandler } from '../../../../src/internal-api/role/get-handler';
import rabbit from 'common/rabbit';

describe('GET ALL', () => {
  const ctx: any = {
    request: {
      body: {}
    },
    headers: {}
  };

  let sandbox: sinon.SinonSandbox;
  let getAllRolesStub;
  let getRoleStub;
  let createRoleStub;
  let publishToExchange;

  before(() => {
    sandbox = sinon.createSandbox();

    getAllRolesStub = sandbox.stub();
    getRoleStub = sandbox.stub();
    createRoleStub = sandbox.stub();
    publishToExchange = sandbox.stub();

    sandbox.replace(repository, 'getAll', getAllRolesStub);
    sandbox.replace(repository, 'get', getRoleStub);
    sandbox.replace(repository, 'create', createRoleStub);
    sandbox.replace(rabbit, 'publishToExchange', publishToExchange);
  });

  beforeEach(() => {
    getAllRolesStub.returns(
      Array(3)
        .fill(null)
        .map(() => generateRole())
    );
  });

  beforeEach(() => getRoleHandler(ctx));

  it('sets ctx.status = 200', () => {
    assert.strictEqual(ctx.status, 200);
  });

  it('writes all roles to ctx.body', () => {
    assert.isArray(ctx.body);
    assert.isNotEmpty(ctx.body);
    for (const role of ctx.body) {
      assert.hasAllKeys(role, ['id', 'name', 'baseRole']);
    }
  });

  afterEach(() => sandbox.reset());

  after(() => sandbox.restore());
});
