import webConfig from 'config/web';
import FormData from 'form-data';
import { assert } from 'chai';
import * as Joi from 'joi';
import {
  createValidCsvStream,
  createInvalidCsvStream,
  createJsonStream,
  createInvalidStreamWithDuplicates
} from '../../helpers/csv';
import {
  successResponseSchema,
  unprocessableEntityResponseSchema
} from 'web/src/internal-api/import-csv/schemas';
import { getClient } from 'web/test/helpers/http-client';

const { importCsv } = webConfig.routes;

describe('Import from a CSV file', () => {
  let client;

  before(() => {
    client = getClient();
  });
  context('no file', () => {
    let response;

    beforeEach(async () => {
      const emptyForm = new FormData();

      response = await client.post(importCsv, emptyForm, {
        headers: emptyForm.getHeaders()
      });
    });

    it('returns status 400', () => {
      assert.strictEqual(response.status, 400);
    });
  });

  context('file not in csv format', () => {
    let response;

    beforeEach(async () => {
      const formWithJson = new FormData();

      formWithJson.append('file', createJsonStream());

      response = await client.post(importCsv, formWithJson, {
        headers: {
          ...formWithJson.getHeaders(),
          'Content-Type': 'text/csv'
        }
      });
    });

    it('returns status 400', () => {
      assert.strictEqual(response.status, 400);
    });
  });

  context('invalid data in the file', () => {
    let response;

    beforeEach(async () => {
      const invalidDataForm = new FormData();

      invalidDataForm.append('file', createInvalidCsvStream(), 'data.csv');

      response = await client.post(importCsv, invalidDataForm, {
        headers: invalidDataForm.getHeaders()
      });
    });

    it('returns status 422', () => {
      assert.strictEqual(response.status, 422);
    });

    it('returns validation results and errors in the response body', () => {
      Joi.assert(response.data, unprocessableEntityResponseSchema);
    });
  });

  context('invalid data in the file (duplicate objectives)', () => {
    let response;

    beforeEach(async () => {
      const invalidDataForm = new FormData();

      invalidDataForm.append(
        'file',
        createInvalidStreamWithDuplicates(),
        'data.csv'
      );

      response = await client.post(importCsv, invalidDataForm, {
        headers: invalidDataForm.getHeaders()
      });
    });

    it('returns status 422', () => {
      assert.strictEqual(response.status, 422);
    });

    it('returns validation results and errors in the response body', () => {
      const { error } = Joi.validate(
        response.data,
        unprocessableEntityResponseSchema
      );
      assert.strictEqual(error, null);
    });
  });

  context('valid csv file and data', () => {
    let response;

    beforeEach(async () => {
      const validForm = new FormData();

      validForm.append('file', createValidCsvStream(), 'data.csv');

      response = await client.post(importCsv, validForm, {
        headers: validForm.getHeaders()
      });
    });

    it('returns status 200 and an empty array in the response body', () => {
      assert.strictEqual(response.status, 200);
      Joi.assert(response.data, successResponseSchema);
    });
  });
});
