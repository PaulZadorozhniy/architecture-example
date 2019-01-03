import skillRepository from 'common/db/repositories/skill';
import roleRepository from 'common/db/repositories/role';
import roleSkillRepository from 'common/db/repositories/role-skill';
import { validate } from '../../helpers/validate';
import { createSchema } from './validation-schemas';
import { SkillMessage, SkillResponse } from 'common/entities/skill';
import rabbit from 'common/rabbit';
import { rabbitConfig } from 'config/messaging';
import uuidv4 from 'uuid/v4';
import { RoleSkillModel } from 'common/db/models/role-skill';

export async function handleCreate(ctx: any) {
  const { roleId } = ctx.params;
  const { name, isDraft, isOptional } = ctx.request.body;

  const { errors, errorMessage } = validate(
    { name, isDraft, roleId, isOptional },
    createSchema
  );

  if (errors) {
    return ctx.throw(400, errorMessage, { messages: errors });
  }

  const role = await roleRepository.get(roleId);

  if (!role) {
    return ctx.throw(404, '');
  }

  const skill = await skillRepository.create({
    id: uuidv4(),
    name,
    isDraft,
    isDeleted: false
  });

  // attach the skill to the role:
  await roleSkillRepository.create({ roleId, skillId: skill.id, isOptional });

  const roleSkill: RoleSkillModel | undefined = await roleSkillRepository.get(
    roleId,
    skill.id
  );

  // in case something went wrong and skill is undefined, we don't want to hit an exception
  if (!skill || !roleSkill) {
    return ctx.throw(500);
  }

  if (isDraft === false) {
    rabbit.publishToExchange(
      rabbitConfig.exchanges.skillUpdated,
      new SkillMessage(skill, roleSkill)
    );
  }

  ctx.body = new SkillResponse(skill, roleSkill);
  ctx.status = 201;
}
