import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { EmlService } from './eml-service';

chai.use(sinonChai);

describe('EmlService', () => {
  it('constructs', () => {
    const dbConnectionObj = getMockDBConnection();

    const emlService = new EmlService(dbConnectionObj);

    expect(emlService).to.be.instanceof(EmlService);
  });
});
