import skillRepository from 'common/db/repositories/skill';
import roleRepository from 'common/db/repositories/role';
import roleSkillRepository from 'common/db/repositories/role-skill';
import uuidv4 from 'uuid/v4';
import { Skill, SkillWithChildrenResponse } from 'common/entities/skill';

export async function duplicateSkillHandler(ctx: any) {
  const { roleId, skillId } = ctx.params;

  const role = await roleRepository.get(roleId);
  const roleSkill = await roleSkillRepository.get(roleId, skillId);
  const originalSkill = await skillRepository.get(skillId);

  if (
    !role ||
    !originalSkill ||
    originalSkill.isDeleted === true ||
    !roleSkill
  ) {
    return ctx.throw(404);
  }

  const duplicatedSkillId = uuidv4();
  const duplicatedSkill = await skillRepository.create(
    new Skill({
      ...originalSkill,
      id: duplicatedSkillId,
      isDraft: true
    })
  );

  await roleSkillRepository.create({
    roleId,
    skillId: duplicatedSkillId,
    isOptional: roleSkill.isOptional
  });

  const duplicatedRoleSkill = await roleSkillRepository.get(
    roleId,
    duplicatedSkillId
  );

  if (!duplicatedSkill || !duplicatedRoleSkill) {
    return ctx.throw(404);
  }


  ctx.status = 200;
  ctx.body = new SkillWithChildrenResponse(
    { ...duplicatedSkill },
    duplicatedRoleSkill
  );
}
