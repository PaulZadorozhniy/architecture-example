import crypto from 'crypto';
import accountRepository from 'common/db/repositories/account';

const gravatarBaseUrl = 'https://secure.gravatar.com/avatar/';
const gravatarQueryStr =
  'd=https%3A%2F%2Fs.alalalalal.com%2Fsc%2Fimg%2Faccount%2Favatar-v2.png';

function buildGravatarUrl(email: string): string {
  const hash = crypto.createHash('md5');

  hash.update(email.trim().toLowerCase());
  const hashedEmail = hash.digest('hex');

  return gravatarBaseUrl.concat(hashedEmail, gravatarQueryStr);
}

export async function getAllHandler(ctx: any) {
  const accounts = await accountRepository.getAll();

  ctx.body = accounts.map(acc => {
    const { email, handle, firstName, lastName } = acc;
    const gravatarUrl = buildGravatarUrl(email);

    return {
      gravatarUrl,
      handle,
      firstName,
      lastName
    };
  });

  ctx.status = 200;
}
