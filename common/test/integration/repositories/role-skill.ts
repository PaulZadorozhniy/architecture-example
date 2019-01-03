import { assert } from 'chai';
import * as faker from 'faker';
import { times, omit } from 'lodash';
import repo from 'common/db/repositories/role-skill';
import roleRepo from 'common/db/repositories/role';
import skillRepo from 'common/db/repositories/skill';
import generateSkill from '../../fixtures/skill';
import generateRole from '../../fixtures/role';
import { getConnection } from 'typeorm';
import IRole from 'common/entities/role';
import IRoleSkill from '../../../entities/role-skill';
import generateRoleSkill from '../../fixtures/role-skill';
import sls from 'single-line-string';
import { RoleSkillModel } from '../../../db/models/role-skill';

describe('RoleSkill repository', () => {
  describe('#create', () => {
    let skill: any;
    let role: IRole;
    let roleSkill: IRoleSkill;

    before(async () => {
      role = generateRole();
      skill = { ...generateSkill(), id: faker.random.uuid() };
      roleSkill = generateRoleSkill({
        roleId: role.id,
        skillId: skill.id
      });

      await Promise.all([roleRepo.create(role), skillRepo.create(skill)]);
    });

    it('should add a new record in DB', async () => {
      const record = await repo.create(roleSkill);

      assert.ok(record);

      const foundRecords = await getConnection().query(
        sls`SELECT is_optional AS "isOptional", role_id AS "roleId", 
        skill_id AS "skillId"
        FROM role_skill 
        WHERE skill_id='${roleSkill.skillId}' AND role_id='${roleSkill.roleId}'`
      );

      assert.isNotEmpty(foundRecords);

      assert.deepEqual(roleSkill, foundRecords[0]);
    });

    after(async () => {
      await repo.remove(role.id, skill.id);
      await roleRepo.remove(role.id);
      await skillRepo.remove(skill.id);
    });
  });

  describe('#update', () => {
    let roleId: string;
    let skillId: string;
    let roleSkill: IRoleSkill;
    let updatedData: any;
    let record: RoleSkillModel | undefined;

    before(async () => {
      const role = await roleRepo.create(generateRole());
      const skill = await skillRepo.create(generateSkill());

      roleId = role.id;
      skillId = skill.id;
      roleSkill = generateRoleSkill({ roleId, skillId });
    });

    context('entity exists in the DB', () => {
      before(async () => {
        await repo.create(roleSkill);
        updatedData = { isOptional: !roleSkill.isOptional };
        record = await repo.update(roleId, skillId, updatedData);
      });

      it('should update the record in the DB', async () => {
        assert.deepEqual(
          omit(record, ['updatedAt', 'createdAt', 'roleId', 'skillId']),
          updatedData
        );
      });

      after(async () => {
        await repo.remove(roleId, skillId);
        await roleRepo.remove(roleId);
        await skillRepo.remove(skillId);
      });
    });

    context('entity does not exist in the DB', () => {
      beforeEach(async () => {
        record = await repo.update(roleId, skillId, updatedData);
      });

      it('should return false', () => {
        assert.isUndefined(record);
      });
    });
  });

  describe('#remove', () => {
    let skill: any;
    let role: IRole;
    let roleSkill: IRoleSkill;

    before(async () => {
      role = generateRole();
      skill = { ...generateSkill(), id: faker.random.uuid() };
      roleSkill = generateRoleSkill({
        roleId: role.id,
        skillId: skill.id
      });

      await roleRepo.create(role);
      await skillRepo.create(skill);
      await repo.create(roleSkill);
    });

    it('should remove skill record by id', async () => {
      const hasDeleted = await repo.remove(role.id, skill.id);
      assert(hasDeleted);
    });

    it('should remove nothing with not existing handle', async () => {
      const hasDeleted = await repo.remove(
        faker.random.uuid(),
        faker.random.uuid()
      );

      assert.isNotOk(hasDeleted);
    });

    after(async () => {
      await roleRepo.remove(role.id);
      await skillRepo.remove(skill.id);
    });
  });

  describe('#getAll', () => {
    let role: IRole;
    let skills: any[];
    let roleSkills: IRoleSkill[];

    before(async () => {
      role = generateRole();
      skills = times(5, () => ({
        ...generateSkill(),
        id: faker.random.uuid()
      }));
      roleSkills = skills.map(skill =>
        generateRoleSkill({
          roleId: role.id,
          skillId: skill.id
        })
      );
      await roleRepo.create(role);
      await Promise.all(skills.map(skill => skillRepo.create(skill)));
      await Promise.all(roleSkills.map(roleSkill => repo.create(roleSkill)));
    });

    it('should return all roleSkill records by roleId', async () => {
      const roleSkillRecords = await repo.getAll(role.id);

      roleSkills.forEach(roleSkill => {
        assert.strictEqual(roleSkill.roleId, role.id);
        assert.ok(
          roleSkillRecords.find(
            roleSkillRecord => roleSkillRecord.skillId === roleSkill.skillId
          )
        );
      });
    });

    after(async () => {
      await Promise.all(
        roleSkills.map(roleSkill =>
          repo.remove(roleSkill.roleId, roleSkill.skillId)
        )
      );
      await Promise.all(skills.map(skill => skillRepo.remove(skill.id)));
      await roleRepo.remove(role.id);
    });
  });
});
