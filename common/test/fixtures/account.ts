import * as faker from 'faker';
import IAccount from 'common/entities/account';
import { AccountModel } from '../../db/models/account';

export default function generateAccount(
  handle: string = faker.random.uuid()
): IAccount {
  return {
    handle,
    firstName: faker.random.word(),
    lastName: faker.random.word(),
    accountClosed: faker.random.boolean(),
    email: faker.internet.email(),
    cachedDate: new Date()
  };
}
export function generateAccountRecord(
  handle: string = faker.random.uuid(),
  email: string = faker.internet.email()
): AccountModel {
  return {
    handle,
    firstName: faker.random.word(),
    lastName: faker.random.word(),
    accountClosed: faker.random.boolean(),
    email,
    cachedDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
}
