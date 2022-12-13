import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { DwCService } from './dwc-service';
import { TaxonomyService } from './taxonomy-service';

chai.use(sinonChai);

describe('DwCService', () => {
  it('constructs', () => {
    const dbConnectionObj = getMockDBConnection();

    const dwcService = new DwCService({ projectId: 1 }, dbConnectionObj);

    expect(dwcService).to.be.instanceof(DwCService);
  });
  describe('enrichTaxonIDs', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('does not enrich the jsonObject is no taxonIDs exists', async () => {
      const dbConnectionObj = getMockDBConnection();

      const dwcService = new DwCService({ projectId: 1 }, dbConnectionObj);

      const jsonObject = { id: 1, some_text: 'abcd' };

      const enrichedJSON = await dwcService.enrichTaxonIDs(jsonObject);

      expect(enrichedJSON).to.be.eql(jsonObject);
      expect(enrichedJSON).not.to.be.eql({ id: 1 });
    });

    it('enriches the jsonObject when it has one taxonID', async () => {
      const dbConnectionObj = getMockDBConnection();

      const dwcService = new DwCService({ projectId: 1 }, dbConnectionObj);

      const getEnrichedDataForSpeciesCodeStub = sinon
        .stub(TaxonomyService.prototype, 'getEnrichedDataForSpeciesCode')
        .resolves({ scientific_name: 'some scientific name', english_name: 'some common name' });

      const jsonObject = {
        item_with_depth_1: {
          item_with_depth_2: { taxonID: 'M-OVCA' }
        }
      };

      const enrichedJSON = await dwcService.enrichTaxonIDs(jsonObject);

      expect(getEnrichedDataForSpeciesCodeStub).to.have.been.called;
      expect(getEnrichedDataForSpeciesCodeStub).to.have.been.calledWith('M-OVCA');
      expect(getEnrichedDataForSpeciesCodeStub).not.to.have.been.calledWith('M-OVCA1');
      expect(enrichedJSON.item_with_depth_1.item_with_depth_2.scientificName).to.equal('some scientific name');
      expect(enrichedJSON.item_with_depth_1.item_with_depth_2.taxonID).to.equal('M-OVCA');
      expect(enrichedJSON.item_with_depth_1.item_with_depth_2.vernacularName).to.equal('some common name');
    });

    it('enriches the jsonObject when it has multiple taxonIDs at different depths', async () => {
      const dbConnectionObj = getMockDBConnection();

      const dwcService = new DwCService({ projectId: 1 }, dbConnectionObj);

      const getEnrichedDataForSpeciesCodeStub = sinon
        .stub(TaxonomyService.prototype, 'getEnrichedDataForSpeciesCode')
        .resolves({ scientific_name: 'some scientific name', english_name: 'some common name' });

      const jsonObject = {
        item_with_depth_1: {
          taxonID: 'M_ALAM',
          item_with_depth_2: { taxonID: 'M-OVCA', something: 'abcd' }
        }
      };

      const enrichedJSON = await dwcService.enrichTaxonIDs(jsonObject);

      expect(getEnrichedDataForSpeciesCodeStub).to.have.been.calledTwice;
      expect(enrichedJSON.item_with_depth_1).to.eql({
        item_with_depth_2: {
          taxonID: 'M-OVCA',
          scientificName: 'some scientific name',
          vernacularName: 'some common name',
          something: 'abcd'
        },
        scientificName: 'some scientific name',
        taxonID: 'M_ALAM',
        vernacularName: 'some common name'
      });
      expect(enrichedJSON.item_with_depth_1.item_with_depth_2.taxonID).to.equal('M-OVCA');
      expect(enrichedJSON.item_with_depth_1.item_with_depth_2.vernacularName).to.equal('some common name');
    });
  });
});
