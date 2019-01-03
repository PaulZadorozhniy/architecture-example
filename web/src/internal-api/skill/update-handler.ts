import { SkillMessage, SkillResponse } from 'common/entities/skill';
import rabbit from 'common/rabbit';
import { rabbitConfig } from 'config/messaging';
import skillRepository from 'common/db/repositories/skill';
import roleSkillRepository from 'common/db/repositories/role-skill';
import { updateSchema } from './validation-schemas';
import { validate } from '../../helpers/validate';

export default async function handleUpdate(ctx: any) {
  const { roleId: currentRoleId, id } = ctx.params;
  const { name, isOptional, isDraft, roleId: updatedRoleId } = ctx.request.body;
  const { errors, errorMessage } = validate(
    { id, name, isDraft, currentRoleId, updatedRoleId, isOptional },
    updateSchema
  );

  if (errors) {
    return ctx.throw(400, errorMessage, { messages: errors });
  }

  const initialSkill = await skillRepository.get(id);

  if (!initialSkill || initialSkill.isDeleted === true) {
    return ctx.throw(404);
  }

  await skillRepository.update(id, { name, isDraft });

  if (currentRoleId === updatedRoleId) {
    await roleSkillRepository.update(updatedRoleId, id, {
      isOptional
    });
  } else {
    await roleSkillRepository.remove(currentRoleId, id);
    await roleSkillRepository.create({
      roleId: updatedRoleId,
      skillId: id,
      isOptional
    });
  }

  const [updatedSkill] = await skillRepository.getArray([id]);
  const roleSkill = await roleSkillRepository.get(updatedRoleId, id);

  if (!updatedSkill || !roleSkill) {
    return ctx.throw(404);
  }

  const skillUpdatedMessage = new SkillMessage(updatedSkill, roleSkill);

  if (updatedSkill.isDraft === false) {
    rabbit.publishToExchange(
      rabbitConfig.exchanges.skillUpdated,
      skillUpdatedMessage
    );
  }

  ctx.body = new SkillResponse(updatedSkill, roleSkill);

  ctx.status = 200;
}
