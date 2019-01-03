import repository from 'common/db/repositories/role';
import { omit } from 'lodash/fp';

export async function getRoleHandler(ctx: any) {
  const allRoles = await repository.getAll();

  ctx.body = allRoles.map(omit(['createdAt', 'updatedAt']));
  ctx.status = 200;
}
