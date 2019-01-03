import { IRouterContext } from 'koa-router';
import { map, isUndefined } from 'lodash/fp';
import skillRepository from 'common/db/repositories/skill';
import roleSkillRepository from 'common/db/repositories/role-skill';
import roleRepository from 'common/db/repositories/role';
import { RoleSkillModel } from 'common/db/models/role-skill';
import { SkillModel } from 'common/db/models/skill';
import { RoleModel } from 'common/db/models/role';
import { SkillWithChildrenResponse } from 'common/entities/skill';

export async function handleGet(ctx: IRouterContext) {
  const { roleId } = ctx.params;
  const role: RoleModel | undefined = await roleRepository.get(roleId);

  if (isUndefined(role)) {
    return ctx.throw(404);
  }

  const roleSkills: RoleSkillModel[] = await roleSkillRepository.getAll(roleId);

  const skills: SkillModel[] = await skillRepository.getArray(
    map('skillId', roleSkills)
  );

  ctx.body = skills
    .filter(skill => skill.isDeleted === false)
    .map((skill, i) => new SkillWithChildrenResponse(skill, roleSkills[i]));

  ctx.status = 200;
}
