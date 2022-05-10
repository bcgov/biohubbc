import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinonChai from 'sinon-chai';
import { TaxonomyService } from './taxonomy-service';

chai.use(sinonChai);

describe('TaxonomyService', () => {
  it('constructs', () => {
    const taxonomyService = new TaxonomyService();

    expect(taxonomyService).to.be.instanceof(TaxonomyService);
  });
});
