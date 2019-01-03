import { sortBy } from 'lodash';
import { IValidationError } from './csv-validator';

export class WrongMimetypeError extends Error {
  constructor() {
    super();
    this.message = 'Wrong file mimetype';
  }
}

export class NoFileError extends Error {
  constructor() {
    super();
    this.message = 'No file';
  }
}

export class InvalidCsvDataError extends Error {
  public messages: IValidationError[] = [];

  constructor(errorMessages: IValidationError[]) {
    super();
    this.messages = sortBy(errorMessages, ['rowIndex']);
  }
}

export class WrongHeadersError extends Error {
  constructor() {
    super();
    this.message = 'Wrong request headers';
  }
}

export class InsertDataError extends Error {}
