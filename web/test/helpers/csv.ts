import fs from 'fs';
import path from 'path';

export function createValidCsvStream() {
  return fs.createReadStream(
    path.join(__dirname, '../fixtures/import-example-1.csv')
  );
}

export function createInvalidCsvStream() {
  return fs.createReadStream(
    path.join(__dirname, '../fixtures/import-example-2.csv')
  );
}

export function createInvalidStreamWithDuplicates() {
  return fs.createReadStream(
    path.join(__dirname, '../fixtures/import-duplicates.csv')
  );
}

export function createJsonStream() {
  return fs.createReadStream(
    path.join(__dirname, '../fixtures/import-example-1.json')
  );
}
