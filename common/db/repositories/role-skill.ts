import getRepositoryByModel from '../connection';
import { Repository, DeepPartial } from 'typeorm';
import IRoleSkill from '../../entities/role-skill';
import { RoleSkillModel } from '../models/role-skill';

class RoleSkillRepository {
  protected async getRepository(): Promise<Repository<RoleSkillModel>> {
    return getRepositoryByModel<RoleSkillModel>(RoleSkillModel);
  }

  public async get(
    roleId: string,
    skillId: string
  ): Promise<RoleSkillModel | undefined> {
    const repository = await this.getRepository();

    return repository.findOne({ roleId, skillId });
  }

  public async getAll(roleId: string): Promise<RoleSkillModel[]> {
    const repository = await this.getRepository();

    return repository.find({ roleId });
  }

  public async create(roleSkill: IRoleSkill): Promise<RoleSkillModel> {
    const repository = await this.getRepository();

    const result = await repository.insert({ ...(roleSkill as object) });

    return repository.findOneOrFail(result.identifiers[0].id);
  }

  public async update(
    roleId: string,
    skillId: string,
    roleSkill: DeepPartial<IRoleSkill>
  ): Promise<RoleSkillModel | undefined> {
    const repository = await this.getRepository();

    const recordToUpdate = await repository.findOne({ roleId, skillId });

    if (!recordToUpdate) {
      return undefined;
    }

    await repository.update({ roleId, skillId }, { ...roleSkill });

    return repository.findOneOrFail({ roleId, skillId });
  }

  public async remove(roleId: string, skillId: string): Promise<boolean> {
    const repository = await this.getRepository();
    // EntityODO: remove the next line after this issue is resolved: https://github.com/typeorm/typeorm/issues/2415
    const record = await repository.findOne({ roleId, skillId });

    if (!record) {
      return false;
    }

    await repository.remove(record);
    return true;
  }
}

export default new RoleSkillRepository();
