import { expect } from 'chai';
import sinon from 'sinon';
import * as csv from '../../../utils/csv-utils/csv-config-validation';
import { CSVRowState } from '../../../utils/csv-utils/csv-config-validation.interface';
import { NestedRecord } from '../../../utils/nested-record';
import { getMockDBConnection } from '../../../__mocks__/db';
import { ImportMeasurementsService } from './import-measurements-service';

describe.only('import-measurements-service', () => {
  beforeEach(() => {
    sinon.restore();
  });

  describe('importCSVWorksheet', () => {
    it('should return errors early', async () => {
      const connection = getMockDBConnection();
      const service = new ImportMeasurementsService(connection, {}, 1);

      sinon.stub(service, 'getCSVConfig').returns({} as any);
      sinon.stub(csv, 'validateCSVWorksheet').returns({
        errors: [
          {
            row: 1,
            header: 'header',
            error: 'error',
            solution: 'solution',
            values: null,
            cell: 'cell'
          }
        ],
        rows: []
      });

      const result = await service.importCSVWorksheet();

      expect(result).to.be.an('array');
      expect(result.length).to.be.equal(1);
    });

    it('should grab the measurements from the row', async () => {
      const connection = getMockDBConnection();
      const service = new ImportMeasurementsService(connection, {}, 1);

      sinon.stub(service, 'getCSVConfig').returns({} as any);
      sinon.stub(csv, 'validateCSVWorksheet').returns({
        errors: [],
        rows: [
          {
            [CSVRowState]: {
              critter_id: 'critter_id',
              capture_id: 'capture_id',
              qualHeader: { taxon_measurement_id: 1, qualitative_option_id: 1 },
              quantHeader: { taxon_measurement_id: 1, value: 1 }
            }
          }
        ]
      });

      sinon.stub(service.utils, 'worksheetDynamicHeaders').get(() => ['qualHeader', 'quantHeader']);

      const bulkCreateStub = sinon.stub(service.surveyCritterService.critterbaseService, 'bulkCreate');

      const result = await service.importCSVWorksheet();

      expect(bulkCreateStub).to.have.been.calledOnceWithExactly({
        qualitative_measurements: [
          {
            critter_id: 'critter_id',
            capture_id: 'capture_id',
            taxon_measurement_id: 1,
            qualitative_option_id: 1
          }
        ],
        quantitative_measurements: [
          {
            critter_id: 'critter_id',
            capture_id: 'capture_id',
            taxon_measurement_id: 1,
            value: 1
          }
        ]
      });

      expect(result).to.be.an('array').that.is.empty;
    });

    it('should throw an error if the state measurement is not valid', async () => {
      const connection = getMockDBConnection();
      const service = new ImportMeasurementsService(connection, {}, 1);

      sinon.stub(service, 'getCSVConfig').returns({} as any);
      sinon.stub(csv, 'validateCSVWorksheet').returns({
        errors: [],
        rows: [
          {
            [CSVRowState]: {
              critter_id: 'critter_id',
              capture_id: 'capture_id',
              badHeader: { taxon_measurement_id: 1, qualitative_option_id: 1 },
              otherBadHeader: { taxon_measurement_id: 1, value: 1 }
            }
          }
        ]
      });

      sinon.stub(service.utils, 'worksheetDynamicHeaders').get(() => ['qualHeader', 'quantHeader']);

      const bulkCreateStub = sinon.stub(service.surveyCritterService.critterbaseService, 'bulkCreate');

      try {
        await service.importCSVWorksheet();
        expect.fail('Expected an error');
      } catch (error) {
        expect(error).to.be.an('error');
        expect(bulkCreateStub).to.not.have.been.called;
      }
    });
  });

  describe('getCSVConfig', () => {
    it('should get the csv config', async () => {
      const connection = getMockDBConnection();
      const importMeasurementsService = new ImportMeasurementsService(connection, {}, 1);

      sinon.stub(importMeasurementsService.surveyCritterService, 'getSurveyCritterAliasMap').resolves(new Map());
      sinon.stub(importMeasurementsService, '_getWorksheetTsns').returns([1]);
      sinon.stub(importMeasurementsService, '_getTsnMeasurementDictionary').resolves(new NestedRecord());

      const result = await importMeasurementsService.getCSVConfig();

      expect(result.ignoreDynamicHeaders).to.be.false;

      expect(result.staticHeadersConfig.ALIAS.validateCell).to.be.a('function');
      expect(result.staticHeadersConfig.CAPTURE_DATE.validateCell).to.be.a('function');
      expect(result.staticHeadersConfig.CAPTURE_TIME.validateCell).to.be.a('function');

      expect(result.rowValidators?.length).to.be.equal(1);
      expect(result.rowValidators?.[0]).to.be.a('function');
      expect(result.dynamicHeadersConfig?.validateCell).to.be.a('function');
    });
  });

  describe('_getWorksheetTsns', () => {
    it('should get the worksheet tsns', async () => {
      const connection = getMockDBConnection();
      const importMeasurementsService = new ImportMeasurementsService(connection, {}, 1);

      sinon.stub(importMeasurementsService.utils, 'getUniqueCellValues').returns(['alias']);

      const surveyAliasMap = new Map<string, any>([['alias', { itis_tsn: 1 }]]);

      const result = importMeasurementsService._getWorksheetTsns(surveyAliasMap);

      expect(result.length).to.be.equal(1);
      expect(result[0]).to.equal(1);
    });
  });

  describe('_getTsnMeasurementDictionary', () => {
    it('should get the tsn measurement dictionary', async () => {
      const connection = getMockDBConnection();
      const importMeasurementsService = new ImportMeasurementsService(connection, {}, 1);

      const measurements = {
        qualitative: [{ measurement_name: 'qualitative' }],
        quantitative: [{ measurement_name: 'quantitative' }]
      };

      const getTaxonMeasurementsStub = sinon.stub(
        importMeasurementsService.surveyCritterService.critterbaseService,
        'getTaxonMeasurements'
      );

      getTaxonMeasurementsStub.resolves(measurements as any);

      const result = await importMeasurementsService._getTsnMeasurementDictionary([1]);

      expect(getTaxonMeasurementsStub).to.have.been.calledOnceWith('1');
      expect(result.get(1, 'qualitative')).to.deep.equal({ measurement_name: 'qualitative' });
      expect(result.get(1, 'quantitative')).to.deep.equal({ measurement_name: 'quantitative' });
    });
  });
});
