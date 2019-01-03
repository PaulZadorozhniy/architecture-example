import { validate } from '../../helpers/validate';
import { retireSchema } from './validation-schemas';
import roleSkillRepository from 'common/db/repositories/role-skill';
import logger from 'common/logger';
import skillInteractor from 'common/interactors/skill';

export async function retireSkillHandler(ctx: any) {
  const { roleId, id } = ctx.params;
  const { reason } = ctx.request.body;

  const { errors, errorMessage } = validate(
    { roleId, id, reason },
    retireSchema
  );

  if (errors) {
    return ctx.throw(400, errorMessage, { messages: errors });
  }

  const skill = await skillInteractor.get(id);
  const roleSkill = await roleSkillRepository.get(roleId, id);

  if (!skill || !roleSkill) {
    ctx.status = 404;
    return;
  }

  try {
    await skillInteractor.retire(skill, roleSkill, reason);

    ctx.status = 204;
  } catch (error) {
    logger.error('Error on retiring a skill', error);
    ctx.throw(500);
  }
}
