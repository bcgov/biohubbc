import chai from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

describe('getFundingSource', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('gets a funding source', async () => {
    // TODO
  });

  it('catches and re-throws error', async () => {
    // TODO
  });
});

describe('putFundingSource', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('updates a funding source', async () => {
    // TODO
  });

  it('catches and re-throws error', async () => {
    // TODO
  });
});

describe('deleteFundingSource', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('deletes a funding source', async () => {
    // TODO
  });

  it('catches and re-throws error', async () => {
    // TODO
  });
});
