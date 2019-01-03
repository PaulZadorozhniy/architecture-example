import * as faker from 'faker';
import { assert } from 'chai';
import sinon, { SinonStub, SinonSandbox } from 'sinon';
import getHandler from 'external-api/src/self-healing/role/get-handler';
import roleRepository from 'common/db/repositories/role';
import { generateRoleRecord } from 'common/test/fixtures/role';
import { RoleModel } from 'common/db/models/role';

describe('GET', () => {
  let sandbox: SinonSandbox;
  let getRoleStub: SinonStub;
  let ctx;
  let role: RoleModel;

  before(() => {
    sandbox = sinon.createSandbox();
    getRoleStub = sandbox.stub();
    sandbox.replace(roleRepository, 'get', getRoleStub);
  });

  context('valid input', () => {
    beforeEach(async () => {
      role = generateRoleRecord();

      getRoleStub.resolves(role);

      ctx = {
        params: { id: role.id }
      };

      await getHandler(ctx);
    });

    it('sets ctx.status to 200', () => {
      assert.strictEqual(ctx.status, 200);
    });

    it('sets ctx.body terminal objective data', () => {
      assert.deepEqual(ctx.body, role);
    });

    it('calls repository with righ params', () => {
      sinon.assert.calledOnce(getRoleStub);
      sinon.assert.calledWithExactly(getRoleStub, role.id);
    });
  });

  context('role does not exist', () => {
    let ctxThrow;

    before(async () => {
      ctxThrow = sandbox.stub();
      ctx = {
        params: { id: faker.random.uuid(), roleId: faker.random.uuid() },
        throw: ctxThrow
      };

      getRoleStub.resolves(undefined);

      await getHandler(ctx);
    });

    it('throws 404 error', () => {
      sinon.assert.calledOnce(ctxThrow);
      sinon.assert.calledWithExactly(ctxThrow, 404);
    });
  });

  afterEach(() => {
    sandbox.reset();
  });

  after(() => {
    sandbox.restore();
  });
});
