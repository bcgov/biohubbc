import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { TaxonomyService } from './taxonomy-service';

chai.use(sinonChai);

describe('TaxonomyService', () => {
  it('constructs', () => {
    const taxonomyService = new TaxonomyService();

    expect(taxonomyService).to.be.instanceof(TaxonomyService);
  });

  describe('sanitizeSpeciesData', async () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should filter out species codes that have expired', async () => {
      process.env.ELASTICSEARCH_TAXONOMY_INDEX = 'taxonomy_2.0.0';

      // const elasticSearch = sinon.stub(TaxonomyService.prototype, '_elasticSearch').resolves({});
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
