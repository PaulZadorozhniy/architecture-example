import * as faker from 'faker';

export default function(handle) {
  return {
    handle: handle || faker.random.uuid(),
    messagePublishedAt: new Date(),
    suppressAccountClosedEmail: faker.random.boolean()
  };
}
