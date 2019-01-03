import { mapValues } from 'lodash';

function preventUndefined(value, key) {
  if (typeof value !== 'undefined') {
    return value;
  }

  throw new Error(`${key} is undefined`);
}

export default function toSafeObject(obj: object) {
  // TODO: what about nested objects? this needs to be recursive
  return mapValues(obj, preventUndefined);
}
