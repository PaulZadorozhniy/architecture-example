export class EmptyMessageError extends Error {
  constructor() {
    super('Empty message received');
  }
}

export class InvalidMessageError extends Error {
  constructor() {
    super('Invalid message received');
  }
}
