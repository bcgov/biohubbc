import chai from 'chai';
import { describe } from 'mocha';

import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

describe('SummaryRepository', () => {
  afterEach(() => {
    sinon.restore();
  });
});
