import { AccountModel } from '../models/account';
import IAccount from 'common/entities/account';
import BaseRepository from './base';

class AccountRepository extends BaseRepository<IAccount, AccountModel> {
  public async getByEmail(email: string): Promise<AccountModel | undefined> {
    const repository = await this.getRepository();

    return repository.findOne({ email });
  }
}

export default new AccountRepository(AccountModel);
