import chai from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

describe('RegionRepository', () => {
  afterEach(() => {
    sinon.restore();
  });
  describe('addRegionsToAProject', () => {
    it('should return early when no regions passed in', async () => {});
  });
});
