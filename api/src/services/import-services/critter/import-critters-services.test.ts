import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import xlsx from 'xlsx';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import * as headerConfig from '../../../utils/csv-utils/csv-header-configs';
import { NestedRecord } from '../../../utils/nested-record';
import { getMockDBConnection } from '../../../__mocks__/db';
import { CritterbaseService } from '../../critterbase-service';
import { SurveyCritterService } from '../../survey-critter-service';
import * as critterConfig from './critter-header-configs';
import { ImportCrittersService } from './import-critters-service';

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

      expect(service.configUtils).to.be.instanceof(CSVConfigUtils);
      expect(service.surveyCritterService).to.be.instanceof(SurveyCritterService);
      expect(service.critterbaseService).to.be.instanceof(CritterbaseService);

      expect(Object.keys(service._config.staticHeadersConfig)).to.deep.equal([
        'ITIS_TSN',
        'ALIAS',
        'SEX',
        'WLH_ID',
        'DESCRIPTION'
      ]);
    });
  });

  describe('_getCSVConfig', () => {
    it('should return a valid CSVConfig object (no errors thrown)', async () => {
      const mockConnection = getMockDBConnection();
      const worksheet = xlsx.utils.json_to_sheet([]);

      const service = new ImportCrittersService(mockConnection, worksheet, 1);

      sinon.stub(service, '_getTsnHeaderConfig').resolves({ validateCell: () => [] });
      sinon.stub(service, '_getAliasHeaderConfig').resolves({ validateCell: () => [] });
      sinon.stub(service, '_getSexHeaderConfig').resolves({ validateCell: () => [], setCellValue: () => 'A' });
      sinon
        .stub(service, '_getCollectionUnitDynamicHeaderConfig')
        .resolves({ validateCell: () => [], setCellValue: () => 'B' });

      sinon.stub(headerConfig, 'getDescriptionCellValidator').returns(() => []);
      sinon.stub(headerConfig, 'getWlhIDCellValidator').returns(() => []);

      const config = await service._getCSVConfig();

      expect(config.staticHeadersConfig.ITIS_TSN.validateCell).to.be.a('function');
      expect(config.staticHeadersConfig.ALIAS.validateCell).to.be.a('function');
      expect(config.staticHeadersConfig.SEX.validateCell).to.be.a('function');
      expect(config.staticHeadersConfig.SEX.setCellValue).to.be.a('function');
      expect(config.staticHeadersConfig.WLH_ID.validateCell).to.be.a('function');
      expect(config.staticHeadersConfig.DESCRIPTION.validateCell).to.be.a('function');
      expect(config.dynamicHeadersConfig?.validateCell).to.be.a('function');
      expect(config.dynamicHeadersConfig?.setCellValue).to.be.a('function');

      expect(config.ignoreDynamicHeaders).to.be.false;
    });

    it('should return a valid CSVConfig object (when errors thrown)', async () => {
      const mockConnection = getMockDBConnection();
      const worksheet = xlsx.utils.json_to_sheet([]);

      const service = new ImportCrittersService(mockConnection, worksheet, 1);

      sinon.stub(service, '_getTsnHeaderConfig').resolves({ validateCell: () => [] });
      sinon.stub(service, '_getAliasHeaderConfig').resolves({ validateCell: () => [] });
      sinon.stub(service, '_getSexHeaderConfig').resolves({ validateCell: () => [], setCellValue: () => 'A' });
      sinon.stub(service, '_getCollectionUnitDynamicHeaderConfig').rejects(new Error('Dynamic header error'));

      sinon.stub(headerConfig, 'getDescriptionCellValidator').returns(() => []);
      sinon.stub(headerConfig, 'getWlhIDCellValidator').returns(() => []);

      const config = await service._getCSVConfig();

      expect(config.staticHeadersConfig.ITIS_TSN.validateCell).to.be.a('function');
      expect(config.staticHeadersConfig.ALIAS.validateCell).to.be.a('function');
      expect(config.staticHeadersConfig.SEX.validateCell).to.be.a('function');
      expect(config.staticHeadersConfig.SEX.setCellValue).to.be.a('function');
      expect(config.staticHeadersConfig.WLH_ID.validateCell).to.be.a('function');
      expect(config.staticHeadersConfig.DESCRIPTION.validateCell).to.be.a('function');

      expect(config.dynamicHeadersConfig).to.be.undefined;
      expect(config.ignoreDynamicHeaders).to.be.true;
    });
  });

  describe('_getTsnHeaderConfig', () => {
    it('should return a valid header config object', async () => {
      const mockConnection = getMockDBConnection();
      const worksheet = xlsx.utils.json_to_sheet([{ ITIS_TSN: '1234' }]);

      const service = new ImportCrittersService(mockConnection, worksheet, 1);

      const getTaxonomyByTsnsStub = sinon
        .stub(service.platformService, 'getTaxonomyByTsns')
        .resolves([{ tsn: 1234, scientificName: 'test' }]);
      const getTsnCellValidatorStub = sinon.stub(headerConfig, 'getTsnCellValidator').returns(() => []);

      const tsnHeaderConfig = await service._getTsnHeaderConfig();

      expect(getTaxonomyByTsnsStub).to.have.been.calledOnceWithExactly(['1234']);
      expect(getTsnCellValidatorStub).to.have.been.calledOnceWithExactly(new Set([1234]));

      expect(tsnHeaderConfig.validateCell).to.be.a('function');
      expect(tsnHeaderConfig.setCellValue).to.be.undefined;
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
      expect(getCritterAliasCellValidatorStub).to.have.been.calledOnceWithExactly(
        new Set(['test']),
        service.configUtils
      );

      expect(aliasHeaderConfig.validateCell).to.be.a('function');
      expect(aliasHeaderConfig.setCellValue).to.be.undefined;
    });
  });

  describe('_getSexHeaderConfig', () => {
    it('should return a valid header config object', async () => {
      const mockConnection = getMockDBConnection();
      const worksheet = xlsx.utils.json_to_sheet([{ ITIS_TSN: 1234 }]);

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
      const getSexCellSetterStub = sinon.stub(critterConfig, 'getCritterSexCellSetter').returns(() => 'A');

      const sexHeaderConfig = await service._getSexHeaderConfig();

      expect(getTaxonMeasurementsStub).to.have.been.calledWithExactly(1234);
      expect(getSexCellValidatorStub).to.have.been.calledWithExactly(
        new NestedRecord({
          1234: { male: 'maleUUID', female: 'femaleUUID' }
        }),
        service.configUtils
      );

      expect(getSexCellSetterStub).to.have.been.calledWithExactly(
        new NestedRecord({
          1234: { male: 'maleUUID', female: 'femaleUUID' }
        }),
        service.configUtils
      );

      expect(sexHeaderConfig.validateCell).to.be.a('function');
      expect(sexHeaderConfig.setCellValue).to.be.a('function');
    });
  });

  //describe('_getCollectionUnitDynamicHeaderConfig', () => {
  //  it('should return a valid header config object', async () => {
  //    const mockConnection = getMockDBConnection();
  //    const worksheet = xlsx.utils.json_to_sheet([{ UNIT: 'unit' }]);
  //
  //    const service = new ImportCrittersService(mockConnection, worksheet, 1);
  //
  //    const getRowDictionaryStub = sinon.stub(service.configUtils, 'getRowDictionary').returns({ 1: { UNIT: 'unit' } });
  //    const getCollectionUnitCellValidatorStub = sinon
  //      .stub(critterConfig, 'getCritterCollectionUnitCellValidator')
  //      .returns(() => []);
  //
  //    const config = await service._getCollectionUnitDynamicHeaderConfig();
  //
  //    expect(getRowDictionaryStub).to.have.been.calledOnceWithExactly();
  //    expect(getCollectionUnitCellValidatorStub).to.have.been.calledOnceWithExactly(
  //      { 1: { UNIT: 'unit' } },
  //      service.configUtils
  //    );
  //
  //    expect(config.validateCell).to.be.a('function');
  //    expect(config.setCellValue).to.be.a('function');
  //  });
  //});
});
