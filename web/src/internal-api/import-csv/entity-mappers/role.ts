import uuidv4 from 'uuid';
import roleRepository from 'common/db/repositories/role';
import { RoleModel } from 'common/db/models/role';
import { IRow } from '../csv-validator';

export class RoleEntityMapper {
  public async getOrCreateRecords(row: IRow): Promise<RoleModel[]> {
    return Promise.all(row.roleNames.map(this.getOrCreateRolesFromRoleName));
  }

  public async getOrCreateRolesFromRoleName(roleName: string) {
    const role = await roleRepository.getByName(roleName);

    if (role) {
      return role;
    }

    const id = uuidv4();

    await roleRepository.create({
      baseRole: null,
      id,
      name: roleName
    });

    const createdRole = await roleRepository.get(id);

    return createdRole as RoleModel;
  }
}
