import sinon from 'sinon';
import { assert } from 'chai';
import * as faker from 'faker';
import config from 'config/common';
import repo from 'common/db/repositories/account';
import { EmptyMessageError, InvalidMessageError } from 'listeners/src/errors';
import * as identityAPI from 'common/api-wrappers/identity';
import getAccountUpdatedMessage from '../fixture/account-updated';
import handleMessage from '../../src/account-updated/handler';

describe('Account Updated listener', () => {
  let validMessage;
  let sandbox;
  let fetchUserClaimsStub;

  before(() => {
    sandbox = sinon.createSandbox();
    fetchUserClaimsStub = sandbox.stub(identityAPI, 'fetchUserClaims');
  });

  beforeEach(() => {
    validMessage = getAccountUpdatedMessage();
  });

  describe('on valid message', () => {
    context('user with relevant claims', () => {
      beforeEach(() => {
        fetchUserClaimsStub.resolves(config.allowedClaims);
      });

      it('should save the account to the repo', async () => {
        await handleMessage(validMessage);

        const result = await repo.get(validMessage.handle);

        assert.ok(result);
        assert.equal(result!.firstName, validMessage.firstName);
        assert.equal(result!.lastName, validMessage.lastName);
        assert.equal(result!.email, validMessage.primaryEmail);
        assert.equal(result!.accountClosed, validMessage.accountClosed);
      });
    });

    context('user without relevant claims', () => {
      beforeEach(() => {
        fetchUserClaimsStub.resolves([]);
      });

      it('should not save the account to the repo', async () => {
        await handleMessage(validMessage);

        const result = await repo.get(validMessage.handle);

        assert.isUndefined(result);
      });
    });
  });

  describe('on invalid message', () => {
    it('should throw an error when a message is an empty string', async () => {
      try {
        await handleMessage('');

        return Promise.reject(new Error('Handler did not throw an error'));
      } catch (error) {
        assert.instanceOf(error, EmptyMessageError);
      }
    });

    it('should throw an error when required fields are missing in the message', () =>
      Promise.all(
        [
          'handle',
          'firstName',
          'lastName',
          'primaryEmail',
          'accountClosed'
        ].map(async key => {
          const invalidMessage = {
            ...validMessage,
            handle: faker.random.uuid()
          };

          delete invalidMessage[key];

          try {
            await handleMessage(invalidMessage);

            return Promise.reject(
              new Error(`Handler should throw an error on key ${key}`)
            );
          } catch (error) {
            assert.instanceOf(error, InvalidMessageError);
          }
        })
      ));
  });

  afterEach(() => sandbox.reset());
  after(() => sandbox.restore());
});
