import Ajv from 'ajv';
import { pick, intersection, isEmpty } from 'lodash';
import accountRepo from 'common/db/repositories/account';
import config from 'config/common';
import * as identityAPI from 'common/api-wrappers/identity';
import IAccount from 'common/entities/account';
import { EmptyMessageError, InvalidMessageError } from '../errors';
import { accountUpdatedMessageSchema } from './schema';
import logger from 'common/logger';

export default async function(message) {
  validateMessage(message);

  const { handle } = message;
  let accountClaims;

  try {
    accountClaims = await identityAPI.fetchUserClaims(handle);
  } catch (error) {
    return logger.warn(
      `account-updated listener: fetchUserClaims request for the ${handle} handle failed with the following error: `,
      error
    );
  }

  if (!intersection(config.allowedClaims, accountClaims).length) {
    // not a curriculum user, no need to cache this account
    return;
  }

  const accountRecord = await accountRepo.get(handle);
  const account = getAccountInfoFromMessage(message);

  if (!accountRecord) {
    await accountRepo.create(account);
  } else if (accountRecord.cachedDate < message.updatedAt) {
    await accountRepo.update(handle, account);
  }
}

function validateMessage(message) {
  if (message === '') {
    throw new EmptyMessageError();
  }
  const ajv = new Ajv();

  ajv.validate(accountUpdatedMessageSchema, message);

  if (!isEmpty(ajv.errors)) {
    throw new InvalidMessageError();
  }
}

function getAccountInfoFromMessage(message: any): IAccount {
  const account = {
    ...message,
    email: message.primaryEmail,
    cachedDate: message.updatedAt
  };

  return pick(account, [
    'handle',
    'firstName',
    'lastName',
    'email',
    'accountClosed',
    'cachedDate'
  ]);
}
