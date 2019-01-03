import skillInteractor from 'common/interactors/skill';
import roleRepository from 'common/db/repositories/role';
import roleSkillRepository from 'common/db/repositories/role-skill';
import { SkillResponse } from 'common/entities/skill';

export async function handleGetBySkillId(ctx: any) {
  const { roleId, id } = ctx.params;

  const skill = await skillInteractor.get(id);
  const role = await roleRepository.get(roleId);
  const roleSkill = await roleSkillRepository.get(roleId, id);

  if (!skill || !role || !roleSkill) {
    return ctx.throw(404);
  }

  ctx.body = new SkillResponse(skill, roleSkill);

  ctx.status = 200;
}
