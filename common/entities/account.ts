export default interface IAccount {
  handle: string;
  firstName: string;
  lastName: string;
  accountClosed: boolean;
  email: string;
  cachedDate?: Date;
}
