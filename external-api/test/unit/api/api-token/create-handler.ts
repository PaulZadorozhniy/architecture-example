import * as faker from 'faker';
import { assert } from 'chai';
import sinon from 'sinon';
import { pick } from 'lodash';
import apiTokenRepo from 'common/db/repositories/api-token';
import IApiToken from 'common/entities/api-token';
import { generateApiTokenRecord } from 'common/test/fixtures/api-token';
import createApiToken from 'external-api/src/self-healing/api-token/create-handler';

describe('CREATE', () => {
  context('request contains a client name', () => {
    const client = faker.random.word();
    const ctx = {
      response: { body: {} },
      request: { body: { client } }
    };

    let createApiTokenStub: sinon.SinonStub;
    let updateApiTokenStub: sinon.SinonStub;
    let getApiTokenStub: sinon.SinonStub;
    let sandbox: sinon.SinonSandbox;

    before(() => {
      sandbox = sinon.createSandbox();
      createApiTokenStub = sandbox.stub();
      updateApiTokenStub = sandbox.stub();
      getApiTokenStub = sandbox.stub();
      sandbox.replace(apiTokenRepo, 'create', createApiTokenStub);
      sandbox.replace(apiTokenRepo, 'get', getApiTokenStub);
      sandbox.replace(apiTokenRepo, 'update', updateApiTokenStub);
    });

    it('looks up the token by  client', async () => {
      await createApiToken(ctx);
      sinon.assert.calledWith(getApiTokenStub, { client });
    });

    context('token for the client does not exist', () => {
      let tokenRecord;

      beforeEach(async () => {
        // this object will not have matching id and token, but will work for out purposes
        tokenRecord = generateApiTokenRecord(client);
        getApiTokenStub.onCall(0).resolves(undefined);
        getApiTokenStub.onCall(1).resolves(tokenRecord);

        await createApiToken(ctx);
      });

      it('creates a db record and returns it', () => {
        const { args } = createApiTokenStub.getCall(0);
        const apiTokenData: IApiToken = args[0];

        assert.strictEqual(apiTokenData.client, client);

        assert.deepStrictEqual(
          ctx.response.body,
          pick(tokenRecord, ['client', 'token', 'createdDate', 'updatedDate'])
        );
      });
    });

    context('token for the client exists', () => {
      let tokenRecord;

      beforeEach(async () => {
        // this object will not have matching id and token, but will work for out purposes
        tokenRecord = generateApiTokenRecord(client);
        getApiTokenStub.resolves(tokenRecord);
        updateApiTokenStub.resolves(tokenRecord);

        await createApiToken(ctx);
      });

      it('updates the existing record and returns it', () => {
        const { args } = updateApiTokenStub.getCall(0);
        const [clientFromArgs, updateData] = args;

        assert.strictEqual(clientFromArgs, client);
        assert.hasAllKeys(updateData, ['token']);
        assert.isString(updateData.token);

        assert.deepStrictEqual(
          ctx.response.body,
          pick(tokenRecord, ['client', 'token', 'createdDate', 'updatedDate'])
        );
      });
    });

    afterEach(() => {
      sandbox.reset();
    });

    after(() => {
      sandbox.restore();
    });
  });
});
