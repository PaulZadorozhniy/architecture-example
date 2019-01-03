import * as faker from 'faker';
import { assert } from 'chai';
import sinon from 'sinon';
import getHandler from 'external-api/src/self-healing/terminal-objective/get-handler';
import terminalObjectiveInteractor from 'common/interactors/terminal-objective';
import { TerminalObjectiveResponse } from 'common/entities/terminal-objective';
import { generateTerminalObjectiveRecord } from 'common/test/fixtures/terminal-objective';
import { TerminalObjectiveModel } from 'common/db/models/terminal-objective';

describe('GET', () => {
  let id: string;
  let sandbox;
  let getTerminalObjectiveStub;
  let ctx;
  let terminalObjective: TerminalObjectiveModel;

  before(() => {
    sandbox = sinon.createSandbox();
    getTerminalObjectiveStub = sandbox.stub();
    getTerminalObjectiveStub = sandbox.stub();
    sandbox.replace(
      terminalObjectiveInteractor,
      'get',
      getTerminalObjectiveStub
    );
  });

  context('valid input', () => {
    beforeEach(async () => {
      id = faker.random.uuid();
      ctx = {
        params: { id }
      };

      terminalObjective = generateTerminalObjectiveRecord();
      getTerminalObjectiveStub.resolves(terminalObjective);

      await getHandler(ctx);
    });

    it('sets ctx.status to 200', () => {
      assert.strictEqual(ctx.status, 200);
    });

    it('sets ctx.body terminal objective data', () => {
      const extectedResult = new TerminalObjectiveResponse(terminalObjective);

      assert.deepEqual(ctx.body, extectedResult);
    });

    it('calls repository with righ params', () => {
      sinon.assert.calledOnce(getTerminalObjectiveStub);
      sinon.assert.calledWithExactly(getTerminalObjectiveStub, id);
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

      getTerminalObjectiveStub.resolves(undefined);

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
