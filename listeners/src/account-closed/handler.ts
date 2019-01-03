import accountRepo from 'common/db/repositories/account';

export default async function (message) {
  await accountRepo.remove(message.handle);
};
