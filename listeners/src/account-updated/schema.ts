export const accountUpdatedMessageSchema = {
  properties: {
    handle: {
      type: 'string'
    },
    firstName: {
      type: 'string'
    },
    lastName: {
      type: 'string'
    },
    primaryEmail: {
      type: 'string'
    },
    updatedAt: {
      type: 'string'
    },
    accountClosed: {
      type: 'boolean'
    }
  },
  required: [
    'handle',
    'firstName',
    'lastName',
    'primaryEmail',
    'updatedAt',
    'accountClosed'
  ]
};
