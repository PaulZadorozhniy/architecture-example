import { SkillModel } from '../models/skill';
import ISkill from '../../entities/skill';
import { isEmpty } from 'lodash';
import BaseRepository, { retireRepository } from './base';
import { ISkillSummary } from 'common/entities/skill-summary';

@retireRepository
class SkillRepository extends BaseRepository<
  ISkill | ISkillSummary,
  SkillModel
> {
  constructor() {
    super(SkillModel);
  }

  public async getByName(name: string): Promise<SkillModel | undefined> {
    const repository = await this.getRepository();

    return repository.findOne({ name });
  }

  public async getArray(ids: string[]): Promise<SkillModel[]> {
    if (isEmpty(ids)) {
      return [];
    }

    const repository = await this.getRepository();

    const result = await repository
      .createQueryBuilder('skill')
      .leftJoinAndSelect(
        'skill.terminalObjectives',
        'terminalObjectives',
        'terminalObjectives.isDeleted = :isDeleted',
        { isDeleted: false }
      )
      .leftJoinAndSelect(
        'terminalObjectives.enablingObjectives',
        'enablingObjectives',
        'enablingObjectives.isDeleted = :isDeleted',
        { isDeleted: false }
      )
      .where(`skill.id IN (:...ids)`, { ids })
      .getMany();

    return result;
  }

  public retire: (id: string, deleteReason?: string) => Promise<SkillModel>;
}

export default new SkillRepository();
