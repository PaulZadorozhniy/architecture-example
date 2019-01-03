import { assert } from 'chai';
import * as faker from 'faker';
import { times, omit } from 'lodash';
import repo from 'common/db/repositories/role';
import generateRole from '../../fixtures/role';
import IRole from 'common/entities/role';
import { getConnection } from 'typeorm';
import sls from 'single-line-string';

describe('Role repository', () => {
  describe('#create', () => {
    let role: IRole;

    beforeEach(() => {
      role = generateRole();
    });

    it('should add a new record in DB and return the id', async () => {
      const createdRole = await repo.create(role);

      assert.exists(createdRole);

      const foundRecords = await getConnection().query(
        sls`SELECT id, name, base_role AS "baseRole", created_at AS "createdAt",
        updated_at AS "updatedAt"
        FROM role 
        WHERE id='${role.id}'`
      );

      assert.isNotEmpty(foundRecords);

      assert.deepEqual(role, omit(foundRecords[0], ['updatedAt', 'createdAt']));
    });

    afterEach(async () => {
      await repo.remove(role.id);
    });
  });

  describe('#remove', () => {
    let role: IRole;

    before(async () => {
      role = generateRole();
      await repo.create(role);
    });

    it('should remove role record by id', async () => {
      const hasDeleted = await repo.remove(role.id);
      assert(hasDeleted);
    });

    it('should remove nothing with not existing handle', async () => {
      const hasDeleted = await repo.remove(faker.random.uuid());

      assert.isNotOk(hasDeleted);
    });
  });

  describe('#getAll', () => {
    let role: IRole;
    let secondRole: IRole;
    let thirdRole: IRole;

    beforeEach(async () => {
      role = generateRole(null);
      secondRole = generateRole(null);
      thirdRole = generateRole(null);
      await repo.create(role);
      await repo.create(secondRole);
      await repo.create(thirdRole);
    });

    it('should return an array of role records', async () => {
      const connection = await getConnection();
      const roleRecords = await repo.getAll();

      const queryResult = await connection.query(
        'SELECT id, name, base_role AS "baseRole", created_at AS "createdAt", updated_at AS "updatedAt" FROM role'
      );

      assert.deepEqual(roleRecords, queryResult);
    });

    afterEach(async () => {
      await repo.removeArray([role.id, secondRole.id, thirdRole.id]);
    });
  });

  describe('#removeArray', () => {
    let roles: IRole[];

    beforeEach(async () => {
      roles = times(5, () => generateRole());

      return Promise.all(roles.map(role => repo.create(role)));
    });

    it('should remove array of roles record by ids', async () => {
      const roleIds = roles.map(role => role.id);
      const results: boolean[] = await repo.removeArray(roleIds);
      results.forEach(result => assert.isTrue(result));
    });

    context('the input array contains invalid ids', () => {
      let results: boolean[];

      beforeEach(async () => {
        const roleIds = roles.map(role => role.id);
        roleIds.unshift(faker.random.uuid());
        results = await repo.removeArray(roleIds);
      });

      it('should remove all records by valid ids', () => {
        results.slice(1).forEach(result => assert.isTrue(result));
      });

      it('should return an array of results with false for non-existing records', () => {
        assert.isFalse(results[0]);
      });
    });
  });

  describe('#get', () => {
    let role: IRole;

    beforeEach(async () => {
      role = generateRole(null);
      await repo.create(role);
    });

    it('should return the role', async () => {
      const connection = await getConnection();
      const roleRecord = await repo.get(role.id);

      const queryResult = await connection.query(
        sls`SELECT id, name, 
        base_role AS "baseRole", 
        created_at AS "createdAt", 
        updated_at AS "updatedAt" 
        FROM role
        WHERE id='${role.id}'`
      );

      assert.deepEqual(roleRecord, queryResult[0]);
    });

    afterEach(async () => {
      await repo.remove(role.id);
    });
  });
});
