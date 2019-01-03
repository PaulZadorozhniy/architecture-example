import { set } from 'lodash';
import MockReq from 'mock-req';
import * as Joi from 'joi';
import sinon from 'sinon';
import { assert } from 'chai';
import importCsvHandler from 'web/src/internal-api/import-csv/import-csv-handler';
import {
  createValidCsvStream,
  createInvalidCsvStream
} from '../../../helpers/csv';
import * as faker from 'faker';
import * as parser from 'web/src/internal-api/import-csv/parse-csv';
import { InsertData } from 'web/src/internal-api/import-csv/insert-data';
import validator from 'web/src/internal-api/import-csv/csv-validator';
import json from '../../../fixtures/import-example-1.json';
import formattedRows from '../../../fixtures/validated-rows.json';
import {
  WrongMimetypeError,
  WrongHeadersError,
  InvalidCsvDataError
} from 'web/src/internal-api/import-csv/errors';
import {
  unprocessableEntityResponseSchema,
  successResponseSchema
} from 'web/src/internal-api/import-csv/schemas';
import * as formatter from 'web/src/internal-api/import-csv/formatter';
import logger from 'common/logger';

describe('Import CSV Handler', () => {
  const email = faker.internet.email();
  const baseCtx: any = { email };

  let sandbox;
  let parseCsvStub;
  let formatRowsStub;
  let validateStub;
  let getFileStreamStub;
  let importRowsIntoDbStub;

  before(() => {
    sandbox = sinon.createSandbox();

    getFileStreamStub = sandbox.stub();
    parseCsvStub = sandbox.stub();
    formatRowsStub = sandbox.stub();
    validateStub = sandbox.stub();
    importRowsIntoDbStub = sandbox.stub();

    sandbox.replace(parser, 'getFileStream', getFileStreamStub);
    sandbox.replace(parser, 'parseCsv', parseCsvStub);
    sandbox.replace(formatter, 'formatRows', formatRowsStub);
    sandbox.replace(validator, 'validate', validateStub);
    sandbox.replace(
      InsertData.prototype,
      'importRowsIntoDb',
      importRowsIntoDbStub
    );
    sandbox.stub(logger, 'info');
    sandbox.stub(logger, 'error');
  });

  context('invalid headers', () => {
    beforeEach(() => {
      getFileStreamStub.rejects(new WrongHeadersError());
    });

    it('throws 400', async () => {
      const ctx = { ...baseCtx };
      const req = new MockReq({
        method: 'POST',
        headers: {}
      });

      set(ctx, 'request.req', req);

      await importCsvHandler(ctx);

      assert.strictEqual(ctx.status, 400);
      assert.isNotEmpty(ctx.body);
    });
  });

  context('no file in request', () => {
    beforeEach(() => {
      getFileStreamStub.resolves(null);
    });

    it('throws 400', async () => {
      const ctx = { ...baseCtx };
      const req = new MockReq({
        method: 'POST',
        headers: {
          accept: 'application/json, text/plain, */*'
        }
      });

      set(ctx, 'request.req', req);

      await importCsvHandler(ctx);

      assert.strictEqual(ctx.status, 400);
      assert.isNotEmpty(ctx.body);
    });
  });

  context('invalid csv file', () => {
    beforeEach(() => {
      getFileStreamStub.rejects(new WrongMimetypeError());
    });

    it('throws 400', async () => {
      const ctx = { ...baseCtx };
      const req = new MockReq({
        method: 'POST',
        headers: {
          accept: 'application/json, text/plain, */*'
        }
      });

      set(ctx, 'request.req', req);

      await importCsvHandler(ctx);

      assert.strictEqual(ctx.status, 400);
      assert.isNotEmpty(ctx.body);
    });
  });

  context('invalid data in the file', () => {
    beforeEach(() => {
      parseCsvStub.resolves(json);
      getFileStreamStub.resolves(createInvalidCsvStream());
      formatRowsStub.returns(formattedRows);

      validateStub.throws(
        new InvalidCsvDataError([{ rowIndex: 99, message: 'validation error' }])
      );
    });

    it('throws 422', async () => {
      const ctx = { ...baseCtx };
      const req = new MockReq({
        method: 'POST',
        headers: {
          accept: 'text/csv, text/plain, */*',
          'content-type': 'text/csv'
        }
      });

      set(ctx, 'request.req', req);

      await importCsvHandler(ctx);

      assert.strictEqual(ctx.status, 422);
      Joi.assert(ctx.body, unprocessableEntityResponseSchema);
    });
  });

  context('valid csv file and data', () => {
    const ctx = { ...baseCtx };

    beforeEach(() => {
      parseCsvStub.resolves(json);
      getFileStreamStub.resolves(createValidCsvStream());
      formatRowsStub.returns(formattedRows);
      validateStub.returns(undefined);
      importRowsIntoDbStub.resolves();

      set(ctx, 'request.files.file', createValidCsvStream());

      return importCsvHandler(ctx);
    });

    it('inserts data into the DB', () => {
      sinon.assert.calledWithExactly(
        importRowsIntoDbStub,
        formattedRows,
        email
      );
    });

    it('returns status 200', () => {
      assert.strictEqual(ctx.status, 200);
    });

    it('sets a proper response body', () => {
      Joi.assert(ctx.body, successResponseSchema);
    });
  });

  context('on unexpected error', () => {
    const unexpectedError = new Error('unexpected');

    beforeEach(() => {
      parseCsvStub.resolves(json);
      getFileStreamStub.resolves(createValidCsvStream());
      validateStub.throws(unexpectedError);
    });

    it('throws the error', async () => {
      const ctx = { ...baseCtx };

      set(ctx, 'request.files.file', createValidCsvStream());

      try {
        await importCsvHandler(ctx);
      } catch (error) {
        assert.strictEqual(error, unexpectedError);
      }
    });
  });

  afterEach(() => sandbox.reset());
  after(() => sandbox.restore());
});
