import { RoleModel } from '../models/role';
import IRole from '../../entities/role';
import BaseRepository from './base';

class RoleRepository extends BaseRepository<IRole, RoleModel> {
  constructor() {
    super(RoleModel);
  }

  public async getByName(name: string): Promise<RoleModel | undefined> {
    const repository = await this.getRepository();

    return repository.findOne({ name });
  }
}

export default new RoleRepository();
