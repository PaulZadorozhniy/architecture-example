import * as faker from 'faker';

export default function(handle: string = faker.random.uuid()) {
  return {
    handle,
    firstName: faker.random.word(),
    lastName: faker.random.word(),
    username: faker.random.uuid(),
    primaryEmail: faker.internet.email(),
    additionalEmails: [faker.internet.email(), faker.internet.email()],
    accountClosed: faker.random.boolean(),
    updatedAt: '2018-07-25T19:53:11.3165032+00:00',
    termsAcceptedOn: '2018-07-25T19:53:11.3165032+00:00',
    privacyAcceptedOn: '2018-07-25T19:53:11.3165032+00:00'
  };
}
