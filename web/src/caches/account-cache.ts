import { fetchAccount } from 'common/api-wrappers/identity';
import accountRepo from 'common/db/repositories/account';

export async function getAccountByEmail(email) {
  const accountFromCache = await accountRepo.getByEmail(email);

  return accountFromCache ? accountFromCache : fetchAndStoreAccount(email);
}

export async function getAccountByHandle(handle) {
  const accountFromCache = await accountRepo.get(handle);

  return accountFromCache ? accountFromCache : fetchAndStoreAccount(handle);
}

// userIdentifier - the handle, username, or email address of the user
async function fetchAndStoreAccount(userIdentifier) {
  const fetchedAccount = await fetchAccount(userIdentifier);

  await accountRepo.create({
    ...fetchedAccount,
    cachedDate: new Date()
  });

  return fetchedAccount;
}
