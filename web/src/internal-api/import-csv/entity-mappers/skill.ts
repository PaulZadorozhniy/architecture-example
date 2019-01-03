import uuidv4 from 'uuid';
import { IRow } from '../csv-validator';
import { SkillModel } from 'common/db/models/skill';
import * as accountCache from 'web/src/caches/account-cache';
import skillRepository from 'common/db/repositories/skill';

export class SkillEntityMapper {
  public async getOrCreateRecords(
    row: IRow,
    currentUserEmail: string
  ): Promise<SkillModel[]> {
    const skillLeadEmail =
      row.skillCurriculumLeadEmail.length > 0
        ? row.skillCurriculumLeadEmail
        : currentUserEmail;
    const { handle } = await accountCache.getAccountByEmail(skillLeadEmail);

    return Promise.all(
      row.skillNames.map(skillName =>
        this.getOrCreateSkillsFromSkillName(handle, skillName)
      )
    );
  }

  public async getOrCreateSkillsFromSkillName(
    handle: string,
    skillName: string
  ) {
    const skill = await skillRepository.getByName(skillName);

    if (skill) {
      if (skill.curriculumLeadHandle !== handle) {
        await skillRepository.update(skill.id, {
          curriculumLeadHandle: handle
        });

        const updatedSkill = await skillRepository.get(skill.id);

        return updatedSkill as SkillModel;
      }

      return skill as SkillModel;
    }

    const id = uuidv4();

    await skillRepository.create({
      id,
      name: skillName,
      isDraft: true,
      curriculumLeadHandle: handle,
      isDeleted: false
    });

    const createdSkill = await skillRepository.get(id);

    return createdSkill as SkillModel;
  }
}
