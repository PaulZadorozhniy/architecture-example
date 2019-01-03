import sinon from 'sinon';
import fp from 'lodash/fp';
import * as faker from 'faker';
import apiTokenRepository from 'common/db/repositories/api-token';
import { generateApiTokenRecord } from 'common/test/fixtures/api-token';
import apiTokenVerification from 'external-api/src/middleware/api-token-verification';

describe('API token verification', () => {
  const baseCtx = {
    request: {
      headers: {}
    }
  };

  let middleware;

  let sandbox: sinon.SinonSandbox;
  let ctxThrowStub: sinon.SinonStub;
  let apiTokenRepoGetStub;
  let nextStub;

  before(() => {
    sandbox = sinon.createSandbox();

    ctxThrowStub = sandbox.stub();
    apiTokenRepoGetStub = sandbox.stub();
    nextStub = sandbox.stub();

    sandbox.replace(apiTokenRepository, 'get', apiTokenRepoGetStub);
  });

  beforeEach(() => {
    middleware = apiTokenVerification();
  });

  context('token was not passed in request headers', () => {
    it('throws an exception', async () => {
      const ctx = fp.set('throw', ctxThrowStub, baseCtx);

      await middleware(ctx, nextStub);

      sinon.assert.calledWithExactly(ctxThrowStub, 401);
    });
  });

  context('token was passed in request headers', () => {
    const token = faker.random.uuid();
    const tokenHeader = `Bearer ${token}`;
    let ctx;

    beforeEach(() => {
      ctx = fp.pipe(
        fp.set('request.headers.authorization', tokenHeader),
        fp.set('throw', ctxThrowStub)
      )(baseCtx);
    });

    beforeEach(() => {
      apiTokenRepoGetStub.resolves(generateApiTokenRecord());
    });

    it('checks if token exists in the repository', async () => {
      await middleware(ctx, nextStub);

      sinon.assert.calledWithExactly(apiTokenRepoGetStub, { token });
    });

    context('token exists in the repository', () => {
      it('does not throw an exception and calls next()', async () => {
        await middleware(ctx, nextStub);

        sinon.assert.notCalled(ctxThrowStub);
      });
    });

    context('token does not exist in the repository', () => {
      beforeEach(() => {
        apiTokenRepoGetStub.resolves(undefined);
      });

      it('throws an exception', async () => {
        await middleware(ctx, nextStub);

        sinon.assert.calledWithExactly(ctxThrowStub, 401);
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
