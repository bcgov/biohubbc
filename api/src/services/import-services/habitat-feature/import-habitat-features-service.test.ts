import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { CaseInsensitiveMap } from '../../../utils/case-insensitive-map';
import * as validate from '../../../utils/csv-utils/csv-config-validation';
import * as taxonRowValidator from '../../../utils/csv-utils/row-validators/taxon-row-validator';
import { getMockDBConnection } from '../../../__mocks__/db';
import { SurveyHabitatFeatureService } from '../../habitat-feature-services/survey-habitat-feature-service';
import { IItisSearchResult, PlatformService } from '../../platform-service';
import * as taxonMap from '../utils/taxon';
import { ImportHabitatFeaturesService } from './import-habitat-features-service';

chai.use(sinonChai);

describe('import-habitat-features-service', () => {
  beforeEach(() => {
    sinon.restore();
  });

  describe('_setHabitatFeatureStaticHeaderConfigs', () => {
    it('should set the static headers', async () => {
      const mockConnection = getMockDBConnection();
      const service = new ImportHabitatFeaturesService(mockConnection, {}, 1);

      const mockCodeRepository = {
        getHabitatFeatureTypes: sinon.stub().resolves([{ id: 'CODE', name: 'NAME', description: 'DESC' }])
      };

      await service._setHabitatFeatureStaticHeaderConfigs(mockCodeRepository as any);

      expect(mockCodeRepository.getHabitatFeatureTypes).to.have.been.calledOnce;

      expect(service.utils.config.staticHeadersConfig).to.have.keys([
        'HABITAT_FEATURE_TYPE',
        'COUNT',
        'LATITUDE',
        'LONGITUDE',
        'OBSERVED_DATE',
        'OBSERVED_TIME',
        'SPECIES'
      ]);
    });
  });

  describe('importCSVWorksheet', () => {
    it('should return errors early', async () => {
      const mockConnection = getMockDBConnection();
      const service = new ImportHabitatFeaturesService(mockConnection, {}, 1);

      const getCSVConfigStub = sinon.stub(service, 'getCSVConfig').resolves({} as any);
      const validateCSVWorksheetStub = sinon.stub(validate, 'validateCSVWorksheet').returns({
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

      expect(getCSVConfigStub).to.have.been.calledOnce;
      expect(validateCSVWorksheetStub).to.have.been.calledOnce;

      expect(result).to.be.an('array');
      expect(result.length).to.be.equal(1);
    });

    it('should grab the habitat features from the row', async () => {
      const mockConnection = getMockDBConnection();
      const service = new ImportHabitatFeaturesService(mockConnection, {}, 1);

      const getCSVConfigStub = sinon.stub(service, 'getCSVConfig').resolves({} as any);
      const insertSurveyHabitatFeaturesStub = sinon.stub(
        SurveyHabitatFeatureService.prototype,
        'insertSurveyHabitatFeatures'
      );
      const validateCSVWorksheetStub = sinon.stub(validate, 'validateCSVWorksheet').returns({
        errors: [],
        rows: [
          {
            HABITAT_FEATURE_TYPE: 1,
            COUNT: 3,
            LATITUDE: 1,
            LONGITUDE: 2,
            OBSERVED_DATE: '2021-01-01',
            OBSERVED_TIME: '12:00:00'
          }
        ]
      });

      const result = await service.importCSVWorksheet();

      expect(getCSVConfigStub).to.have.been.calledOnce;
      expect(validateCSVWorksheetStub).to.have.been.calledOnce;

      expect(insertSurveyHabitatFeaturesStub).to.have.been.calledOnceWithExactly(1, [
        {
          habitat_feature_type_id: 1,
          count: 3,
          latitude: 1,
          longitude: 2,
          observed_date: '2021-01-01',
          observed_time: '12:00:00',
          survey_habitat_feature_taxons: []
        }
      ]);

      expect(result).to.be.an('array');
      expect(result.length).to.be.equal(0);
    });
  });

  describe('getCSVConfig', () => {
    it('should return the CSV config', async () => {
      const mockConnection = getMockDBConnection();
      const service = new ImportHabitatFeaturesService(mockConnection, {}, 1);

      const getUniqueCellValues = sinon.stub(service.utils, 'getUniqueCellValues');
      const getConfigStub = sinon.stub(service.utils, 'getConfig');
      const setHabitatFeatureStaticHeaderConfigsStub = sinon.stub(service, '_setHabitatFeatureStaticHeaderConfigs');
      const setHabitatFeatureRowValidatorsStub = sinon.stub(service, '_setHabitatFeatureRowValidators');
      const getTaxonMapStub = sinon.stub(taxonMap, 'getTaxonMap');

      const taxonMapMock = new CaseInsensitiveMap<string, IItisSearchResult>();

      setHabitatFeatureStaticHeaderConfigsStub.resolves();
      setHabitatFeatureRowValidatorsStub.resolves();

      getUniqueCellValues.returns([1, 'alces']);
      getTaxonMapStub.resolves(taxonMapMock);

      getConfigStub.returns({} as any);

      const result = await service.getCSVConfig();

      expect(getUniqueCellValues).to.have.been.calledOnce;
      expect(getTaxonMapStub.getCall(0).args[0]).to.be.deep.equal([1, 'alces']);
      expect(getTaxonMapStub.getCall(0).args[1]).to.be.an.instanceof(PlatformService);

      expect(setHabitatFeatureStaticHeaderConfigsStub).to.have.been.calledOnce;
      expect(setHabitatFeatureRowValidatorsStub).to.have.been.calledOnce;

      expect(result).to.be.deep.equal({});
    });
  });

  describe('_setHabitatFeatureRowValidators', () => {
    it('should set the row validators', async () => {
      const mockConnection = getMockDBConnection();
      const service = new ImportHabitatFeaturesService(mockConnection, {}, 1);

      const taxonRowValidatorStub = sinon.stub(taxonRowValidator, 'getTaxonRowValidator').returns(() => []);
      const taxonMap = new CaseInsensitiveMap<string, IItisSearchResult>();

      await service._setHabitatFeatureRowValidators(taxonMap);

      expect(taxonRowValidatorStub).to.have.been.calledOnceWithExactly(taxonMap, service.utils, 'SPECIES', {
        optional: true
      });

      expect(service.utils.config.rowValidators).to.be.an('array').and.to.have.length(1);
    });
  });
});
