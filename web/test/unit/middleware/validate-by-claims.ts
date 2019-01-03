import * as sinon from 'sinon';
import config from 'config/common';
import * as faker from 'faker';
import * as userClaimsCache from '../../../src/caches/user-claims-cache';
import validateByClaims from '../../../src/middleware/validate-by-claims';

const getClaimsByHandle = sinon.stub();

describe('Validate By Claims Middleware', () => {
  const ctx = {
    handle: faker.random.word(),
    throw: sinon.stub()
  };
  const next = sinon.stub();
  let sandbox;

  before(() => {
    sandbox = sinon.createSandbox();
    sandbox.replace(userClaimsCache, 'getClaimsByHandle', getClaimsByHandle);
  });

  context('user has allowed claims', () => {
    beforeEach(() => {
      getClaimsByHandle.returns(config.allowedClaims);
    });

    it('should call next()', async () => {
      await validateByClaims(ctx, next);

      sinon.assert.calledOnce(next);
    });
  });

  context('user does not have allowed claims', () => {
    beforeEach(() => {
      getClaimsByHandle.returns([]);
    });

    it('should throw 403 error', async () => {
      await validateByClaims(ctx, next);

      sinon.assert.calledWith(ctx.throw, 403);
      sinon.assert.notCalled(next);
    });
  });

  afterEach(() => {
    getClaimsByHandle.reset();
    ctx.throw.reset();
    next.reset();
  });

  after(() => {
    sandbox.restore();
  });
});
