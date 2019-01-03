import * as sinon from 'sinon';
import * as faker from 'faker';
import { assert } from 'chai';
import * as jwtCache from '../../../src/caches/jwt-cache';
import authenticateRequest from '../../../src/middleware/authenticate-request';
import logger from 'common/logger';

const getHandleByJwt = sinon.stub();

describe('Authenticate Request Middleware', () => {
  const ctx = {
    cookies: { get: sinon.stub() },
    redirect: sinon.stub(),
    originalUrl: '/curriculum',
    handle: undefined,
    status: undefined
  };
  const next = sinon.stub();
  let sandbox;

  before(() => {
    sandbox = sinon.createSandbox();
    sandbox.replace(jwtCache, 'getHandleByJwt', getHandleByJwt);
    sandbox.replace(logger, 'error', sinon.stub());
  });

  context('valid jwt', () => {
    const jwt = faker.random.word();
    const handle = faker.random.word();

    beforeEach(() => {
      getHandleByJwt.returns(handle);
      ctx.cookies.get.returns(jwt);
    });

    it('should set handle', async () => {
      await authenticateRequest(ctx, next);

      assert.equal(ctx.handle, handle);
    });
  });

  context('invalid jwt', () => {
    const jwt = '';
    const handle = '';

    beforeEach(() => {
      getHandleByJwt.returns(handle);
      ctx.cookies.get.returns(jwt);
    });

    it('should set status 307 and redirect', async () => {
      await authenticateRequest(ctx, next);

      assert.equal(ctx.status, 307);
      sinon.assert.calledWith(
        ctx.redirect,
        `/id?redirectTo=${encodeURIComponent(ctx.originalUrl)}`
      );
      sinon.assert.notCalled(next);
    });
  });

  afterEach(() => {
    getHandleByJwt.reset();
    ctx.cookies.get.reset();
    ctx.redirect.reset();
    next.reset();
  });

  after(() => {
    sandbox.restore();
  });
});
