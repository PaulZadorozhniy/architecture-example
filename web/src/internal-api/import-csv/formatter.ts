import toCamelCase from 'camelcase-keys-recursive';
import * as Joi from 'joi';
import { pick } from 'lodash/fp';
import { rowSchema } from './schemas';

const knownFields = Object.keys(Joi.describe(rowSchema).children);

export function formatRows(rows: any[]): any[] {
  return rows.map(toCamelCase).map(pick(knownFields));
}
