import { validate } from '../../helpers/validate';
import { createSchema } from './validation-schemas';
import roleRepository from 'common/db/repositories/role';
import rabbit from 'common/rabbit';
import { rabbitConfig } from 'config/messaging';
import IRole from 'common/entities/role';
import uuidv4 from 'uuid/v4';

export async function createRoleHandler(ctx: any) {
  const { name, baseRole } = ctx.request.body;
  const { errors, errorMessage } = validate({ name, baseRole }, createSchema);

  if (errors) {
    return ctx.throw(400, errorMessage, { messages: errors });
  }

  if (baseRole) {
    const baseRoleRecord = await roleRepository.get(baseRole);

    if (!baseRoleRecord) {
      return ctx.throw(400, 'Base Role not found');
    }
  }

  const role = await roleRepository.create({ id: uuidv4(), name, baseRole });

  if (!role) {
    return ctx.throw(500, 'Role has not been created');
  }

  const message: IRole = {
    id: role.id,
    name,
    baseRole: baseRole || null
  };

  rabbit.publishToExchange(rabbitConfig.exchanges.roleUpdated, message);

  ctx.status = 201;
  ctx.body = { id: role.id };
}
