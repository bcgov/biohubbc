import chai from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

describe('postFundingSource', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('creates a funding source', async () => {
    // TODO
  });

  it('catches and re-throws error', async () => {
    // TODO
  });
});
