import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiError } from '../errors/api-error';
import { IOccurrenceSubmission } from '../repositories/occurrence-repository';
import * as spatial_utils from '../utils/spatial-utils';
import { getMockDBConnection } from '../__mocks__/db';
import { DwCService } from './dwc-service';
import { OccurrenceService } from './occurrence-service';
import { TaxonomyService } from './taxonomy-service';
chai.use(sinonChai);

describe('DwCService', () => {
  it('constructs', () => {
    const dbConnectionObj = getMockDBConnection();

    const dwcService = new DwCService(dbConnectionObj);

    expect(dwcService).to.be.instanceof(DwCService);
  });

  describe('decorateTaxonIDs', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('does not enrich the jsonObject if no taxonIDs exists', async () => {
      const dbConnectionObj = getMockDBConnection();

      const dwcService = new DwCService(dbConnectionObj);

      const jsonObject = { id: 1, some_text: 'abcd' };

      const enrichedJSON = await dwcService.decorateTaxonIDs(jsonObject);

      expect(enrichedJSON).to.be.eql(jsonObject);
      expect(enrichedJSON).not.to.be.eql({ id: 1 });
    });

    it('enriches the jsonObject when it has one taxonID', async () => {
      const dbConnectionObj = getMockDBConnection();

      const dwcService = new DwCService(dbConnectionObj);

      const getEnrichedDataForSpeciesCodeStub = sinon
        .stub(TaxonomyService.prototype, 'getEnrichedDataForSpeciesCode')
        .resolves({ scientificName: 'some scientific name', englishName: 'some common name' });

      const jsonObject = {
        item_with_depth_1: {
          item_with_depth_2: { taxonID: 'M-OVCA' }
        }
      };

      const enrichedJSON = await dwcService.decorateTaxonIDs(jsonObject);

      expect(getEnrichedDataForSpeciesCodeStub).to.have.been.called;
      expect(getEnrichedDataForSpeciesCodeStub).to.have.been.calledWith('M-OVCA');
      expect(enrichedJSON.item_with_depth_1.item_with_depth_2.scientificName).to.equal('some scientific name');
      expect(enrichedJSON.item_with_depth_1.item_with_depth_2.taxonID).to.equal('M-OVCA');
      expect(enrichedJSON.item_with_depth_1.item_with_depth_2.vernacularName).to.equal('some common name');
    });

    it('enriches the jsonObject when it has multiple taxonIDs at different depths', async () => {
      const dbConnectionObj = getMockDBConnection();

      const dwcService = new DwCService(dbConnectionObj);

      const getEnrichedDataForSpeciesCodeStub = sinon
        .stub(TaxonomyService.prototype, 'getEnrichedDataForSpeciesCode')
        .resolves({ scientificName: 'some scientific name', englishName: 'some common name' });

      const jsonObject = {
        item_with_depth_1: {
          taxonID: 'M_ALAM',
          item_with_depth_2: { taxonID: 'M-OVCA', something: 'abcd' }
        }
      };

      const enrichedJSON = await dwcService.decorateTaxonIDs(jsonObject);

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

  describe('decorateLatLong', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns if decimalLatitude and decimalLongitude are filled ', async () => {
      const dbConnectionObj = getMockDBConnection();

      const dwcService = new DwCService(dbConnectionObj);
      const jsonObject = {
        item_with_depth_1: {
          item_with_depth_2: [{ verbatimCoordinates: '', decimalLatitude: 123, decimalLongitude: 123 }]
        }
      };

      const newJson = await dwcService.decorateLatLong(jsonObject);

      expect(newJson).to.eql(jsonObject);
    });

    it('throws an error if veratimCoordinates cannot be parsed ', async () => {
      const dbConnectionObj = getMockDBConnection();

      const dwcService = new DwCService(dbConnectionObj);
      const jsonObject = {
        item_with_depth_1: {
          item_with_depth_2: [{ verbatimCoordinates: '12 12314 12241' }]
        }
      };

      sinon.stub(spatial_utils, 'parseUTMString').returns(null);

      try {
        await dwcService.decorateLatLong(jsonObject);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to parse UTM String');
      }
    });

    it('succeeds and decorates Lat Long', async () => {
      const dbConnectionObj = getMockDBConnection();

      const dwcService = new DwCService(dbConnectionObj);
      const jsonObject = {
        item_with_depth_1: {
          item_with_depth_2: [{ verbatimCoordinates: '12 12314 12241' }]
        }
      };

      sinon.stub(spatial_utils, 'parseUTMString').returns({
        easting: 1,
        northing: 2,
        zone_letter: 'a',
        zone_number: 3,
        zone_srid: 4
      });

      sinon.stub(spatial_utils, 'utmToLatLng').returns({ latitude: 1, longitude: 2 });

      const response = await await dwcService.decorateLatLong(jsonObject);

      expect(response).to.eql({
        item_with_depth_1: {
          item_with_depth_2: [{ verbatimCoordinates: '12 12314 12241', decimalLatitude: 1, decimalLongitude: 2 }]
        }
      });
    });
  });

  //TODO:  this needs to be examined thoroughly
  describe.skip('decorateDWCASourceData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('runs decoration and saves data', async () => {
      const dbConnectionObj = getMockDBConnection();

      const dwcService = new DwCService(dbConnectionObj);

      const getOccurrenceSubmissionStub = sinon
        .stub(OccurrenceService.prototype, 'getOccurrenceSubmission')
        .resolves(({ id: 1, darwin_core_source: { id: 2 } } as unknown) as IOccurrenceSubmission);

      const decorateLatLongStub = sinon
        .stub(DwCService.prototype, 'decorateLatLong')
        .resolves({ id: 2, lat: 1, long: 2 });
      const decorateTaxonIDsStub = sinon
        .stub(DwCService.prototype, 'decorateTaxonIDs')
        .resolves({ id: 2, lat: 1, long: 2, taxonID: 3 });

      const updateDWCSourceForOccurrenceSubmissionStub = sinon
        .stub(OccurrenceService.prototype, 'updateDWCSourceForOccurrenceSubmission')
        .resolves(1);

      const response = await dwcService.decorateDwCJSON({});

      expect(response).to.eql(true);
      expect(getOccurrenceSubmissionStub).to.be.calledOnce;
      expect(decorateLatLongStub).to.be.calledOnce;
      expect(decorateTaxonIDsStub).to.be.calledOnce;
      expect(updateDWCSourceForOccurrenceSubmissionStub).to.be.calledOnce;
    });
  });
});
