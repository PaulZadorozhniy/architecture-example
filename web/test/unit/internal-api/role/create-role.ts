import { assert } from 'chai';
import * as faker from 'faker';
import sinon from 'sinon';
import repository from 'common/db/repositories/role';
import generateRole from 'common/test/fixtures/role';
import { createRoleHandler } from '../../../../src/internal-api/role/create-handler';
import rabbit from 'common/rabbit';
import { rabbitConfig } from 'config/messaging';

describe('CREATE', () => {
  const baseCtx = {
    request: {
      body: {}
    },
    headers: {}
  };

  let sandbox: sinon.SinonSandbox;
  let ctxThrowStub;
  let getAllRolesStub;
  let getRoleStub;
  let createRoleStub;
  let publishToExchange;

  before(() => {
    sandbox = sinon.createSandbox();

    ctxThrowStub = sandbox.stub();
    getAllRolesStub = sandbox.stub();
    getRoleStub = sandbox.stub();
    createRoleStub = sandbox.stub();
    publishToExchange = sandbox.stub();

    sandbox.replace(repository, 'getAll', getAllRolesStub);
    sandbox.replace(repository, 'get', getRoleStub);
    sandbox.replace(repository, 'create', createRoleStub);
    sandbox.replace(rabbit, 'publishToExchange', publishToExchange);
  });

  context('request params are invalid', () => {
    it('sets status to 400', async () => {
      const ctx = { ...baseCtx, request: { body: {} }, throw: ctxThrowStub };
      await createRoleHandler(ctx);

      sinon.assert.calledWith(ctxThrowStub, 400);
    });
  });

  context('request params are valid', () => {
    context('non-existing baseRole id is sent', () => {
      beforeEach(() => {
        getRoleStub.resolves(undefined);
      });

      it('sets status to 400', async () => {
        const ctx = {
          ...baseCtx,
          request: {
            body: {
              name: faker.random.word(),
              baseRole: faker.random.uuid()
            }
          },
          throw: ctxThrowStub
        };

        await createRoleHandler(ctx);

        sinon.assert.calledWith(ctxThrowStub, 400);
      });
    });

    context('existing baseRole id is sent', () => {
      let baseRole;
      let role;
      let ctx;

      beforeEach(() => {
        baseRole = generateRole();
        role = generateRole(baseRole.id);

        ctx = {
          ...baseCtx,
          request: {
            body: {
              name: role.name,
              baseRole: baseRole.id
            }
          },
          body: {},
          status: null
        };
        getRoleStub.resolves(baseRole);
        createRoleStub.resolves(role);

        return createRoleHandler(ctx);
      });

      it('creates a record in DB', () => {
        const { args } = createRoleStub.getCall(0);
        const roleData = args[0];

        assert.strictEqual(roleData.name, role.name);
        assert.strictEqual(roleData.baseRole, baseRole.id);
        assert.isString(roleData.id);
      });

      it('writes the Role id to response body', () => {
        assert.deepStrictEqual(ctx.body, { id: role.id });
      });

      it('sets status to 201', () => {
        assert.strictEqual(ctx.status, 201);
      });

      it('sends message to rabbit', () => {
        sinon.assert.calledOnce(publishToExchange);
        sinon.assert.calledWithExactly(
          publishToExchange,
          rabbitConfig.exchanges.roleUpdated,
          {
            id: role.id,
            name: role.name,
            baseRole: baseRole.id
          }
        );
      });
    });

    context('baseRole is not sent', () => {
      let ctx;
      let role;

      beforeEach(() => {
        role = generateRole();
        createRoleStub.resolves(role);

        ctx = {
          ...baseCtx,
          request: {
            body: {
              name: role.name
            }
          },
          body: {},
          status: null
        };

        return createRoleHandler(ctx);
      });

      it('creates a record in DB', () => {
        const { args } = createRoleStub.getCall(0);
        const roleData = args[0];

        assert.strictEqual(roleData.name, role.name);
        assert.strictEqual(roleData.baseRole, undefined);
        assert.isString(roleData.id);
      });

      it('writes the Role id to response body', () => {
        assert.deepStrictEqual(ctx.body, { id: role.id });
      });

      it('sets status to 201', () => {
        assert.strictEqual(ctx.status, 201);
      });

      it('sends message to rabbit', () => {
        sinon.assert.calledOnce(publishToExchange);
        sinon.assert.calledWithExactly(
          publishToExchange,
          rabbitConfig.exchanges.roleUpdated,
          {
            id: role.id,
            name: role.name,
            baseRole: null
          }
        );
      });
    });
  });

  afterEach(() => sandbox.reset());

  after(() => sandbox.restore());
});
