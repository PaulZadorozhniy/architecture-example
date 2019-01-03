import * as sinon from 'sinon';
import * as faker from 'faker';
import { assert } from 'chai';
import accountRepo from 'common/db/repositories/account';
import * as accountCache from '../../../src/caches/account-cache';
import * as identityApiWrapper from 'common/api-wrappers/identity';

function generateFakeAccount() {
  return {
    key: faker.random.uuid()
  };
}

describe('Account cache', () => {
  const createAccountStub = sinon.stub();
  const getAccountStub = sinon.stub();
  const fetchAccountStub = sinon.stub();
  const handle = faker.random.uuid();

  let sandbox;

  before(() => {
    sandbox = sinon.createSandbox();
    sandbox.replace(accountRepo, 'get', getAccountStub);
    sandbox.replace(accountRepo, 'create', createAccountStub);
    sandbox.replace(identityApiWrapper, 'fetchAccount', fetchAccountStub);
  });

  it('should try to get the account from the repo', async () => {
    await accountCache.getAccountByHandle(handle);

    sinon.assert.calledWith(getAccountStub, handle);
  });

  context('account has been found in cache', () => {
    const cachedAccount = generateFakeAccount();

    beforeEach(() => {
      getAccountStub.resolves(cachedAccount);
    });

    it('should return the account', async () => {
      const returnedAccount = await accountCache.getAccountByHandle(handle);

      assert.equal(returnedAccount, cachedAccount);
    });
  });

  context('account has not been found in cache', () => {
    beforeEach(() => {
      getAccountStub.resolves(undefined);
    });

    it('should fetch the account from the identity API', async () => {
      await accountCache.getAccountByHandle(handle);

      sinon.assert.calledWith(fetchAccountStub, handle);
    });

    context('request to the identity API has failed', () => {
      const identityApiError = new Error(faker.random.words());

      beforeEach(() => {
        fetchAccountStub.rejects(identityApiError);
      });

      it('should throw an error', async () => {
        try {
          await accountCache.getAccountByHandle(handle);
          return Promise.reject('Should have thrown an error');
        } catch (error) {
          assert.equal(error, identityApiError);
        }
      });
    });

    context('identity API has responded with the account', () => {
      const fetchedAccount = generateFakeAccount();

      beforeEach(() => {
        fetchAccountStub.resolves(fetchedAccount);
      });

      it('should return the account', async () => {
        const returnedAccount = await accountCache.getAccountByHandle(handle);

        assert.equal(returnedAccount, fetchedAccount);
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
