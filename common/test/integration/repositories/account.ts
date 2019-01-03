import { assert } from 'chai';
import * as faker from 'faker';
import repo from 'common/db/repositories/account';
import generateAccount from '../../fixtures/account';
import IAccount from 'common/entities/account';
import { getConnection } from 'typeorm';
import sls from 'single-line-string';
import { AccountModel } from 'common/db/models/account';

describe('Account repository', () => {
  describe('#create', () => {
    let account: IAccount;

    beforeEach(() => {
      account = generateAccount();
    });

    it('should add a new record in DB when record does not exist', async () => {
      const record = await repo.create(account);

      assert.ok(record);

      const foundRecords = await getConnection().query(
        sls`SELECT handle, "firstName", "lastName", "accountClosed", email, "cachedDate",
        created_at AS "createdAt", updated_at AS "updatedAt" 
        FROM account 
        WHERE handle='${account.handle}'`
      );

      assert.isNotEmpty(foundRecords);

      assert.deepEqual(record, foundRecords[0]);
    });

    it('should throw exception if record with same handle exists', async () => {
      try {
        await repo.create(account);
        await repo.create(account);
        return Promise.reject('Should throw an error');
      } catch (error) {
        assert.ok(error);
      }
    });
  });

  describe('#update', () => {
    let account: IAccount;

    beforeEach(async () => {
      account = generateAccount();

      await repo.create(account);
    });

    it('should update an existing record with new values', async () => {
      const updatedAccount = generateAccount(account.handle);
      const updateResult = await repo.update(account.handle, updatedAccount);

      assert.ok(updateResult);
    });

    it('should not update a non-existing record', async () => {
      const nonExistingAccount = generateAccount();
      const updateResult = await repo.update(
        nonExistingAccount.handle,
        nonExistingAccount
      );

      assert.isNotOk(updateResult);
    });
  });

  describe('#get', () => {
    let account: any;
    let record: AccountModel;

    beforeEach(async () => {
      account = generateAccount();
      record = await repo.create(account);
    });

    it('should return Account record by valid handle', async () => {
      const accountRecord = await repo.get(account.handle);

      assert.deepEqual(accountRecord, record);
    });

    it('should return undefined when handle does not exist in DB', async () => {
      const accountRecord = await repo.get(faker.random.uuid());

      assert.isUndefined(accountRecord);
    });
  });

  describe('#getByEmail', () => {
    let account: any;
    let record: AccountModel;

    beforeEach(async () => {
      account = generateAccount();
      record = await repo.create(account);
    });

    it('should return Account record by valid email', async () => {
      const accountRecord = await repo.getByEmail(account.email);

      assert.deepEqual(accountRecord, record);
    });

    it('should return undefined when acc with this email does not exist in DB', async () => {
      const accountRecord = await repo.getByEmail(faker.random.uuid());

      assert.isUndefined(accountRecord);
    });
  });

  describe('#remove', () => {
    let account: IAccount;

    beforeEach(async () => {
      account = generateAccount();
      await repo.create(account);
    });

    it('should remove Account record by handle', async () => {
      const hasDeleted = await repo.remove(account.handle);
      assert(hasDeleted);
    });

    it('should remove nothing with not existing handle', async () => {
      const hasDeleted = await repo.remove(faker.random.uuid());

      assert.isNotOk(hasDeleted);
    });
  });
});
