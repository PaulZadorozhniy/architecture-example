import * as sinon from 'sinon';
import * as faker from 'faker';
import { assert } from 'chai';
import accountInfo from '../../fixtures/account-info';
import * as accountCache from '../../../src/caches/account-cache';
import getAccountInfoByHandle from '../../../src/middleware/get-account-info-by-handle';
import logger from 'common/logger';

const getAccountByHandle = sinon.stub();

describe('Get Account Info middleware', () => {
  const ctx: any = {
    handle: faker.random.word(),
    throw: sinon.stub()
  };
  const next = sinon.stub();

  let sandbox;

  before(() => {
    sandbox = sinon.createSandbox();
    sandbox.replace(accountCache, 'getAccountByHandle', getAccountByHandle);
    sandbox.replace(logger, 'error', sinon.stub());
  });

  context('account has been retrieved from cache', () => {
    beforeEach(() => {
      getAccountByHandle.resolves(accountInfo);
    });

    it('should call next()', async () => {
      await getAccountInfoByHandle(ctx, next);

      sinon.assert.calledOnce(next);
    });

    it('should set firstName and email', async () => {
      await getAccountInfoByHandle(ctx, next);

      assert.equal(ctx.firstName, accountInfo.firstName);
      assert.equal(ctx.email, accountInfo.email);
    });
  });

  context('account cache throws an error', () => {
    beforeEach(() => {
      getAccountByHandle.rejects();
    });

    it('should throw 500', async () => {
      await getAccountInfoByHandle(ctx, next);

      sinon.assert.calledWith(ctx.throw, 500);
    });
  });

  afterEach(() => {
    getAccountByHandle.reset();
    next.reset();
    ctx.throw();
  });

  after(() => {
    sandbox.restore();
  });
});
