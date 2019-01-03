import roleRepository from 'common/db/repositories/role';

export default async function getRoleHandler(ctx: any) {
  const { id } = ctx.params;

  const role = await roleRepository.get(id);

  if (!role) {
    return ctx.throw(404);
  }

  ctx.body = role;

  ctx.status = 200;
}
