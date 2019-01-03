import * as faker from 'faker';
import { assert } from 'chai';
import sinon from 'sinon';
import getHandler from 'external-api/src/self-healing/enabling-objective/get-handler';
import enablingObjectiveInteractor from 'common/interactors/enabling-objective';
import { generateEnablingObjectiveRecord } from 'common/test/fixtures/enabling-objective';
import { EnablingObjectiveModel } from 'common/db/models/enabling-objective';
import { EnablingObjectiveResponse } from 'common/entities/enabling-objective';

describe('GET', () => {
  let id: string;
  let sandbox;
  let getEnablingObjectiveStub;
  let ctx;
  let enablingObjective: EnablingObjectiveModel;

  before(() => {
    sandbox = sinon.createSandbox();
    getEnablingObjectiveStub = sandbox.stub();
    sandbox.replace(
      enablingObjectiveInteractor,
      'get',
      getEnablingObjectiveStub
    );
  });

  context('valid input', () => {
    beforeEach(async () => {
      id = faker.random.uuid();
      ctx = {
        params: { id }
      };

      enablingObjective = generateEnablingObjectiveRecord();
      getEnablingObjectiveStub.resolves(enablingObjective);

      await getHandler(ctx);
    });

    it('sets ctx.status to 200', () => {
      assert.strictEqual(ctx.status, 200);
    });

    it('sets ctx.body enabling objective data', () => {
      assert.deepEqual(
        ctx.body,
        new EnablingObjectiveResponse(enablingObjective)
      );
    });

    it('calls repository with right params', () => {
      sinon.assert.calledOnce(getEnablingObjectiveStub);
      sinon.assert.calledWithExactly(getEnablingObjectiveStub, id);
    });
  });

  context('invalid input', () => {
    let ctxThrow;
    before(() => {
      ctxThrow = sandbox.stub();
    });

    beforeEach(async () => {
      id = faker.random.uuid();
      ctx = {
        params: { id },
        throw: ctxThrow
      };

      getEnablingObjectiveStub.resolves(undefined);

      await getHandler(ctx);
    });

    context('invalid id', () => {
      it('throws 404 error', () => {
        sinon.assert.calledOnce(ctxThrow);
        sinon.assert.calledWithExactly(ctxThrow, 404);
      });
    });
  });

  afterEach(() => {
    sandbox.reset();
  });

  after(() => {
    sandbox.restore();
  });
});
