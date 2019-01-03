import * as sinon from 'sinon';
import * as faker from 'faker';
import { assert } from 'chai';
import * as prismCache from '../../../src/caches/prism-cache';
import getPrismPayloadByHandle from '../../../src/middleware/get-prism-payload-by-handle';
import logger from 'common/logger';

const getPayloadByHandle = sinon.stub();

describe('Get Prism Payload Middleware', () => {
  const prismPayload = { payload: { key: faker.random.word() } };
  const ctx: any = { handle: faker.random.word(), throw: sinon.stub() };
  const next = sinon.stub();
  let sandbox;

  before(() => {
    sandbox = sinon.createSandbox();
    sandbox.replace(prismCache, 'getPayloadByHandle', getPayloadByHandle);
    sandbox.replace(logger, 'error', sinon.stub());
  });

  context('payload retrieved from prism cache', () => {
    beforeEach(() => {
      getPayloadByHandle.returns(prismPayload);
    });

    it('should set prismPayload', async () => {
      await getPrismPayloadByHandle(ctx, next);

      assert.equal(ctx.prismPayload, prismPayload.payload);
    });
  });

  context('prism cache threw an error', () => {
    beforeEach(() => {
      getPayloadByHandle.throws();
    });

    it('should throw 500', async () => {
      await getPrismPayloadByHandle(ctx, next);

      sinon.assert.calledWith(ctx.throw, 500);
    });
  });

  afterEach(() => {
    getPayloadByHandle.reset();
    next.reset();
    ctx.throw.reset();
  });

  after(() => {
    sandbox.restore();
  });
});
