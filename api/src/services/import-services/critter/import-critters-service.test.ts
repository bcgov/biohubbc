import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import xlsx from 'xlsx';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { CSVRowState } from '../../../utils/csv-utils/csv-config-validation.interface';
import * as headerConfig from '../../../utils/csv-utils/csv-header-configs';
import { NestedRecord } from '../../../utils/nested-record';
import { getMockDBConnection } from '../../../__mocks__/db';
import { CritterbaseService } from '../../critterbase-service';
import { SurveyCritterService } from '../../survey-critter-service';
import { ImportCrittersService } from './import-critters-service';
import * as critterConfig from './utils/critter-header-configs';

chai.use(sinonChai);

describe('ImportCrittersService', () => {
  beforeEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('should create a new instance of the service', () => {
      const mockConnection = getMockDBConnection();
      const worksheet = xlsx.utils.json_to_sheet([]);

      const service = new ImportCrittersService(mockConnection, worksheet, 1);

      expect(service).to.be.instanceof(ImportCrittersService);
      expect(service).to.have.property('connection', mockConnection);
      expect(service).to.have.property('worksheet', worksheet);
      expect(service).to.have.property('surveyId', 1);

      expect(service.utils).to.be.instanceof(CSVConfigUtils);
      expect(service.surveyCritterService).to.be.instanceof(SurveyCritterService);
      expect(service.critterbaseService).to.be.instanceof(CritterbaseService);

      expect(Object.keys(service.utils.config.staticHeadersConfig)).to.deep.equal([
        'SPECIES',
        'ALIAS',
        'SEX',
        'WLH_ID',
        'DESCRIPTION'
      ]);
    });
  });

  describe('getCSVConfig', () => {
    it('should return a valid CSVConfig object', async () => {
      const mockConnection = getMockDBConnection();
      const worksheet = xlsx.utils.json_to_sheet([]);

      const service = new ImportCrittersService(mockConnection, worksheet, 1);

      sinon.stub(service, '_getAliasHeaderConfig').resolves({ validateCell: () => [] });
      sinon.stub(service, '_getSexHeaderConfig').resolves({ validateCell: () => [], setCellValue: () => 'A' });
      sinon
        .stub(service, '_getCollectionUnitDynamicHeaderConfig')
        .resolves({ validateCell: () => [], setCellValue: () => 'B' });

      sinon.stub(headerConfig, 'getDescriptionCellValidator').returns(() => []);
      sinon.stub(critterConfig, 'getWlhIDCellValidator').returns(() => []);

      const config = await service.getCSVConfig();

      expect(config.staticHeadersConfig.SPECIES.validateCell).to.be.a('function');
      expect(config.staticHeadersConfig.ALIAS.validateCell).to.be.a('function');
      expect(config.staticHeadersConfig.SEX.validateCell).to.be.a('function');
      expect(config.staticHeadersConfig.SEX.setCellValue).to.be.a('function');
      expect(config.staticHeadersConfig.WLH_ID.validateCell).to.be.a('function');
      expect(config.staticHeadersConfig.DESCRIPTION.validateCell).to.be.a('function');
      expect(config.dynamicHeadersConfig?.validateCell).to.be.a('function');
      expect(config.dynamicHeadersConfig?.setCellValue).to.be.a('function');

      expect(config.ignoreDynamicHeaders).to.be.false;
    });
  });

  describe('_getAliasHeaderConfig', () => {
    it('should return a valid header config object', async () => {
      const mockConnection = getMockDBConnection();
      const worksheet = xlsx.utils.json_to_sheet([{ ALIAS: 'test' }]);

      const service = new ImportCrittersService(mockConnection, worksheet, 1);

      const getSurveyCritterAliasesStub = sinon
        .stub(service.surveyCritterService, 'getUniqueSurveyCritterAliases')
        .resolves(new Set(['test']));
      const getCritterAliasCellValidatorStub = sinon
        .stub(critterConfig, 'getCritterAliasCellValidator')
        .returns(() => []);

      const aliasHeaderConfig = await service._getAliasHeaderConfig();

      expect(getSurveyCritterAliasesStub).to.have.been.calledOnceWithExactly(1);
      expect(getCritterAliasCellValidatorStub).to.have.been.calledOnceWithExactly(new Set(['test']), service.utils);

      expect(aliasHeaderConfig.validateCell).to.be.a('function');
      expect(aliasHeaderConfig.setCellValue).to.be.a('function');
    });
  });

  describe('_getSexHeaderConfig', () => {
    it('should return a valid header config object', async () => {
      const mockConnection = getMockDBConnection();
      const worksheet = xlsx.utils.json_to_sheet([{ SPECIES: 'species' }]);

      const service = new ImportCrittersService(mockConnection, worksheet, 1);

      const getTaxonMeasurementsStub = sinon.stub(service.critterbaseService, 'getTaxonMeasurements').resolves({
        qualitative: [
          {
            measurement_name: 'sex',
            itis_tsn: 1234,
            options: [
              {
                option_label: 'male',
                qualitative_option_id: 'maleUUID'
              },
              {
                option_label: 'female',
                qualitative_option_id: 'femaleUUID'
              }
            ]
          }
        ]
      } as any);

      const getSexCellValidatorStub = sinon.stub(critterConfig, 'getCritterSexCellValidator').returns(() => []);

      const sexHeaderConfig = await service._getSexHeaderConfig([1234]);

      expect(getTaxonMeasurementsStub).to.have.been.calledWithExactly(1234);
      expect(getSexCellValidatorStub).to.have.been.calledWithExactly(
        new NestedRecord({
          1234: { male: 'maleUUID', female: 'femaleUUID' }
        })
      );

      expect(sexHeaderConfig.validateCell).to.be.a('function');
      expect(sexHeaderConfig.setCellValue).to.be.undefined;
    });
  });

  describe('_getCollectionUnitDynamicHeaderConfig', () => {
    it('should return a valid header config object', async () => {
      const mockConnection = getMockDBConnection();
      const worksheet = xlsx.utils.json_to_sheet([{ UNIT: 'unit', SPECIES: 'species' }]);

      const service = new ImportCrittersService(mockConnection, worksheet, 1);

      const findTaxonCollectionUnitsStub = sinon
        .stub(service.critterbaseService, 'findTaxonCollectionUnits')
        .resolves([{ category_name: 'category', unit_name: 'unit', collection_unit_id: 'uuid' }] as any[]);

      const getCollectionUnitCellValidatorStub = sinon
        .stub(critterConfig, 'getCritterCollectionUnitCellValidator')
        .returns(() => []);

      const config = await service._getCollectionUnitDynamicHeaderConfig([1234]);

      expect(findTaxonCollectionUnitsStub).to.have.been.calledOnceWithExactly(1234);

      expect(getCollectionUnitCellValidatorStub).to.have.been.calledWithExactly(
        new NestedRecord({ 1234: { category: { unit: 'uuid' } } })
      );

      expect(config.validateCell).to.be.a('function');
      expect(config.setCellValue).to.be.undefined;
    });
  });

  describe('_getImportPayloads', () => {
    it('should return all import payloads', () => {
      const mockConnection = getMockDBConnection();
      const rows = [
        {
          SPECIES: 1234,
          ALIAS: 'test',
          SEX: 'sexId',
          WLH_ID: '12-2222',
          DESCRIPTION: 'comment',
          POPULATION_UNIT: 'unit',
          COLLECTION_UNIT: 'collection',
          [CSVRowState]: {
            taxon: {
              itis_tsn: 1234,
              itis_scientific_name: 'species'
            }
          }
        }
      ];
      const worksheet = xlsx.utils.json_to_sheet(rows);

      const service = new ImportCrittersService(mockConnection, worksheet, 1);

      const payloads = service._getImportPayloads(rows);

      expect(payloads.simsPayload[0]).to.be.a('string');

      expect(payloads.critterbasePayload.critters?.[0].itis_tsn).to.be.equal(1234);
      expect(payloads.critterbasePayload.critters?.[0].animal_id).to.be.equal('test');
      expect(payloads.critterbasePayload.critters?.[0].sex_qualitative_option_id).to.be.equal('sexId');
      expect(payloads.critterbasePayload.critters?.[0].wlh_id).to.be.equal('12-2222');
      expect(payloads.critterbasePayload.critters?.[0].critter_comment).to.be.equal('comment');
      expect(payloads.critterbasePayload.critters?.[0].critter_id).to.be.a('string');

      expect(payloads.critterbasePayload.collections?.[0].critter_id).to.be.a('string');
      expect(payloads.critterbasePayload.collections?.[0].collection_unit_id).to.be.equal('unit');

      expect(payloads.critterbasePayload.collections?.[1].critter_id).to.be.a('string');
      expect(payloads.critterbasePayload.collections?.[1].collection_unit_id).to.be.equal('collection');
    });
  });
});
