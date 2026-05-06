import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../../__mocks__/db';
import { CaseInsensitiveMap } from '../../../utils/case-insensitive-map';
import * as validate from '../../../utils/csv-utils/csv-config-validation';
import { CSVRowState } from '../../../utils/csv-utils/csv-config-validation.interface';
import { SurveyHabitatFeatureService } from '../../habitat-feature-services/survey-habitat-feature-service';
import { IItisSearchResult, PlatformService } from '../../platform-service';
import * as taxonMap from '../utils/taxon';
import { ImportHabitatFeaturesService } from './import-habitat-features-service';
import * as habitatFeatureSamplingRowValidator from './utils/habitat-feature-sampling-row-validator';

chai.use(sinonChai);

describe('import-habitat-features-service', () => {
  beforeEach(() => {
    sinon.restore();
  });

  describe('_setHabitatFeatureStaticHeaderConfigs', () => {
    it('should set the static headers', async () => {
      const mockConnection = getMockDBConnection();
      const service = new ImportHabitatFeaturesService(mockConnection, {}, 1);

      const taxonMap = new CaseInsensitiveMap<string, IItisSearchResult>();

      const mockCodeRepository = {
        getHabitatFeatureTypes: sinon.stub().resolves([{ id: 'CODE', name: 'NAME', description: 'DESC' }])
      };

      await service._setHabitatFeatureStaticHeaderConfigs(taxonMap, mockCodeRepository as any);

      expect(mockCodeRepository.getHabitatFeatureTypes).to.have.been.calledOnce;

      expect(service.utils.config.staticHeadersConfig).to.have.keys([
        'HABITAT_FEATURE_TYPE',
        'COUNT',
        'LATITUDE',
        'LONGITUDE',
        'OBSERVED_DATE',
        'OBSERVED_TIME',
        'SAMPLE_PERIOD',
        'SAMPLE_SITE',
        'METHOD_TECHNIQUE',
        'SPECIES',
        'COMMENT'
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
            OBSERVED_TIME: '12:00:00',
            SAMPLE_PERIOD: '2021-01-01 - 2021-01-02',
            SAMPLE_SITE: 'Site B',
            METHOD_TECHNIQUE: 'Fishing',
            SPECIES: 'alces; alces alces',
            COMMENT: 'comment',
            [CSVRowState]: {
              sample_period_id: 1,
              taxon: [
                {
                  itis_tsn: 1,
                  itis_scientific_name: 'alces'
                },
                {
                  itis_tsn: 2,
                  itis_scientific_name: 'alces alces'
                }
              ]
            }
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
          survey_sample_period_id: 1,
          survey_habitat_feature_taxons: [
            {
              itis_tsn: 1,
              itis_scientific_name: 'alces',
              comment: 'comment'
            },
            {
              itis_tsn: 2,
              itis_scientific_name: 'alces alces',
              comment: 'comment'
            }
          ]
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

      const getUniqueArrayCellValuesStub = sinon.stub(service.utils, 'getUniqueArrayCellValues');
      const getConfigStub = sinon.stub(service.utils, 'getConfig');
      const setHabitatFeatureStaticHeaderConfigsStub = sinon.stub(service, '_setHabitatFeatureStaticHeaderConfigs');
      const setHabitatFeatureRowValidatorsStub = sinon.stub(service, '_setHabitatFeatureRowValidators');
      const getTaxonMapStub = sinon.stub(taxonMap, 'getTaxonMap');

      const taxonMapMock = new CaseInsensitiveMap<string, IItisSearchResult>();

      setHabitatFeatureStaticHeaderConfigsStub.resolves();
      setHabitatFeatureRowValidatorsStub.resolves();

      getUniqueArrayCellValuesStub.returns(['1', 'alces']);
      getTaxonMapStub.resolves(taxonMapMock);

      getConfigStub.returns({} as any);

      const result = await service.getCSVConfig();

      expect(getUniqueArrayCellValuesStub).to.have.been.calledOnce;
      expect(getTaxonMapStub.getCall(0).args[0]).to.be.deep.equal(['1', 'alces']);
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

      const getHabitatFeatureSamplingInformationRowValidatorStub = sinon
        .stub(habitatFeatureSamplingRowValidator, 'getHabitatFeatureSamplingInformationRowValidator')
        .returns(() => []);

      const mockSamplePeriods = [{ survey_sample_period_id: 1 }];
      const samplePeriodServiceStub: any = {
        getSamplePeriodsForSurvey: sinon.stub().resolves(mockSamplePeriods)
      };

      const mockSampleSites = [{ survey_sample_site_id: 2 }];
      const sampleSiteServiceStub: any = {
        getSampleSitesForSurveyId: sinon.stub().resolves(mockSampleSites)
      };

      const mockMethodTechniques = [{ method_technique_id: 3 }];
      const methodTechniqueServiceStub: any = {
        getTechniquesForSurveyId: sinon.stub().resolves(mockMethodTechniques)
      };

      await service._setHabitatFeatureRowValidators(
        samplePeriodServiceStub,
        sampleSiteServiceStub,
        methodTechniqueServiceStub
      );

      expect(getHabitatFeatureSamplingInformationRowValidatorStub).to.have.been.calledOnceWithExactly({
        samplePeriods: mockSamplePeriods,
        sampleSites: mockSampleSites,
        methodTechniques: mockMethodTechniques,
        utils: service.utils,
        samplePeriodId: service.samplePeriodId
      });

      expect(service.utils.config.rowValidators).to.be.an('array').and.to.have.length(1);
    });
  });
});
