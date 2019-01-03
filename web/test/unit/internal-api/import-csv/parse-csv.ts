import { assert } from 'chai';
import fs from 'fs';
import path from 'path';
import * as Joi from 'joi';
import { parseCsv } from 'web/src/internal-api/import-csv/parse-csv';
import json from '../../../fixtures/import-example-1-parsed.json';

describe('parseCsv', () => {
  it('parses csv from a stream', async () => {
    const readStream = fs.createReadStream(
      path.join(__dirname, '../../../fixtures/import-example-1.csv')
    );
    const parseResult = await parseCsv(readStream);

    assert.isArray(parseResult);
    assert.deepEqual(parseResult, json);
  });

  it('parses csv with multiple roles', async () => {
    const readStream = fs.createReadStream(
      path.join(
        __dirname,
        '../../../fixtures/import-csv-example-multiple-roles.csv'
      )
    );

    const parseResult = await parseCsv(readStream);

    assert.isArray(parseResult);

    Joi.assert(
      parseResult,
      Joi.array().items(
        Joi.object({
          role_names: Joi.array().items(Joi.string().required())
        }).unknown()
      )
    );
  });

  it('parses csv with multiple skills', async () => {
    const readStream = fs.createReadStream(
      path.join(
        __dirname,
        '../../../fixtures/import-csv-example-multiple-skills.csv'
      )
    );

    const parseResult = await parseCsv(readStream);

    assert.isArray(parseResult);

    Joi.assert(
      parseResult,
      Joi.array().items(
        Joi.object({
          skill_names: Joi.array().items(Joi.string().required())
        }).unknown()
      )
    );
  });
});
