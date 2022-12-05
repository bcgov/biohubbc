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

  describe('sanitizeSpeciesData', async () => {
    it('should filter out species codes that have expired', async () => {
      //
    });

    it('should not filter out species codes that have undefined end dates', () => {
      //
    });

    it('should only filter out species codes whose end date has already passed', async () => {
      //
    });
  });

  describe('isValidTaxonomySource', async () => {
    //
  });
});
