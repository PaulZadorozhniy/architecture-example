import * as faker from 'faker';
import IRole from '../../entities/role';
import { RoleModel } from '../../db/models/role';

export default function generateRole(baseRole: string | null = null): IRole {
  return {
    id: faker.random.uuid(),
    name: faker.random.word(),
    baseRole
  };
}

export function generateRoleRecord(): RoleModel {
  return {
    id: faker.random.uuid(),
    name: faker.random.words(),
    baseRole: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: [],
    roleSkill: null
  };
}
