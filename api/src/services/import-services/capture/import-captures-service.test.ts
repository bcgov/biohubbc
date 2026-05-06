import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { WorkSheet } from 'xlsx';
import { getMockDBConnection } from '../../../__mocks__/db';
import * as csv from '../../../utils/csv-utils/csv-config-validation';
import { CSVConfig, CSVRowState } from '../../../utils/csv-utils/csv-config-validation.interface';
import { SurveyCritterService } from '../../survey-critter-service';
import { ImportCapturesService } from './import-captures-service';

chai.use(sinonChai);

describe('import-captures-service', () => {
  beforeEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('should create an instance of ImportCapturesService', () => {
      const mockConnection = getMockDBConnection();
      const worksheet = {} as WorkSheet;
      const surveyId = 1;

      const service = new ImportCapturesService(mockConnection, worksheet, surveyId);

      expect(service).to.be.instanceof(ImportCapturesService);
      expect(service.surveyId).to.be.equal(surveyId);
      expect(service.worksheet).to.be.equal(worksheet);
      expect(service.surveyCritterService).to.be.instanceof(SurveyCritterService);
    });
  });

  describe('getCSVConfig', () => {
    it('should return a CSVConfig object', async () => {
      const mockConnection = getMockDBConnection();
      const worksheet = {} as WorkSheet;
      const surveyId = 1;

      const service = new ImportCapturesService(mockConnection, worksheet, surveyId);

      sinon.stub(service.surveyCritterService, 'getSurveyCritterAliasMap').resolves(new Map());

      try {
        const config = await service.getCSVConfig();
        expect(config.ignoreDynamicHeaders).to.be.false;
      } catch (_error) {
        expect.fail('should not throw an error');
      }
    });

    it('should have the correct static headers', async () => {
      const mockConnection = getMockDBConnection();
      const worksheet = {} as WorkSheet;
      const surveyId = 1;

      const service = new ImportCapturesService(mockConnection, worksheet, surveyId);

      sinon.stub(service.surveyCritterService, 'getSurveyCritterAliasMap').resolves(new Map());

      const config = await service.getCSVConfig();

      expect(config.staticHeadersConfig).to.have.keys([
        'ALIAS',
        'CAPTURE_DATE',
        'CAPTURE_TIME',
        'CAPTURE_LATITUDE',
        'CAPTURE_LONGITUDE',
        'RELEASE_DATE',
        'RELEASE_TIME',
        'RELEASE_LATITUDE',
        'RELEASE_LONGITUDE',
        'CAPTURE_COMMENT',
        'RELEASE_COMMENT'
      ]);
    });
  });

  describe('_convertRowIntoPayloads', () => {
    it('should convert a row into a payload', async () => {
      const mockConnection = getMockDBConnection();
      const worksheet = {} as WorkSheet;
      const surveyId = 1;

      const service = new ImportCapturesService(mockConnection, worksheet, surveyId);

      const row = {
        ALIAS: 'test',
        CAPTURE_DATE: '2021-01-01',
        CAPTURE_TIME: '12:00:00',
        CAPTURE_LATITUDE: '1.234',
        CAPTURE_LONGITUDE: '1.234',
        RELEASE_DATE: '2021-01-01',
        RELEASE_TIME: '12:00:00',
        RELEASE_LATITUDE: '1.234',
        RELEASE_LONGITUDE: '1.234',
        CAPTURE_COMMENT: 'test',
        RELEASE_COMMENT: 'test',
        [CSVRowState]: {}
      };

      const payload = service._convertRowIntoPayloads(row);

      expect(payload.capture.capture_location_id).to.equal(payload.captureLocation.location_id);
      expect(payload.capture.release_location_id).to.equal(payload.releaseLocation?.location_id);

      expect(payload.capture.capture_id).to.be.a('string');
      expect(payload.capture.capture_date).to.equal('2021-01-01');
      expect(payload.capture.capture_time).to.equal('12:00:00');
      expect(payload.capture.capture_comment).to.equal('test');
      expect(payload.capture.release_date).to.equal('2021-01-01');
      expect(payload.capture.release_time).to.equal('12:00:00');
      expect(payload.capture.release_comment).to.equal('test');

      expect(payload.captureLocation.location_id).to.be.a('string');
      expect(payload.captureLocation.latitude).to.equal('1.234');
      expect(payload.captureLocation.longitude).to.equal('1.234');

      expect(payload.releaseLocation?.location_id).to.be.a('string');
      expect(payload.releaseLocation?.latitude).to.equal('1.234');
      expect(payload.releaseLocation?.longitude).to.equal('1.234');
    });

    it('should convert a row into a payload without release location', async () => {
      const mockConnection = getMockDBConnection();
      const worksheet = {} as WorkSheet;
      const surveyId = 1;

      const service = new ImportCapturesService(mockConnection, worksheet, surveyId);

      const row = {
        ALIAS: 'test',
        CAPTURE_DATE: '2021-01-01',
        CAPTURE_TIME: '12:00:00',
        CAPTURE_LATITUDE: '1.234',
        CAPTURE_LONGITUDE: '1.234',
        RELEASE_DATE: '2021-01-01',
        RELEASE_TIME: '12:00:00',
        RELEASE_LATITUDE: undefined,
        RELEASE_LONGITUDE: undefined,
        CAPTURE_COMMENT: 'test',
        RELEASE_COMMENT: 'test',
        [CSVRowState]: {}
      };

      const payload = service._convertRowIntoPayloads(row);

      expect(payload.capture.capture_location_id).to.be.a('string');
      expect(payload.capture.release_location_id).to.be.undefined;

      expect(payload.captureLocation).to.be.not.undefined;
      expect(payload.releaseLocation).to.be.undefined;
    });
  });

  describe('importCSVWorksheet', () => {
    it('should import the worksheet', async () => {
      const mockConnection = getMockDBConnection();
      const worksheet = {} as WorkSheet;
      const surveyId = 1;

      const service = new ImportCapturesService(mockConnection, worksheet, surveyId);

      const bulkCreateStub = sinon.stub(service.surveyCritterService.critterbaseService, 'bulkCreate');
      sinon.stub(service, 'getCSVConfig').resolves({} as CSVConfig);
      sinon.stub(csv, 'validateCSVWorksheet').returns({
        rows: [
          {
            ALIAS: 'test',
            CAPTURE_DATE: '2021-01-01',
            CAPTURE_TIME: '12:00:00',
            CAPTURE_LATITUDE: '1.234',
            CAPTURE_LONGITUDE: '1.234',
            RELEASE_DATE: '2021-01-01',
            RELEASE_TIME: '12:00:00',
            RELEASE_LATITUDE: undefined,
            RELEASE_LONGITUDE: undefined,
            CAPTURE_COMMENT: 'test',
            RELEASE_COMMENT: 'test',
            [CSVRowState]: {}
          }
        ],
        errors: []
      });

      const errors = await service.importCSVWorksheet();

      expect(bulkCreateStub).to.have.been.calledOnce;
      expect(errors).to.be.an('array').that.is.empty;
    });

    it('should return errors early', async () => {
      const mockConnection = getMockDBConnection();
      const worksheet = {} as WorkSheet;
      const surveyId = 1;

      const service = new ImportCapturesService(mockConnection, worksheet, surveyId);

      sinon.stub(service, 'getCSVConfig').resolves({} as CSVConfig);
      sinon.stub(csv, 'validateCSVWorksheet').returns({
        rows: [],
        errors: [{ row: 1 } as any]
      });

      const errors = await service.importCSVWorksheet();
      expect(errors).to.be.an('array').that.is.not.empty;
    });
  });
});
