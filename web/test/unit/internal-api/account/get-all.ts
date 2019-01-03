import * as Joi from 'joi';
import { getAllHandler } from 'web/src/internal-api/account/get-all-handler';
import { assert } from 'chai';
import { getResponseSchema } from 'web/src/internal-api/account/validation-schemas';
import accountRepository from 'common/db/repositories/account';
import sinon from 'sinon';
import { generateAccountRecord } from 'common/test/fixtures/account';

describe('GET all', () => {
  let sandbox;
  let getAllAccountsStub;

  before(() => {
    sandbox = sinon.createSandbox();
    getAllAccountsStub = sandbox.stub();

    sandbox.replace(accountRepository, 'getAll', getAllAccountsStub);
  });

  context('no filters', () => {
    const email = 'paulzadorozhniy@gmail.com';
    let ctx: any;

    beforeEach(async () => {
      getAllAccountsStub.resolves([generateAccountRecord(undefined, email)]);

      ctx = {};
      await getAllHandler(ctx);
    });

    it('returns an array with account data objects', () => {
      assert.isArray(ctx.body);

      Joi.assert(ctx.body, getResponseSchema);
    });

    it('returns status code 200', () => {
      assert.strictEqual(ctx.status, 200);
    });
  });

  afterEach(() => sandbox.reset());
  after(() => sandbox.restore());
});
