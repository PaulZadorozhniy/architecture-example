import { SkillMessage } from 'common/entities/skill';
import { SkillModel } from 'common/db/models/skill';
import { RoleSkillModel } from 'common/db/models/role-skill';
import skillRepository from 'common/db/repositories/skill';
import rabbit from 'common/rabbit';
import { rabbitConfig } from 'config/messaging';

async function retire(
  skill: SkillModel,
  roleSkill: RoleSkillModel,
  reason?: string
): Promise<void> {
  if (roleSkill.skillId !== skill.id) {
    throw new Error();
  }

  const retiredEntity: SkillModel = await skillRepository.retire(
    skill.id,
    reason
  );

  if (skill.isDraft === false) {
    rabbit.publishToExchange(
      rabbitConfig.exchanges.skillUpdated,
      new SkillMessage(retiredEntity, roleSkill)
    );
  }
}

async function get(id: string): Promise<SkillModel | undefined> {
  const skill = await skillRepository.get(id);

  if (skill !== undefined && skill.isDeleted === false) {
    return skill;
  }
}

export default { retire, get };
