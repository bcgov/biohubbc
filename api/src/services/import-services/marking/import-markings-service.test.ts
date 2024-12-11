import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { WorkSheet } from 'xlsx';
import * as csv from '../../../utils/csv-utils/csv-config-validation';
import { CSVConfig } from '../../../utils/csv-utils/csv-config-validation.interface';
import { NestedRecord } from '../../../utils/nested-record';
import { getMockDBConnection } from '../../../__mocks__/db';
import { IAsSelectLookup } from '../../critterbase-service';
import { ImportMarkingsService } from './import-markings-service';

chai.use(sinonChai);

describe('import-markings-service', () => {
  beforeEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('should create an instance of ImportMarkingsService', () => {
      const mockConnection = getMockDBConnection();
      const worksheet = {} as WorkSheet;
      const surveyId = 1;

      const service = new ImportMarkingsService(mockConnection, worksheet, surveyId);

      expect(service).to.be.instanceof(ImportMarkingsService);
    });
  });

  describe('importCSVWorksheet', () => {
    it('should import the CSV worksheet', async () => {
      const mockConnection = getMockDBConnection();
      const worksheet = {} as WorkSheet;
      const surveyId = 1;

      const service = new ImportMarkingsService(mockConnection, worksheet, surveyId);

      const mockCSVConfig = {} as CSVConfig;
      const mockGetConfig = sinon.stub(service, 'getCSVConfig').resolves(mockCSVConfig);
      const bulkCreateStub = sinon.stub(service.surveyCritterService.critterbaseService, 'bulkCreate').resolves();

      const mockValidate = sinon.stub(csv, 'validateCSVWorksheet').returns({
        errors: [],
        rows: [
          {
            ALIAS: 'uuid',
            CAPTURE_DATE: 'uuid2',
            BODY_LOCATION: 'ear',
            MARKING_TYPE: 'tag',
            IDENTIFIER: 'id',
            PRIMARY_COLOUR: 'red',
            SECONDARY_COLOUR: 'blue',
            DESCRIPTION: 'comments'
          }
        ]
      });

      const errors = await service.importCSVWorksheet();

      expect(mockGetConfig).to.have.been.called;
      expect(mockValidate).to.have.been.calledOnceWithExactly(worksheet, mockCSVConfig);
      expect(bulkCreateStub).to.have.been.calledOnceWithExactly({
        markings: [
          {
            critter_id: 'uuid',
            capture_id: 'uuid2',
            body_location: 'ear',
            marking_type: 'tag',
            identifier: 'id',
            primary_colour: 'red',
            secondary_colour: 'blue',
            comment: 'comments'
          }
        ]
      });

      expect(errors).to.be.an('array').that.is.empty;
    });

    it('should return the errors early', async () => {
      const mockConnection = getMockDBConnection();
      const worksheet = {} as WorkSheet;
      const surveyId = 1;

      const service = new ImportMarkingsService(mockConnection, worksheet, surveyId);

      const mockCSVConfig = {} as CSVConfig;
      const mockGetConfig = sinon.stub(service, 'getCSVConfig').resolves(mockCSVConfig);

      const mockValidate = sinon.stub(csv, 'validateCSVWorksheet').returns({
        errors: [{ error: 'error', solution: 'solution', values: [] }],
        rows: []
      });

      const errors = await service.importCSVWorksheet();

      expect(mockGetConfig).to.have.been.called;
      expect(mockValidate).to.have.been.calledOnceWithExactly(worksheet, mockCSVConfig);

      expect(errors).to.be.an('array').that.is.not.empty;
    });
  });

  describe('getCSVConfig', () => {
    it('should return a CSVConfig object', async () => {
      const mockConnection = getMockDBConnection();
      const worksheet = {} as WorkSheet;
      const surveyId = 1;

      const service = new ImportMarkingsService(mockConnection, worksheet, surveyId);

      const mockAliasMap = new Map();
      const mockDictionary = new NestedRecord<string>();
      const mockMarkingTypes = [{ value: 'type1' }, { value: 'type2' }] as IAsSelectLookup[];
      const mockColours = [{ value: 'colour1' }, { value: 'colour2' }] as IAsSelectLookup[];

      const surveyAliasMapStub = sinon
        .stub(service.surveyCritterService, 'getSurveyCritterAliasMap')
        .resolves(mockAliasMap);

      const bodyLocationDictionaryStub = sinon.stub(service, '_getBodyLocationDictionary').resolves(mockDictionary);

      const markingTypesStub = sinon
        .stub(service.surveyCritterService.critterbaseService, 'getMarkingTypes')
        .resolves(mockMarkingTypes);

      const coloursStub = sinon
        .stub(service.surveyCritterService.critterbaseService, 'getColours')
        .resolves(mockColours);

      expect(surveyAliasMapStub).to.not.have.been.calledOnceWithExactly(surveyId);
      expect(bodyLocationDictionaryStub).to.not.have.been.calledOnceWithExactly(mockAliasMap);
      expect(markingTypesStub).to.not.have.been.calledOnceWithExactly();
      expect(coloursStub).to.not.have.been.calledOnceWithExactly();

      try {
        const config = await service.getCSVConfig();

        expect(config.dynamicHeadersConfig).to.be.equal(undefined);
        expect(config.staticHeadersConfig).to.have.keys([
          'ALIAS',
          'CAPTURE_DATE',
          'CAPTURE_TIME',
          'BODY_LOCATION',
          'MARKING_TYPE',
          'IDENTIFIER',
          'PRIMARY_COLOUR',
          'SECONDARY_COLOUR',
          'DESCRIPTION'
        ]);
      } catch (error) {
        expect.fail();
      }
    });
  });
});
