import { getClient } from 'web/test/helpers/http-client';
import webConfig from 'config/web';
import { assert } from 'chai';
import * as Joi from 'joi';
import { getResponseSchema } from 'web/src/internal-api/account/validation-schemas';

describe('GET', () => {
  let client;

  before(() => {
    client = getClient();
  });

  context('all accounts', () => {
    context('no filters', () => {
      let response;

      beforeEach(async () => {
        response = await client.get(`${webConfig.routes.account}`);
      });

      it('returns an array with account data objects', () => {
        assert.isArray(response.data);

        Joi.assert(response.data, getResponseSchema);
      });

      it('returns status code 200', () => {
        assert.strictEqual(response.status, 200);
      });
    });
  });
});
