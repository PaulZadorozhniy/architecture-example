import { assert } from 'chai';
import * as faker from 'faker';
import handleMessage from '../../src/account-closed/handler';
import getAccountClosedMessage from '../fixture/account-closed';
import repo from 'common/db/repositories/account';
import generateAccount from 'common/test/fixtures/account';

describe('Account Closed listener', () => {
  describe('on valid message', () => {
    const accountInfo = generateAccount();
    const accounClosedMessage = getAccountClosedMessage(accountInfo.handle);

    beforeEach(async () => {
      await repo.create(accountInfo);
    });

    it('should remove the account from the repo', async () => {
      await handleMessage(accounClosedMessage);

      const result = await repo.get(accounClosedMessage.handle);

      assert.isUndefined(result);
    });

    it('should not throw errors if account does not exist', async () => {
      const message = {
        ...accounClosedMessage,
        handle: faker.random.uuid()
      };

      await handleMessage(message);

      const result = await repo.get(message.handle);

      assert.isUndefined(result);
    });
  });
});
