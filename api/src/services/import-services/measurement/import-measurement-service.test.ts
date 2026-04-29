import { expect } from 'chai';
import sinon from 'sinon';
import { v4 } from 'uuid';
import { getMockDBConnection } from '../../../__mocks__/db';
import * as csv from '../../../utils/csv-utils/csv-config-validation';
import { CSVRowState } from '../../../utils/csv-utils/csv-config-validation.interface';
import { NestedRecord } from '../../../utils/nested-record';
import * as measurementUtils from '../utils/measurement';
import { ImportMeasurementsService } from './import-measurements-service';

describe('import-measurements-service', () => {
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

      const critterIdMock = v4();
      const captureIdMock = v4();
      const taxonMeasurementIdMock = v4();
      const qualitativeOptionIdMock = v4();

      sinon.stub(service, 'getCSVConfig').returns({} as any);
      sinon.stub(csv, 'validateCSVWorksheet').returns({
        errors: [],
        rows: [
          {
            [CSVRowState]: {
              critter_id: critterIdMock,
              capture_id: captureIdMock,
              qualHeader: {
                taxon_measurement_id: taxonMeasurementIdMock,
                qualitative_option_id: qualitativeOptionIdMock
              },
              quantHeader: { taxon_measurement_id: taxonMeasurementIdMock, value: 1 }
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
            critter_id: critterIdMock,
            capture_id: captureIdMock,
            taxon_measurement_id: taxonMeasurementIdMock,
            qualitative_option_id: qualitativeOptionIdMock
          }
        ],
        quantitative_measurements: [
          {
            critter_id: critterIdMock,
            capture_id: captureIdMock,
            taxon_measurement_id: taxonMeasurementIdMock,
            value: 1
          }
        ]
      });

      expect(result).to.be.an('array').that.is.empty;
    });
  });

  describe('getCSVConfig', () => {
    it('should get the csv config', async () => {
      const connection = getMockDBConnection();
      const importMeasurementsService = new ImportMeasurementsService(connection, {}, 1);

      sinon.stub(importMeasurementsService.surveyCritterService, 'getSurveyCritterAliasMap').resolves(new Map());
      sinon.stub(importMeasurementsService, '_getWorksheetTsns').returns([1]);
      sinon.stub(measurementUtils, 'getTsnMeasurementDictionary').resolves(new NestedRecord());

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

    it('should return an empty array when no tsns are found', async () => {
      const connection = getMockDBConnection();
      const importMeasurementsService = new ImportMeasurementsService(connection, {}, 1);

      sinon.stub(importMeasurementsService.utils, 'getUniqueCellValues').returns([]);

      const surveyAliasMap = new Map<string, any>();

      const result = importMeasurementsService._getWorksheetTsns(surveyAliasMap);

      expect(result.length).to.be.equal(0);
    });
  });
});
